# Deployment

How this site is built, deployed, configured and verified — and the two platform constraints that have actually broken it.

---

## Shape of the deployment

One Vercel project. The React app builds to static assets; the files in `client/api/` become serverless functions on the same origin.

```
client/
  src/        →  static bundle, served from the CDN
  api/        →  one serverless function per file
    _lib/       shared code; the underscore keeps Vercel from routing it
  dist/       →  build output
```

Because the functions live on the same origin as the site, the frontend calls them with a relative `baseURL: '/api'` — no CORS configuration, no separate backend URL, no environment-specific API host.

`client/vercel.json` does one important thing:

```json
{ "source": "/((?!api/).*)", "destination": "/index.html" }
```

That negative lookahead is what makes client-side routing work: every path *except* `/api/*` falls through to `index.html` so React Router can handle it. Paths under `/api/` are excluded and resolve to functions instead. **A new endpoint needs no config change** — dropping `api/whatever.ts` into the directory is enough.

The build also has access to the repository root, not just `client/`. This is confirmed rather than assumed: `vite.config.ts` contains a plugin that copies `../Raaya Global Solutions logo2.png` into `public/logo.png` at build time, and `/logo.png` resolves in production. That is load-bearing — the favicon and the `og:image` both point at it.

---

## Environment variables

Set in Vercel under **Settings → Environment Variables**. None are in the repository.

| Variable | Required | Without it |
|---|---|---|
| `GMAIL_USER` | For email | Enquiries are captured and logged, never emailed |
| `GMAIL_PASS` | For email | As above. Must be a Gmail **App Password**, not the account password |
| `RECIPIENT_EMAIL` | For email | As above |
| `ANTHROPIC_API_KEY` | No | AI layer off; search falls back to keyword, assistant hides |
| `ANTHROPIC_MODEL` | No | Defaults to `claude-opus-5` |
| `ANTHROPIC_EFFORT` | No | Defaults to `low` |

The site is designed to run correctly with **none** of the optional ones set, and to degrade rather than fail when the required ones are missing. A missing `GMAIL_USER` does not lose an enquiry — it logs it as structured JSON and returns 201. See [ARCHITECTURE.md §2](./ARCHITECTURE.md).

---

## Local development

```bash
cd client
npm install
npm run dev        # Vite → http://localhost:5173
npm run dev:api    # separate terminal: Vercel functions → http://localhost:3000
```

`npm run dev` alone is enough for pages and styling. **`npm run dev:api` is required for anything touching `/api`** — the enquiry form, search, or the assistant.

> ### Run `dev:api` before pushing anything that touches `api/`
>
> This is not optional advice, it is the specific gap that took the enquiry
> endpoint down in production. `npm run typecheck`, `npm run smoke` and
> `npm run build` all passed while all three functions were crashing on the
> deployed site, because none of them runs the code the way Vercel's Node
> runtime does. `vercel dev` does.

The Vite dev proxy points `/api` at port 3000 so both servers behave like one origin, matching production. It used to point at a separate Express server that production did not use, which meant local and deployed environments ran *different backends* — and nothing ever exercised both, so they silently diverged.

---

## The ESM constraint

`client/package.json` sets `"type": "module"`, so the functions run as **real ESM** on Vercel. Node's ESM resolver does not probe for extensions the way CommonJS does.

```ts
import { clamp } from './_lib/http';       // ✗ ERR_MODULE_NOT_FOUND at runtime
import { clamp } from './_lib/http.js';    // ✓
```

**Every relative import in `api/` and `scripts/` needs an explicit `.js` extension.** The `.js` refers to the emitted file; TypeScript maps it back to the `.ts` source. Directory imports need the index too: `'../../src/types/index.js'`, not `'../../src/types'`.

This is easy to get wrong because *nothing local catches it*:

- `tsconfig` uses `moduleResolution: "bundler"`, which permits extensionless specifiers.
- `npm run smoke` bundles with esbuild into a single file, so Node's resolver is never invoked.

It only appears at runtime on the platform, as `500 FUNCTION_INVOCATION_FAILED`. It is the reason the original `enquiry.ts` — which imported nothing relative — worked for months while the first version with shared `_lib/` code did not.

---

## Verifying a deploy

Vercel deploys are **not synchronous with a push**. A commit can take several minutes to go live, and during that window production still serves the previous version.

So a failing curl means one of two different things, and they need different responses:

| What you see | Could be |
|---|---|
| Old behaviour | Not deployed yet — wait |
| Broken behaviour | Deployed and faulty — roll back or fix |

**Do not treat a short poll as proof of failure.** Identify *which version is answering* before concluding anything. The reliable way here is a behavioural fingerprint — pick something that differs between versions and probe for it:

```bash
# Invalid payload: returns 422 without sending any email.
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"name":"","phone":"","email":"","productInterest":"","message":""}' \
  https://raayaimportexport.vercel.app/api/enquiry
```

- Several errors with real field names → current handler.
- A single error with `"field":"general"` → the pre-2026 handler.

Checking the Vercel dashboard's deployment list is faster and unambiguous, and is the right first move when a push does not appear to land. Inferring deployment state purely from curl output is how a healthy deployment gets rolled back by mistake.

### Health check

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://raayaimportexport.vercel.app/
curl -s -X POST -H "Content-Type: application/json" -d '{"query":"onion"}' \
  https://raayaimportexport.vercel.app/api/search
curl -s -X POST -H "Content-Type: application/json" -d '{"messages":[]}' \
  https://raayaimportexport.vercel.app/api/assistant
```

Expected when the AI layer is **off** (no API key) — all healthy:

```
200
{"success":true,"mode":"keyword","summary":"Showing 1 product matching \"onion\".",...}
{"available":false,"reason":"assistant is not configured on this deployment"}
```

`mode: "keyword"` and `available: false` are **not errors**. They are the designed behaviour when no key is configured.

---

## Rolling back

Vercel keeps every previous deployment. **Settings → Deployments → ⋯ → Promote to Production** on the last known-good build is instant and does not require a commit.

Prefer that over a revert commit when production is broken: it is faster, it is reversible, and it does not put a misleading "revert" into the history of a repository someone else will read later.

---

## Pre-push checklist

```bash
cd client
npm run typecheck   # src/ and api/ — api/ is included, and that matters
npm run smoke       # all endpoints with the AI switched off
npm run build       # typecheck + production build
npm run dev:api     # ← if you touched api/, exercise it here before pushing
```

Then, after pushing, confirm the deploy actually landed before concluding anything about whether it worked.
