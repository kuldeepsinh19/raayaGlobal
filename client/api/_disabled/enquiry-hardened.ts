/**
 * POST /api/enquiry — the only endpoint on this site that makes money.
 *
 * ORDERING IS THE WHOLE DESIGN. Read this before changing anything below.
 *
 * The enquiry email is composed and sent BEFORE any model call, and the AI
 * draft is generated afterwards as a separate, optional, best-effort step. That
 * ordering is not stylistic. It means no amount of AI failure — no key, an
 * outage, a timeout, a malformed response, a rate limit — can cost the business
 * a lead. The AI can only ever add something on top of a lead that has already
 * been delivered.
 *
 * What this replaced: the previous version returned HTTP 500 when nodemailer
 * threw, and stored nothing anywhere. Gmail caps a free account at roughly 500
 * sends a day and app passwords expire without warning, so a bad afternoon
 * meant enquiries were simply gone — no record, no retry, no way to know how
 * many. Now a failed send logs the full enquiry as structured JSON, so it is
 * recoverable from the Vercel logs rather than lost.
 *
 * On the status code: once we hold a valid enquiry, the buyer gets a 201. From
 * their side it genuinely did succeed — their details reached us. Whether our
 * mail provider then cooperated is our problem to fix, not a reason to tell a
 * buyer their message vanished and hope they try again.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';

import { getClient, isConfigured, MODEL, EFFORT, logUsage } from '../_lib/anthropic.js';
import { COMMERCIAL_RULES, enforce } from '../_lib/guardrails.js';
import { COMPANY_NAME } from '../_lib/catalogue.js';
import {
  handlePreamble,
  clamp,
  clientIp,
  rateLimit,
  isHoneypotTripped,
  LIMITS,
} from '../_lib/http.js';

/**
 * The AI draft is capped well inside the platform's default function timeout,
 * so the enquiry response is never held up waiting on a model call. An explicit
 * `config.maxDuration` is deliberately not set here: it is plan-dependent on
 * Vercel, and a value the plan does not allow is a deployment-time failure on
 * the one endpoint that must never be down.
 */
const AI_DRAFT_TIMEOUT_MS = 6000;

interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  productInterest: string;
  message: string;
  receivedAt: string;
}

interface FieldError {
  field: string;
  message: string;
}

/**
 * Per-field validation.
 *
 * The previous version returned the first error only, as `field: 'general'` —
 * and the frontend maps errors onto fields by name, so `general` matched
 * nothing and the buyer saw a form that rejected them without saying why.
 */
function validate(input: Omit<Enquiry, 'id' | 'receivedAt'>): FieldError[] {
  const errors: FieldError[] = [];

  if (!input.name) errors.push({ field: 'name', message: 'Name is required' });
  if (!input.phone) errors.push({ field: 'phone', message: 'Phone number is required' });
  if (!input.email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.push({ field: 'email', message: 'Enter a valid email address' });
  }
  if (!input.productInterest) {
    errors.push({ field: 'productInterest', message: 'Select a product category' });
  }
  if (!input.message) errors.push({ field: 'message', message: 'Message is required' });

  return errors;
}

function buildTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
  });
}

function enquiryEmailBody(enquiry: Enquiry): string {
  return `
New enquiry received on the ${COMPANY_NAME} website.

Reference:        ${enquiry.id}
Name:             ${enquiry.name}
Phone:            ${enquiry.phone}
Email:            ${enquiry.email}
Product Interest: ${enquiry.productInterest}
Received At:      ${enquiry.receivedAt}

Message:
${enquiry.message}
`.trim();
}

const DraftSchema = z.object({
  detected_language: z
    .string()
    .describe('The language the buyer wrote in, in English (e.g. "English", "Arabic", "French").'),
  buyer_summary: z
    .string()
    .describe('One sentence for the owner: what this buyer appears to want.'),
  subject: z.string().describe('Subject line for the reply email.'),
  body: z
    .string()
    .describe(
      'The reply, written in the same language the buyer used. Professional, warm, concise. ' +
        'Signed off as the team, not a named person.'
    ),
  confirm_before_sending: z
    .array(z.string())
    .describe('Short list of things the owner must verify or fill in before sending.'),
});

const DRAFT_SYSTEM_PROMPT = `You draft reply emails for ${COMPANY_NAME}, an agricultural exporter in India, responding to enquiries from international buyers.

The owner reads your draft, edits it, and sends it. You are saving them the blank page, not speaking for them.

${COMMERCIAL_RULES}

Write the reply in the SAME LANGUAGE the buyer wrote in. Many buyers are in the Gulf, Africa and Europe and did not write in English; replying in their language is the single thing most likely to win the conversation.

A good reply: thanks them, shows you understood the specific request, confirms the product is something the company handles, asks for the two or three details still missing that are needed to quote accurately (volume, destination port, target shipment month, packaging preference), and says terms will follow. Six sentences at most.

Do not invent anything the enquiry did not say. If the buyer did not name a quantity, ask for it — do not assume one.`;

/** Wrap a promise in a timeout so a slow model call cannot hold up the response. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timed out')), ms)),
  ]);
}

/**
 * Best-effort AI draft. Every failure path returns null and is logged; none of
 * them can affect the enquiry that has already been delivered.
 */
