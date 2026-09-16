# AI features

What the three AI features do, what they refuse to do, and what they cost. [ARCHITECTURE.md](./ARCHITECTURE.md) covers *why* they are shaped this way; this is the working reference.

All three are **optional**. With no `ANTHROPIC_API_KEY` the site runs exactly as it did before they existed. Every example below shows both paths.

---

## 1. Natural-language product search

**`POST /api/search`** · UI: search bar on `/products`

The category filter already answers *"show me spices"*. This answers the way buyers actually write: *"bulk onions for the Gulf market"*, *"something with a long shelf life"*.

### Request

```json
{ "query": "bulk onions for the Gulf market" }
```

### Response

```json
{
  "success": true,
  "mode": "ai",
  "summary": "Onions ship well over long distances and are India's highest-volume vegetable export.",
  "count": 3,
  "products": [ { "id": 10, "name": "Onion", "category": "vegetables", ... } ]
}
```

`mode` tells you which path answered: `"ai"` or `"keyword"`.

### Without a key

Real production response today, with no key configured:

```json
{ "success": true, "mode": "keyword",
  "summary": "Showing 1 product matching \"onion\".",
  "count": 1, "note": "keyword search",
  "products": [ { "id": 10, "name": "Onion", "category": "vegetables", ... } ] }
```

A harder query degrades honestly rather than padding the result:

```json
{ "success": true, "mode": "keyword", "count": 0, "products": [],
  "summary": "Nothing in the catalogue matches \"something hardy that ships well\". Try a category, or send an enquiry." }
```

That query is exactly the kind the AI path handles and keyword matching cannot — which is the honest argument for the feature, and also why the fallback says so plainly instead of guessing.

### Behaviour worth knowing

- **One call on submit, never per keystroke.** Search-as-you-type would be a model call per character on a public endpoint.
- **Results are cached 10 minutes** per normalised query.
- **The model returns ids, never product descriptions.** Ids are resolved against the real catalogue server-side and unknown ones are dropped — so a hallucinated product is structurally impossible to surface, not merely unlikely.
- **It never returns an error to the buyer.** Rate-limited, model failure, no key: all fall through to keyword matching and a `200`.

---

## 2. Buyer assistant

**`POST /api/assistant`** · UI: floating widget, mounted site-wide in `Layout.tsx`

### Request

```json
{ "messages": [ { "role": "user", "content": "Do you export basmati rice?" } ] }
```

### Response

```json
{ "available": true,
  "reply": "Yes — basmati rice is in our grains range, along with wheat and other cereals. If you tell us the volume and destination port through the enquiry form, the team will come back with terms.",
  "guardrailTriggered": false }
```

### Without a key

```json
{ "available": false, "reason": "assistant is not configured on this deployment" }
```

The widget probes this on mount and **renders nothing at all** when `available` is false. A chat button that opens onto an error is worse than no chat button, particularly on a client's site.

### What it will not answer

This is the important part. An export conversation reaches price, minimum order quantity, certification and shipping date within about two messages — those are the *first* things a serious buyer asks. Every one is a commitment that depends on season, destination port, current crop, and what the company is willing to sign.

A model answering *"$450/MT, 25 MT minimum, GlobalGAP certified, ships in two weeks"* on the company's own website is not a hallucination anyone laughs about. **It is a quote the buyer will reasonably expect to be honoured.**

So `api/_lib/guardrails.ts` blocks six categories outright:

| Blocked | Why |
|---|---|
| Prices, rates, currency amounts | Depends on volume, destination, season |
| Minimum order quantities | Commercial term |
| Certifications (APEDA, GlobalGAP, organic, phyto…) | A compliance claim, legally meaningful |
| Delivery dates, lead times, availability | Depends on crop and shipping |
| Specific farms, suppliers, ports, shipping lines | Not the assistant's to disclose |
| Products not in the catalogue | Inventing inventory |

Enforced in **two layers**, because a prompt instruction is guidance rather than a control:

1. **In the prompt** — `COMMERCIAL_RULES`, stated to override any user request.
2. **On the output** — pattern-checked before it is sent. A violation replaces the answer **wholesale** with a handoff to the enquiry form, and logs `guardrail_block`.

Replaced, not redacted: a partly-censored quote still reads like a quote.

