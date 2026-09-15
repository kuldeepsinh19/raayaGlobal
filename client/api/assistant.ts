/**
 * POST /api/assistant — the site-wide buyer assistant.
 *
 * Answers questions about what Raaya Global sells, grounded strictly in the
 * real catalogue, and routes anything commercial to the enquiry form.
 *
 * The interesting constraint is what it must REFUSE. An export conversation
 * gets to price, minimum order quantity, certification and shipping date within
 * about two messages — those are the first things a serious buyer asks. Every
 * one of them is a commitment only the company can make, and a model that
 * guesses at them on a company's own website is producing quotes the buyer will
 * reasonably expect to be honoured.
 *
 * So there are two layers, because a prompt instruction is guidance, not a
 * control:
 *   1. _lib/guardrails.ts COMMERCIAL_RULES in the system prompt.
 *   2. enforce() on the way out — output that states a price or a certification
 *      anyway is replaced with the handoff, and the block is logged.
 *
 * With no API key the endpoint returns `available: false` and the widget never
 * renders, rather than putting a broken chat box on a client's site.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getClient, isConfigured, MODEL, EFFORT, logUsage } from './_lib/anthropic';
import { catalogueForPrompt, contactForPrompt, COMPANY_NAME } from './_lib/catalogue';
import { COMMERCIAL_RULES, enforce } from './_lib/guardrails';
import { handlePreamble, clamp, clientIp, rateLimit, LIMITS } from './_lib/http';

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

function buildSystemPrompt(): string {
  return `You are the product assistant on the website of ${COMPANY_NAME}, an agricultural exporter based in India that ships fruits, vegetables, grains and spices worldwide.

You are talking to a potential buyer — often an importer, distributor or wholesaler, frequently not a native English speaker. Be brief, concrete and warm. Two or three sentences is usually right. Never use bullet points unless listing products.

${COMMERCIAL_RULES}

CATALOGUE (id, name, category, tagline) — this is everything the company lists:
${catalogueForPrompt()}

HOW TO REACH A HUMAN:
${contactForPrompt()}

If a buyer seems ready to transact, your single most useful move is to tell them exactly what to put in the enquiry form so the reply is fast and accurate: product, quantity, destination port or country, and target shipment month. That converts a vague conversation into a quotable enquiry.`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handlePreamble(req, res)) return;

  // Widget asks first; when the key is absent it never renders at all.
  if (!isConfigured()) {
    return res.status(200).json({
      available: false,
      reason: 'assistant is not configured on this deployment',
    });
  }

  const limit = rateLimit(`assistant:${clientIp(req)}`, 8, 12);
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfterSeconds));
    return res.status(429).json({
      available: true,
      reply: 'Just a moment — too many messages at once. Try again shortly.',
      rateLimited: true,
    });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const rawHistory = Array.isArray(body.messages) ? body.messages : [];

  // Keep the last N turns, capped in length. Old turns are dropped rather than
  // summarised: this is a product Q&A widget, not a long-running conversation,
  // and an unbounded history on a public endpoint is an unbounded bill.
  const history: ChatTurn[] = rawHistory
    .filter(
      (m): m is { role: string; content: string } =>
        Boolean(m) && typeof m === 'object' && 'role' in m && 'content' in m
    )
    .map((m) => ({
      role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: clamp(m.content, LIMITS.message),
    }))
    .filter((m) => m.content.length > 0)
    .slice(-LIMITS.historyTurns);

  if (history.length === 0 || history[history.length - 1].role !== 'user') {
    return res.status(422).json({
      available: true,
      errors: [{ field: 'messages', message: 'Send a message to start.' }],
    });
  }

  const startedAt = Date.now();
  try {
    const response = await getClient().messages.create({
      model: MODEL,
      max_tokens: 700,
      system: [
        { type: 'text', text: buildSystemPrompt(), cache_control: { type: 'ephemeral' } },
      ],
      output_config: { effort: EFFORT },
      messages: history,
    });

    logUsage('assistant', response.usage, startedAt);

    if (response.stop_reason === 'refusal') {
      return res.status(200).json({
        available: true,
        reply:
          'Sorry, I cannot help with that one. For anything about products or orders, ' +
          'the enquiry form is the fastest route to a real answer.',
      });
    }

    // Plain narrowing on the discriminated union — the SDK's TextBlock carries
    // more fields than a hand-written predicate would capture.
    const parts: string[] = [];
    for (const block of response.content) {
      if (block.type === 'text') parts.push(block.text);
    }
    const raw = parts.join('\n').trim();

    // Second layer: check what the model actually said, not what it was told.
    const checked = enforce(raw);

    return res.status(200).json({
      available: true,
      reply: checked.text,
      guardrailTriggered: !checked.safe,
    });
  } catch (error) {
    console.error('[assistant] failed:', (error as Error).message);
    return res.status(503).json({
      available: true,
      reply:
        'I am having trouble right now. Please use the enquiry form and the team will reply directly.',
      error: true,
    });
  }
}
