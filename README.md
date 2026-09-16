<div align="center">

# 🌾 Raaya Global Solutions

### An agricultural export site that answers buyers in their own language.

A client website for an Indian agri-exporter — rebuilt around the one thing it exists to do: **turn a visitor into an enquiry, and an enquiry into a reply.**

<br>

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Claude](https://img.shields.io/badge/Claude-Opus%205-D97757?logo=anthropic&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-serverless-000000?logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-black)

**[Live site →](https://raayaimportexport.vercel.app)**

</div>

---

## What it does

A buyer lands on the site — often an importer in Dubai, Nairobi or Rotterdam, frequently not writing in English — and needs to get from "do you sell what I need?" to "here is my enquiry" without friction.

| | |
|---|---|
| 🔍 **Natural-language search** | Type *"bulk onions for the Gulf market"* or *"something with a long shelf life"* and get matching products. The category filter handles "show me spices"; this handles how buyers actually describe what they want. |
| 💬 **Product assistant** | A grounded chat widget that answers from the real catalogue and **refuses to quote prices, MOQs, certifications or delivery dates** — it routes those to a human, because those are commitments only the company can make. |
| ✉️ **Auto-drafted replies** | Every enquiry arrives with a second email: a ready-to-send reply **written in the buyer's own language**, with a checklist of what to confirm first. In export, response time wins deals. |
| 🛡️ **A lead cannot be lost** | The enquiry email is sent *before* any AI runs. No API outage, timeout or malformed response can cost the business a lead. |

---

## The rule everything is built around

> **AI can add to a lead. It can never be the reason one is lost.**

This is a real business's front door, so the AI layer is strictly additive. The ordering in `api/enquiry.ts` is the whole design:

```
1. validate, rate-limit, honeypot
2. log the enquiry as structured JSON      ← recoverable no matter what happens next
3. SEND THE ENQUIRY EMAIL                  ← no AI involved above this line
4. return 201 to the buyer
5. generate + send the AI draft reply      ← best-effort, timeout-capped, optional
```

**What this replaced:** the previous handler returned HTTP 500 when `nodemailer` threw, and stored nothing anywhere. Gmail caps a free account at ~500 sends/day and app passwords expire without warning — so a bad afternoon meant enquiries were simply gone. No record, no retry, no way to know how many.

The endpoint is also public and sends email, and it had **no rate limiting at all**. A bot could exhaust the daily quota in minutes, after which every genuine buyer enquiry would silently fail.

### Works with no API key

Leave `ANTHROPIC_API_KEY` unset and the site behaves exactly as it did before any of this existed:

| Feature | Without a key |
|---|---|
| Product search | Falls back to deterministic keyword matching — **still returns results** |
| Assistant widget | Does not render at all (a chat button that opens onto an error is worse than no button) |
| Enquiry form | Sends unchanged |

That is the primary regression gate, not a nicety. Every AI failure path was designed backwards from it.

---

## The guardrail worth reading

An export conversation reaches price, minimum order quantity, certification and shipping date within about two messages — those are the *first* things a serious buyer asks. Every one is a commercial commitment that depends on season, destination port, current crop and what the company is willing to sign.

A model confidently answering *"$450/MT, 25 MT minimum, GlobalGAP certified, ships in two weeks"* on a company's own website is not a hallucination you laugh about. **It's a quote the buyer will reasonably expect to be honoured.**

So `api/_lib/guardrails.ts` enforces it in two layers, because a prompt instruction is guidance, not a control:

1. **In the prompt** — explicit hard rules that override any user request.
2. **On the way out** — output is pattern-checked for currency amounts, per-unit rates, MOQ claims and certification assertions. Anything that slips through is **replaced wholesale** with a handoff to the enquiry form, and the block is logged.

Replaced, not redacted — a partly-censored quote still reads like a quote.

The refusal itself is a genuinely useful answer, not a dodge: *"pricing and terms are quoted per enquiry because they depend on volume, destination and season"* is simply how export works.

Search has an equivalent guarantee: the model returns **product ids**, which are resolved against the real catalogue server-side. An id that doesn't exist is dropped — so a hallucinated product is structurally impossible to surface. The model picks from a list; it never generates from memory.

---

## What the cleanup found

This started as "add some AI." Most of the value turned out to be in what was already there.

| Finding | Detail |
|---|---|
| **12 dead files, 27% of source** | An atomic-design refactor created `atoms/molecules/organisms/` but never deleted `home/`, `layout/`, `products/`. Every dead file had a live twin — so any future edit had a coin-flip chance of landing in the copy that isn't rendered. Verified unreachable from `main.tsx`, then deleted. |
| **Two backends, already drifted** | `server/` (Express) was dead in production — Vercel serves `client/api/`. They'd diverged: one returned `{success, id}`, the other `{success}`. The README documented the dead one. |
| **Why they drifted** | `vite.config.ts` proxied `/api` → `localhost:5000` (Express) while production served `client/api/`. **Local development and production ran different backends.** Now both run the Vercel functions. |
| **`api/` was never type-checked** | `tsconfig.json` had `include: ["src"]`, so `npm run build` never looked at the serverless functions. A commit once fixed this and it was lost. Restoring it caught a real type error within minutes. |
| **Stale docs** | README claimed 31 products; there are 26 (ids run 1–31 with 5 gaps). |
| **No `og:image`** | The owner shares this link with buyers over WhatsApp. Without it, the preview was a blank grey box. |

---

## Quick start

```bash
cd client
npm install
cp ../.env.example .env.local     # optional: add ANTHROPIC_API_KEY for the AI layer
```

```bash
npm run dev          # Vite dev server → http://localhost:5173
npm run dev:api      # (separate terminal) Vercel functions → http://localhost:3000
npm run typecheck    # type-checks BOTH src/ and api/
npm run build        # typecheck + production build
npm run smoke        # ⭐ runs every endpoint with the AI switched off
```

`npm run dev` alone serves the site fine; you only need `dev:api` to exercise the enquiry form, search or assistant locally.

**`npm run smoke` is the one worth knowing about.** It calls all three handlers with mocked requests and no API key — no network, no spend, no Vercel CLI — and asserts the fallback guarantee above actually holds:

```
/api/search — falls back to keyword matching
  PASS  still finds products  [count=1]
/api/assistant — reports unavailable so the widget hides
  PASS  available is false
/api/enquiry — the lead survives a missing mail config
  PASS  returns 201, not 500
  PASS  per-field errors, never "general"
Commercial guardrail — what the assistant may not say
  PASS  blocks  "Our Alphonso is $450/MT FOB Mumbai."     [price,rate]
  PASS  blocks  "We can do a 25 MT minimum order quantity." [moq]
  PASS  allows  "Pricing depends on volume and destination…"
All checks passed.
```

It caught two real bugs while this was being written: an MOQ pattern that only matched when the number came *after* the phrase (so "25 MT minimum order quantity" sailed through), and a type error in the newly type-checked `api/`.

---

## API

### `POST /api/enquiry`

```json
{ "name": "John Smith", "phone": "+971 50 000 0000", "email": "john@example.com",
  "productInterest": "fruits", "message": "Interested in 2x40ft Alphonso for Jebel Ali." }
```

`201` → `{ "success": true, "id": "<uuid>", "delivery": "sent" | "logged" }`
`422` → `{ "success": false, "errors": [{ "field": "email", "message": "..." }] }` — **per-field**, so the form can highlight the right input
`429` → rate limited

`delivery: "logged"` means the enquiry was captured and written to the logs but the mail provider failed. The buyer still gets a success, because from their side it succeeded — their details reached us. Whether our mail provider then cooperated is our problem, not a reason to tell a buyer their message vanished.

### `POST /api/search`

`{ "query": "bulk onions for the Gulf" }` → `{ success, mode: "ai" | "keyword", summary, count, products[] }`

Always `200`. `mode` tells you whether the model ranked these or the keyword fallback did.

### `POST /api/assistant`

`{ "messages": [{ "role": "user", "content": "..." }] }` → `{ available, reply, guardrailTriggered? }`

`available: false` means no API key is configured; the widget uses this to hide itself.

---

## Project structure

```
client/
  api/                    Vercel serverless functions (the only backend)
    enquiry.ts              lead capture — email-first, AI second
    search.ts               natural-language product search
    assistant.ts            grounded buyer assistant
    _lib/                   shared; Vercel ignores api/_* for routing
      guardrails.ts           🛡️ commercial rules + output enforcement
      catalogue.ts            grounding data — imports the SAME products the site renders
      anthropic.ts            client, model config, USD cost accounting
      http.ts                 CORS, rate limiting, input caps, honeypot
  src/
    components/  atoms · molecules · organisms · templates · ai
    pages/       Home · About · Products · Enquiry · Contact
    data/        products.ts  ← single source of truth, shared with api/
```

`api/_lib/catalogue.ts` imports the same `src/data/products.ts` the pages render. That's deliberate: if the assistant read from its own copy, the two would drift the moment anyone added a product, and it would start confidently describing items the company doesn't sell.

---

## Documentation

| Doc | Read it when |
|---|---|
| 📐 **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** | You want the *why* — the ordering constraint, the guardrail contract, and what was deliberately left out |
| 🤖 **[AI-FEATURES.md](docs/AI-FEATURES.md)** | You need the request/response shapes, what the assistant refuses, or what a call costs |
| 🚀 **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** | You're deploying, setting env vars, or a push doesn't seem to have landed |
| ✏️ **[CONTENT.md](docs/CONTENT.md)** | You're adding a product, editing contact details, or adding a category |

> If you change anything under `client/api/`, read the ESM section of [DEPLOYMENT.md](docs/DEPLOYMENT.md#the-esm-constraint) first. Extensionless relative imports pass every local check and fail at runtime in production.

---

## Cost

Measured per call and logged as structured JSON on every request, so spend is visible in the Vercel logs rather than a surprise on a bill.

| Endpoint | Approx. cost (`claude-opus-5`) |
|---|---|
| `/api/search` | ~$0.01–0.02 (cached per query for 10 min) |
| `/api/assistant` | ~$0.02–0.04 per turn |
| `/api/enquiry` draft | ~$0.02–0.04 per enquiry |

> **If traffic grows, change one variable.** The assistant is a public endpoint anyone can talk to. `ANTHROPIC_MODEL=claude-haiku-4-5` cuts per-turn cost roughly 5x. Opus is the default because it gives the best answers — that trade is the deployer's call, so it's documented rather than made silently.

Rate limiting is per-instance and therefore **best-effort**: serverless instances don't share memory, so under load each new instance gets a fresh allowance. It blunts the common case (one script hammering one warm instance) and costs nothing. Doing it properly needs a shared store (Vercel KV, Upstash) — a deliberate non-goal here, and stated rather than overstated.

---

## Known limitations

Listed rather than quietly left out:

- **No prerendering.** This is a client-rendered SPA, so a crawler that doesn't run JavaScript sees only `index.html`. The JSON-LD and meta tags mitigate it; proper SSR or prerendering would be the real fix for a business whose leads come from search.
- **`og:image` is the logo**, not a purpose-made 1200×630 banner. Better than the blank box it replaced; not yet ideal.
- **Rate limiting is per-instance** (above).
- **Enquiries are logged, not stored.** Recoverable from Vercel logs if mail fails, but there's no database. That was the zero-new-infrastructure brief; Vercel KV or a Google Sheet would be the next step.

---

## License

MIT. Built for Raaya Global Solutions.
