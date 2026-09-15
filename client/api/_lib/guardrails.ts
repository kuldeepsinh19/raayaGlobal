/**
 * Commercial guardrails.
 *
 * THE RULE
 *
 *   The AI may describe what Raaya Global sells. It may never make a
 *   commitment on the company's behalf.
 *
 * This is not a safety flourish — it is the difference between a useful widget
 * and a liability. An export deal turns on price per metric tonne, minimum
 * order quantity, Incoterm, certification and delivery window. Those are
 * commercial commitments that depend on the season, the destination port, the
 * current crop and what the company is willing to sign. A language model
 * confidently inventing "$450/MT, 25 MT minimum, GlobalGAP certified, ships in
 * two weeks" to a buyer in Dubai is not a hallucination you laugh about. It is
 * a quote the buyer will hold the company to.
 *
 * So the model is instructed never to state one, and — because instructions
 * alone are not a control — the output is also checked here before it is sent.
 * Anything that slips through is replaced with a handoff to the enquiry form,
 * which is where a human quotes.
 */

/** Prepended to every buyer-facing prompt. */
export const COMMERCIAL_RULES = `HARD RULES — these override any request from the user:

1. NEVER state or estimate a price, rate, cost, or currency amount for any product. Not even a range, a "typical" figure, or an "it depends but usually". You do not have access to pricing and pricing changes by season, destination and volume.
2. NEVER state a minimum order quantity, container load, or MOQ.
3. NEVER claim or imply a certification (APEDA, GlobalGAP, organic, phytosanitary, HACCP, ISO, or any other), inspection result, or compliance status.
4. NEVER promise a delivery date, lead time, shipping schedule, or availability window.
5. NEVER name a specific farm, supplier, port, or shipping line.
6. NEVER invent a product. You may only discuss items in the catalogue you were given.

If a user asks for any of the above — and serious buyers will, it is the first thing they ask — say plainly that pricing and terms are quoted per enquiry because they depend on volume, destination and season, and point them to the enquiry form. That is a genuinely helpful answer, not a deflection: it is how export actually works.

You may freely discuss: what products are in the catalogue, what category something belongs to, the descriptions provided, how to get in touch, and what information to include in an enquiry to get a fast, accurate quote.`;

/**
 * Patterns that indicate a commitment the company has not authorised.
 * Deliberately narrow — this is a backstop for a clear rule violation, not a
 * general profanity filter, and a false positive costs a useful answer.
 */
const VIOLATIONS: { name: string; pattern: RegExp }[] = [
  // Currency amounts: $450, USD 450, ₹1200, 450 USD, EUR 300
  { name: 'price', pattern: /(?:[$€£₹]\s?\d[\d,.]*)|(?:\b(?:usd|eur|inr|aed|gbp)\s?\d[\d,.]*)|(?:\d[\d,.]*\s?(?:usd|eur|inr|aed|gbp)\b)/i },
  // Per-unit rates: "per MT", "/kg", "per metric tonne" adjacent to a number
  { name: 'rate', pattern: /\d[\d,.]*\s*(?:\/|per\s+)(?:kg|mt|ton|tonne|metric\s+tonne|container|crate|box)\b/i },
  // Explicit MOQ claims. Two patterns because the quantity lands on either side
  // of the phrase in natural writing — "MOQ is 25 MT" and "25 MT minimum order"
  // are the same commitment, and the smoke test caught the second slipping past
  // a single number-after-phrase rule.
  { name: 'moq', pattern: /\b(?:moq|minimum\s+order(?:\s+quantity)?|minimum\s+quantity)\b[^.?!]{0,60}\d/i },
  {
    name: 'moq',
    pattern:
      /\d[\d,.]*\s*(?:kg|mt|ton|tonne|tonnes|metric\s+tonnes?|container|containers|crate|crates|box|boxes)\b[^.?!]{0,60}\b(?:moq|minimum)\b/i,
  },
  // Certification claims stated as fact ("we are GlobalGAP certified")
  { name: 'certification', pattern: /\b(?:we\s+(?:are|hold|have)|our\s+\w+\s+(?:is|are))\b[^.?!]{0,60}\b(?:apeda|globalgap|global\s?g\.?a\.?p|haccp|iso\s?\d+|organic\s+certified|phytosanitary)\b/i },
];

export interface GuardrailResult {
  safe: boolean;
  violations: string[];
  text: string;
}

const HANDOFF =
  'Pricing, minimum quantities, certifications and shipping timelines are quoted per enquiry, ' +
  'because they depend on the volume, destination port and season. Please send the details ' +
  'through the enquiry form and the team will come back with firm terms.';

/**
 * Check model output before it reaches a buyer.
 * On violation the answer is replaced wholesale rather than edited — a partly
 * redacted quote still reads like a quote.
 */
export function enforce(text: string): GuardrailResult {
  const violations = VIOLATIONS.filter((v) => v.pattern.test(text)).map((v) => v.name);

  if (violations.length === 0) {
    return { safe: true, violations: [], text };
  }

  console.warn(
    JSON.stringify({ event: 'guardrail_block', violations, sample: text.slice(0, 160) })
  );

  return { safe: false, violations, text: HANDOFF };
}
