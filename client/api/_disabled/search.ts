/**
 * POST /api/search — natural-language product search.
 *
 * A buyer types "bulk onions for the Gulf market" or "something with a long
 * shelf life" and gets matching products from the real catalogue. The category
 * filter that already exists on /products handles "show me fruits"; this
 * handles the way buyers actually describe what they want.
 *
 * Three design decisions worth stating:
 *
 * - ONE CALL ON SUBMIT, never per keystroke. Search-as-you-type would be a
 *   model call per character on a public endpoint. The UI submits on Enter.
 *
 * - THE RESULT IS ALWAYS PRODUCTS, never prose. The model returns ids, which
 *   are then resolved against the real catalogue here. An id the catalogue does
 *   not contain is dropped, so a hallucinated product cannot reach a buyer —
 *   the model is choosing from a list, not generating from memory.
 *
 * - IT WORKS WITH NO API KEY. Falls back to keyword matching. A buyer never
 *   sees an error where a search box should be.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';

import { getClient, isConfigured, MODEL, EFFORT, logUsage } from '../_lib/anthropic.js';
import { catalogueForPrompt, keywordSearch, productById } from '../_lib/catalogue.js';
import type { Product } from '../_lib/catalogue.js';
import { handlePreamble, clamp, clientIp, rateLimit, LIMITS } from '../_lib/http.js';

const SearchResultSchema = z.object({
  product_ids: z
    .array(z.number())
    .describe('Ids of matching products from the catalogue, best match first. Empty if nothing fits.'),
  summary: z
    .string()
    .describe(
      'One short sentence to the buyer explaining the selection, or saying plainly that nothing in ' +
        'the catalogue matches. No pricing, no availability.'
    ),
});

const SYSTEM_PROMPT = `You match buyer enquiries to products in an agricultural export catalogue.

You will be given the full catalogue as lines of: id, name, category, tagline.

Return the ids of products that genuinely fit the buyer's description, best match first, and one short sentence explaining the selection.

Rules:
- Only return ids that appear in the catalogue. Never invent a product.
- Match on intent, not just keywords. "Something for a hot climate with a long shelf life" should surface hardy items like onions, grains and spices rather than soft fruit.
- A destination or market ("Gulf", "Europe", "Middle East") is a hint about demand and shipping tolerance, not a filter — do not exclude products simply because a country was mentioned.
- If genuinely nothing fits, return an empty list and say so. An honest empty result is more useful to a buyer than a padded one.
- Never mention price, availability, minimum quantities, certifications or delivery times. You do not have that information.
- Return at most 12 ids.`;

/** Normalised-query cache. Buyers on a small site repeat the same searches. */
const cache = new Map<string, { expiresAt: number; payload: unknown }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

interface SearchResponse {
  success: true;
  mode: 'ai' | 'keyword';
  summary: string;
  count: number;
  products: Product[];
  note?: string;
}

function buildResponse(products: Product[], summary: string, mode: 'ai' | 'keyword'): SearchResponse {
  return { success: true, mode, summary, count: products.length, products };
}

/** Deterministic search. Always returns a usable result, never an error. */
function keywordFallback(query: string, note: string): SearchResponse {
  const matched = keywordSearch(query);
  const summary =
    matched.length > 0
      ? `Showing ${matched.length} product${matched.length === 1 ? '' : 's'} matching "${query}".`
      : `Nothing in the catalogue matches "${query}". Try a category, or send an enquiry.`;
  return { ...buildResponse(matched, summary, 'keyword'), note };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handlePreamble(req, res)) return;

  const body = (req.body ?? {}) as Record<string, unknown>;
  const query = clamp(body.query, LIMITS.searchQuery);

  if (!query) {
    return res.status(422).json({
      success: false,
      errors: [{ field: 'query', message: 'Enter what you are looking for' }],
    });
  }

  const key = query.toLowerCase().replace(/\s+/g, ' ');

  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return res.status(200).json({ ...(cached.payload as object), cached: true });
  }

  // No key configured: keyword search, which is a real result, not an error.
  if (!isConfigured()) {
    return res.status(200).json(keywordFallback(query, 'keyword search'));
  }

  // Rate limit only the paid path; keyword search above costs nothing.
  const limit = rateLimit(`search:${clientIp(req)}`, 10, 20);
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfterSeconds));
    return res.status(200).json(keywordFallback(query, 'keyword search (busy)'));
  }

  const startedAt = Date.now();
  try {
    const response = await getClient().messages.parse({
      model: MODEL,
      max_tokens: 1024,
      system: [
        { type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
      ],
      output_config: { effort: EFFORT, format: zodOutputFormat(SearchResultSchema) },
      messages: [
        {
          role: 'user',
          content: `CATALOGUE (id, name, category, tagline):\n${catalogueForPrompt()}\n\nBUYER IS LOOKING FOR:\n${query}`,
        },
      ],
    });

    logUsage('search', response.usage, startedAt);

    const parsed = response.parsed_output;
    if (!parsed) throw new Error('no structured output returned');

    // Resolve ids against the real catalogue. Anything unknown is dropped —
    // this is what makes a hallucinated product impossible to surface.
    const matched = parsed.product_ids
      .map((id) => productById(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    const payload = buildResponse(matched, parsed.summary, 'ai');
    cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, payload });
    return res.status(200).json(payload);
  } catch (error) {
    console.error('[search] falling back to keyword match:', (error as Error).message);
    return res.status(200).json(keywordFallback(query, 'keyword search'));
  }
}
