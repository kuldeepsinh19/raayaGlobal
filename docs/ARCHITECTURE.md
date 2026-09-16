# Architecture

Why the pieces are shaped the way they are. The README covers what the site does; this covers the decisions behind it, including the ones that were deliberately *not* taken.

---

## 1. What the AI is for

This is a lead-generation site. A buyer arrives, finds a product, sends an enquiry, and the owner replies. Every line of the AI layer is judged against whether it moves that sequence along.

That framing rules a lot out. A chatbot that discusses Indian agriculture is a demo. What actually helps is narrower:

- A buyer who does not know whether the company sells what they need should find out in one query, in their own words.
- A buyer who is ready to transact should know exactly what to put in the enquiry form so the reply is fast and accurate.
- An owner opening their inbox at 7am should not face a blank page in a language they may not read.

Those are the three features. Nothing else was added because nothing else passed that test.

---

## 2. The rule everything is built around

> **AI can add to a lead. It can never be the reason one is lost.**

This is a real business's front door, so the AI layer is strictly additive. The ordering inside `api/enquiry.ts` is the entire design, and it is the one thing not to "tidy up" later:

```
1. validate · rate-limit · honeypot
2. log the enquiry as structured JSON     ← recoverable no matter what follows
3. SEND THE ENQUIRY EMAIL                 ← nothing above this line touches AI
4. return 201 to the buyer
5. generate + send the AI draft reply     ← best-effort, timeout-capped, optional
```

Steps 1–4 have no dependency on the Anthropic SDK, the network beyond SMTP, or an API key. Step 5 can fail in every way a network call can fail and the outcome for the business is identical to not having built it.

### Why a failed send still returns 201

Once a valid enquiry is in hand, the buyer gets a success response even if the mail provider then fails. From the buyer's side it genuinely did succeed: their details reached the server and are in the logs. Returning a 500 tells them their message vanished, which is both false and likely to lose them — most people do not retry a form that errors.

The failure is real, but it is *our* failure to deliver internally, and it is recorded as `delivery: "logged"` plus a structured `enquiry_undelivered` log line carrying the full enquiry. That is the difference between a bad mail day costing nothing and costing every lead that arrived during it.

The previous implementation returned 500 and stored nothing anywhere.

---

## 3. The guardrail contract

> The AI may describe what the company sells. It may never make a commitment on the company's behalf.

An export conversation reaches price, minimum order quantity, certification and shipping date within about two messages — those are the *first* things a serious buyer asks. Every one depends on season, destination port, current crop, and what the company is willing to sign.

A model answering *"$450/MT, 25 MT minimum, GlobalGAP certified, ships in two weeks"* on the company's own website is not a hallucination anyone laughs about. It is a quote the buyer will reasonably expect to be honoured.

`api/_lib/guardrails.ts` enforces this in two layers, because **a prompt instruction is guidance, not a control**:

| Layer | Mechanism |
|---|---|
| Prompt | `COMMERCIAL_RULES` — explicit hard rules stated to override any user request |
| Output | Pattern check for currency amounts, per-unit rates, MOQ claims, certification assertions |

On a violation the answer is **replaced wholesale**, not edited. A partly-redacted quote still reads like a quote. The replacement is a genuine answer rather than a refusal — *"pricing and terms are quoted per enquiry because they depend on volume, destination and season"* is simply how export works, and it moves the buyer toward the form.

Every block is logged, so "how often did the model try to quote a price" is a number rather than a hope.

### The bug this ordering caught

The smoke test found that `"25 MT minimum order quantity"` passed straight through. The MOQ pattern required a digit *after* the phrase, and here the quantity came before it. Natural writing puts the number on either side, so there are now two patterns.

That is the argument for checking output rather than trusting the prompt, in miniature: the rule was stated clearly in the system prompt, and a plausible sentence still would have reached a buyer.

---

## 4. Grounding: one catalogue, not two

`api/_lib/catalogue.ts` imports the same `src/data/products.ts` that the React pages render.

This is deliberate and it is the most important line in that file. If the assistant read from its own hand-maintained copy, the two would diverge the moment anyone added or removed a product, and the assistant would begin confidently describing items the company does not sell. There is one catalogue and both consumers read it.