async function generateDraft(enquiry: Enquiry): Promise<string | null> {
  if (!isConfigured()) return null;

  const startedAt = Date.now();
  try {
    const response = await withTimeout(
      getClient().messages.parse({
        model: MODEL,
        max_tokens: 1200,
        system: [
          { type: 'text', text: DRAFT_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
        ],
        output_config: { effort: EFFORT, format: zodOutputFormat(DraftSchema) },
        messages: [
          {
            role: 'user',
            content: `Draft a reply to this enquiry:

From:             ${enquiry.name} <${enquiry.email}>
Phone:            ${enquiry.phone}
Product interest: ${enquiry.productInterest}

Their message:
${enquiry.message}`,
          },
        ],
      }),
      AI_DRAFT_TIMEOUT_MS
    );

    logUsage('enquiry_draft', response.usage, startedAt);

    const draft = response.parsed_output;
    if (!draft) return null;

    // Same guardrail as the assistant: a draft that quotes a price is worse
    // than no draft, because the owner may send it without re-reading.
    const checkedBody = enforce(draft.body);

    return `
DRAFT REPLY — review before sending. Generated by AI, not sent to anyone.

Enquiry ref:      ${enquiry.id}
Buyer wrote in:   ${draft.detected_language}
What they want:   ${draft.buyer_summary}
${checkedBody.safe ? '' : '\n[!] The draft mentioned commercial terms and was replaced with a neutral holding reply.\n'}
--- Subject -------------------------------------------------
${draft.subject}

--- Body ----------------------------------------------------
${checkedBody.text}

--- Check before sending ------------------------------------
${draft.confirm_before_sending.map((item) => `  - ${item}`).join('\n')}
`.trim();
  } catch (error) {
    console.warn('[enquiry] AI draft skipped:', (error as Error).message);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handlePreamble(req, res)) return;

  const body = (req.body ?? {}) as Record<string, unknown>;

  // Bots fill every field they find, including ones hidden from humans. Answer
  // with success rather than an error — telling a bot it was caught just earns
  // a retry with the field omitted.
  if (isHoneypotTripped(body)) {
    console.log(JSON.stringify({ event: 'honeypot_blocked', ip: clientIp(req) }));
    return res.status(201).json({ success: true, id: crypto.randomUUID() });
  }

  const input = {
    name: clamp(body.name, LIMITS.name),
    phone: clamp(body.phone, LIMITS.phone),
    email: clamp(body.email, LIMITS.email),
    productInterest: clamp(body.productInterest, 40),
    message: clamp(body.message, LIMITS.message),
  };

  const errors = validate(input);
  if (errors.length > 0) {
    return res.status(422).json({ success: false, errors });
  }

  const limit = rateLimit(`enquiry:${clientIp(req)}`, 5, 5);
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfterSeconds));
    return res.status(429).json({
      success: false,
      errors: [{ field: 'general', message: 'Too many submissions. Please try again shortly.' }],
    });
  }

  const enquiry: Enquiry = {
    ...input,
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
  };

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;
  const recipient = process.env.RECIPIENT_EMAIL;

  // Whatever happens next, the enquiry now exists in the logs. This single line
  // is the difference between a bad mail day costing the business nothing and
  // costing it every lead that came in during it.
  console.log(JSON.stringify({ event: 'enquiry_received', enquiry }));

  if (!gmailUser || !gmailPass || !recipient) {
    console.error(
      JSON.stringify({
        event: 'enquiry_undelivered',
        reason: 'mail env vars missing (GMAIL_USER / GMAIL_PASS / RECIPIENT_EMAIL)',
        enquiry,
      })
    );
    return res.status(201).json({ success: true, id: enquiry.id, delivery: 'logged' });
  }

  const transporter = buildTransport();

  // ---- STEP 1: deliver the lead. Nothing above this line involves AI. ----
  let delivered = false;
  try {
    await transporter.sendMail({
      from: `"${COMPANY_NAME} Website" <${gmailUser}>`,
      to: recipient,
      replyTo: enquiry.email,
      subject: `New Enquiry from ${enquiry.name} - ${enquiry.productInterest}`,
      text: enquiryEmailBody(enquiry),
    });
    delivered = true;
  } catch (error) {
    console.error(
      JSON.stringify({
        event: 'enquiry_undelivered',
        reason: (error as Error).message,
        enquiry,
      })
    );
  }

  // ---- STEP 2: optional enrichment. Cannot affect step 1. ----
  const draft = await generateDraft(enquiry);
  if (draft && delivered) {
    try {
      await transporter.sendMail({
        from: `"${COMPANY_NAME} Website" <${gmailUser}>`,
        to: recipient,
        replyTo: enquiry.email,
        subject: `Draft reply — ${enquiry.name} (${enquiry.id.slice(0, 8)})`,
        text: draft,
      });
    } catch (error) {
      // A missing draft is an inconvenience. It is never an error worth
      // surfacing to the buyer, whose enquiry was delivered in step 1.
      console.warn('[enquiry] draft email failed:', (error as Error).message);
    }
  }

  return res.status(201).json({
    success: true,
    id: enquiry.id,
    delivery: delivered ? 'sent' : 'logged',
  });
}