The refusal is a genuinely useful answer rather than a dodge — *"pricing and terms are quoted per enquiry because they depend on volume, destination and season"* is simply how export works, and it moves the buyer toward the form.

**A real example of why layer 2 exists.** The smoke test caught `"We can do a 25 MT minimum order quantity."` passing straight through. The MOQ pattern required a digit *after* the phrase; here the quantity came before it. The rule was stated clearly in the prompt and a plausible sentence still would have reached a buyer.

---

## 3. Auto-drafted buyer reply

Part of **`POST /api/enquiry`** — no separate endpoint, no UI.

When an enquiry arrives, the owner receives **two** emails:

1. **The enquiry** — plain, exactly as before. Sent first.
2. **A draft reply** — written in the buyer's own language, ready to edit and send.

```
DRAFT REPLY — review before sending. Generated by AI, not sent to anyone.

Enquiry ref:      3dcd59e6-393f-4c54-96eb-39680073c532
Buyer wrote in:   Arabic
What they want:   Two 40ft containers of Alphonso mango to Jebel Ali, November.

--- Subject -------------------------------------------------
شكراً لاستفساركم — مانجو ألفونسو

--- Body ----------------------------------------------------
[reply in Arabic]

--- Check before sending ------------------------------------
  - Confirm November availability before quoting a shipment window
  - Confirm packaging preference (crates vs cartons)
```

Replying in the buyer's own language is the single thing most likely to win the conversation — many buyers are in the Gulf, Africa and Europe and did not write in English.

The same guardrails apply: the draft quotes no prices and promises no certifications. The `Check before sending` list is what the owner must fill in themselves, which is precisely the part a model should not invent.

### The ordering constraint

> The enquiry email is sent, and the buyer gets their `201`, **before** any model call.

The draft is a separate best-effort step afterwards, capped at 6 seconds. It cannot delay, degrade, or prevent delivery of the lead. If it fails — no key, timeout, outage, malformed output — the owner simply gets one email instead of two, and the business outcome is identical to not having built the feature.

See [ARCHITECTURE.md §2](./ARCHITECTURE.md).

---

## Cost

Logged as structured JSON on every call, so spend is visible in the Vercel logs rather than a surprise on a bill:

```json
{"event":"ai_call","label":"search","model":"claude-opus-5",
 "input_tokens":1240,"output_tokens":95,"cost_usd":0.008575,"latency_ms":1830}
```

| Call | Approx. (`claude-opus-5`) |
|---|---|
| Search | $0.01–0.02 (cached 10 min per query) |
| Assistant turn | $0.02–0.04 |
| Enquiry draft | $0.02–0.04 per enquiry |

### Keeping it down

| Control | Where |
|---|---|
| Search cached per normalised query | `api/search.ts` |
| Assistant history capped at 8 turns | `LIMITS.historyTurns` |
| Draft skipped entirely if it exceeds 6s | `AI_DRAFT_TIMEOUT_MS` |
| Per-IP rate limits on every endpoint | `api/_lib/http.ts` |
| `effort` defaults to `low` | `ANTHROPIC_EFFORT` |

**If traffic grows, change one variable.** The assistant is public and anyone can talk to it. `ANTHROPIC_MODEL=claude-haiku-4-5` cuts per-turn cost roughly 5×. Opus is the default because it gives the best answers — that is a deployment trade the owner should make knowingly rather than one silently baked in.

Rate limiting is **per-instance and therefore partial**: serverless instances do not share memory, so each new instance starts with a fresh allowance. It blunts the common case — one script hammering one warm instance — and costs nothing, but it is not a wall. A shared store (Vercel KV, Upstash) is the real fix if it ever matters.

---

## Turning it on

Set `ANTHROPIC_API_KEY` in Vercel → Settings → Environment Variables, then redeploy. Confirm:

```bash
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"query":"something hardy that ships well"}' \
  https://raayaimportexport.vercel.app/api/search
```

`"mode":"ai"` means the AI path is live. `"mode":"keyword"` means the key is not being picked up.

To turn it all off again, remove the variable. Nothing breaks.

## Testing without spending anything

```bash
cd client && npm run smoke
```

Runs all three endpoints with the AI disabled and asserts the fallback guarantees plus the guardrail rules — no network, no key, no cost.