The same instinct drives the search contract: **the model returns product ids, never prose about products.** Ids are resolved against the real catalogue server-side, and anything unknown is dropped. The model is choosing from a list, not generating from memory — which makes a hallucinated product structurally impossible to surface rather than merely unlikely.

---

## 5. Degradation

Every AI feature has a defined behaviour when `ANTHROPIC_API_KEY` is absent, and `npm run smoke` asserts each one with no key and no network.

| Feature | Without a key | Why that behaviour |
|---|---|---|
| Product search | Deterministic keyword match | A search box that errors is worse than a dumb one that works |
| Assistant widget | Does not render at all | A chat button that opens onto an error is worse than no button |
| Enquiry | Sends unchanged | See §2 |

Hiding the widget entirely rather than disabling it is the right call for a client site: a visitor should not be able to tell that a feature exists but is broken.

---

## 6. Cost and latency

Public endpoints on a small business's site, so these are constraints rather than footnotes.

| Decision | Reason |
|---|---|
| Search is one call **on submit**, never per keystroke | Search-as-you-type is one model call per character on a public page |
| Search results cached 10 min by normalised query | Buyers on a small catalogue repeat the same searches |
| Assistant history capped at 8 turns | Unbounded history on a public endpoint is an unbounded bill |
| Draft generation behind a 6s timeout | A slow model call must not hold the form submit open |
| Effort defaults to `low` | These are short, well-specified tasks, not research |
| Per-call USD cost logged as structured JSON | Spend is visible in Vercel logs, not a surprise on a bill |

Model defaults to `claude-opus-5` because it gives the best answers, and because choosing a cheaper model is a deployment trade the owner should make knowingly rather than one silently baked in. `ANTHROPIC_MODEL=claude-haiku-4-5` cuts per-turn cost roughly 5x; the README states the numbers.

### Rate limiting is honest about being partial

`api/_lib/http.ts` uses a per-instance token bucket. Serverless instances do not share memory, so under load each new instance starts with a fresh allowance. It meaningfully blunts the common case — one script hammering one warm instance — and costs nothing.

It is not a wall. Doing this properly needs a shared store (Vercel KV, Upstash), which was outside the zero-new-infrastructure brief. Stated here rather than overstated in the README.

---

## 7. What the cleanup found, and why it belongs in an architecture doc

Most of the value in this change was not the AI.

**12 dead files, 27% of source.** An atomic-design refactor created `atoms/molecules/organisms/` and never deleted `home/`, `layout/`, `products/`. Every dead file had a live twin with the same name. The cost was not disk space — it was that any future edit had a coin-flip chance of landing in the copy that is not rendered, and the symptom would be "my change did nothing."

**Two backends that had already drifted.** `server/` (Express) was dead in production; Vercel served `client/api/`. They returned different response shapes, and the README documented the dead one.

**The root cause of that drift is the interesting part.** `vite.config.ts` proxied `/api` to `localhost:5000` — the Express server — while production served `client/api/`. Local development and production ran *different backends*. Nothing would ever have caught the divergence, because no environment exercised both. Both now run the Vercel functions.

**`api/` was never type-checked.** `tsconfig.json` had `include: ["src"]`, so `npm run build` compiled the React app and never looked at the serverless functions. Restoring it caught a real type error within minutes. Three new endpoints were about to be added to a directory the build did not check.

---

## 8. Deliberately not here

- **No prerendering.** This is a client-rendered SPA, so a crawler that does not execute JavaScript sees only `index.html`. The JSON-LD and meta tags mitigate it; SSR or prerendering is the real fix for a business whose leads come from search. It is the largest genuine gap.
- **No database.** Enquiries are logged, not stored. Recoverable from Vercel logs if mail fails, but there is no queryable history. Choosing a store is a deployment decision, and inventing one would be speculative.
- **No streaming on the assistant.** Responses are short; streaming would add complexity for no user-visible benefit at this length.
- **No lead scoring or CRM enrichment.** Considered and deliberately dropped from scope — the back-office half of this problem is a different product, and half-building it would have been worse than not starting.
- **`og:image` is the logo**, not a purpose-made 1200×630 banner. Better than the blank preview it replaced; not yet right.
