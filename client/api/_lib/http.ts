/**
 * Shared HTTP concerns for the three public endpoints: CORS, method checks,
 * input caps, and best-effort rate limiting.
 *
 * On rate limiting, honestly: serverless instances do not share memory, so a
 * per-instance bucket is a speed bump, not a wall. Under load Vercel spins up
 * more instances and each gets a fresh allowance. It still meaningfully blunts
 * the common case — a single script hammering one warm instance — and it costs
 * nothing. Doing this properly needs a shared store (Vercel KV, Upstash), which
 * is a deliberate non-goal here since the brief was zero new infrastructure.
 * It is documented rather than quietly overstated.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export const LIMITS = {
  /** Enquiry message and assistant turns. Long enough to be useful, short enough to bound cost. */
  message: 2000,
  name: 120,
  email: 200,
  phone: 40,
  searchQuery: 200,
  /** Assistant turns kept in context. Older turns are dropped, not summarised. */
  historyTurns: 8,
};

interface Bucket {
  tokens: number;
  updatedAt: number;
}

const buckets = new Map<string, Bucket>();

/** Client IP, trusting Vercel's proxy headers. */
export function clientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  if (Array.isArray(forwarded)) return forwarded[0];
  return req.socket?.remoteAddress || 'unknown';
}

/**
 * Token bucket. Returns true when the request is allowed.
 * @param capacity  burst allowance
 * @param refillPerMinute  sustained rate
 */
export function rateLimit(
  key: string,
  capacity: number,
  refillPerMinute: number
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: capacity, updatedAt: now };

  const elapsedMinutes = (now - bucket.updatedAt) / 60000;
  bucket.tokens = Math.min(capacity, bucket.tokens + elapsedMinutes * refillPerMinute);
  bucket.updatedAt = now;

  if (bucket.tokens < 1) {
    buckets.set(key, bucket);
    const retryAfterSeconds = Math.ceil((1 - bucket.tokens) / (refillPerMinute / 60));
    return { allowed: false, retryAfterSeconds };
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);

  // Keep the map from growing without bound on a long-lived instance.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (now - b.updatedAt > 3600_000) buckets.delete(k);
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function applyCors(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Handle preflight and reject non-POST.
 * @returns true when the caller should stop processing.
 */
export function handlePreamble(req: VercelRequest, res: VercelResponse): boolean {
  applyCors(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return true;
  }
  return false;
}

/** Trim and hard-cap a string field. */
export function clamp(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/**
 * Honeypot: a field hidden from humans by CSS. Bots fill every input they find,
 * so a non-empty value is a very strong bot signal. We return success rather
 * than an error — telling a bot it was detected just invites a retry with the
 * field omitted.
 */
export function isHoneypotTripped(body: Record<string, unknown>): boolean {
  const value = body['company_website'];
  return typeof value === 'string' && value.trim().length > 0;
}
