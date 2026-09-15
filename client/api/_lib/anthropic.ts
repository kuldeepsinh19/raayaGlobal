/**
 * Shared Anthropic client, model configuration and cost accounting.
 *
 * Two things worth knowing before reading further:
 *
 * 1. `isConfigured()` is checked by every caller BEFORE it does anything, and
 *    every AI feature in this codebase has a defined behaviour when it returns
 *    false. Search falls back to keyword matching, the assistant hides itself,
 *    and the enquiry email goes out exactly as it did before any of this
 *    existed. A missing API key degrades the site; it must never break it.
 *
 * 2. Cost is measured, not estimated. These endpoints are public on a small
 *    business's website, so "what does one assistant turn cost" is a number the
 *    owner may need to act on, and it is logged on every call.
 */

import Anthropic from '@anthropic-ai/sdk';

export const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5';

export type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

/**
 * Defaults to `low`. These are short, well-specified tasks — match a query to a
 * product list, answer a catalogue question, draft a reply — not research. Low
 * effort keeps a public widget responsive and cheap; raise it per-deployment if
 * answer quality ever warrants the trade.
 */
export const EFFORT: Effort = (process.env.ANTHROPIC_EFFORT as Effort) || 'low';

/**
 * USD per million tokens.
 *
 * Note for whoever deploys this: Opus is the default because it gives the best
 * answers, but this is a public widget anyone on the internet can talk to. If
 * traffic grows, `ANTHROPIC_MODEL=claude-haiku-4-5` is a one-variable change
 * that cuts the per-turn cost by roughly 5x. See the README.
 */
const PRICING: Record<string, { input: number; output: number }> = {
  'claude-opus-5': { input: 5.0, output: 25.0 },
  'claude-sonnet-5': { input: 2.0, output: 10.0 },
  'claude-haiku-4-5': { input: 1.0, output: 5.0 },
};

let client: Anthropic | null = null;

/** True when an API key is present. Every AI feature checks this first. */
export function isConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getClient(): Anthropic {
  if (!isConfigured()) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }
  if (!client) client = new Anthropic();
  return client;
}

/**
 * Structurally compatible with the SDK's Usage type. The cache fields are
 * `number | null` there, not optional — restoring type-checking on api/ is what
 * surfaced that, on the very first build.
 */
export interface Usage {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
}

/** Dollar cost of one API response. */
export function costOf(usage: Usage | undefined, model: string = MODEL): number {
  if (!usage) return 0;
  const rate = PRICING[model] || PRICING['claude-opus-5'];
  const input = usage.input_tokens ?? 0;
  const output = usage.output_tokens ?? 0;
  const cacheRead = usage.cache_read_input_tokens ?? 0;
  const cacheWrite = usage.cache_creation_input_tokens ?? 0;

  return (
    (input * rate.input +
      output * rate.output +
      cacheRead * rate.input * 0.1 +
      cacheWrite * rate.input * 1.25) /
    1_000_000
  );
}

/** One structured log line per AI call, so spend is visible in Vercel logs. */
export function logUsage(label: string, usage: Usage | undefined, startedAt: number): void {
  const cost = costOf(usage);
  console.log(
    JSON.stringify({
      event: 'ai_call',
      label,
      model: MODEL,
      input_tokens: usage?.input_tokens ?? 0,
      output_tokens: usage?.output_tokens ?? 0,
      cost_usd: Number(cost.toFixed(6)),
      latency_ms: Date.now() - startedAt,
    })
  );
}
