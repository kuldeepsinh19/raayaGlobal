# Editing the site's content

Everything a buyer reads — products, categories, contact details, the copy on the About page — lives in typed data files, not scattered through JSX. This is how to change it without touching a component.

No CMS, no admin panel: content changes are a code edit and a push, which redeploys automatically.

---

## The one rule

> **`src/data/products.ts` is the single source of truth for the catalogue.**

It is read by the product grid, the category showcase, the stats strip, *and* by the AI layer through `api/_lib/catalogue.ts`.

That last one matters. If the assistant read from its own copy of the product list, the two would diverge the moment anyone added or removed an item, and it would begin confidently describing products the company does not sell — to buyers, on the company's own website. There is one list.

**Anything derived from the catalogue should be computed, not typed in.** The "Export Products" figure in `stats.ts` read `31` while the catalogue held 26 — five products had been removed and the number was never updated. A buyer can count the grid. It is now `${products.length}`.

---

## Adding a product

`src/data/products.ts`:

```ts
{
  id: 32,                        // unique; gaps are fine, see below
  name: 'Turmeric Finger',
  slug: 'turmeric-finger',       // lowercase, hyphenated, unique
  category: 'spices',            // fruits | vegetables | grains | spices
  tagline: 'High-curcumin turmeric from Erode, graded for export',
  imageUrl: px(4198015),         // Pexels photo id
}
```

| Field | Notes |
|---|---|
| `id` | Unique number. Used as a React key and by AI search to identify matches. |
| `name` | Shown on the card and pre-filled into the enquiry form. |
| `slug` | Lowercase, hyphenated. Not currently routed, but kept unique for future per-product pages. |
| `category` | Must be one of the four in `ProductCategory`. TypeScript rejects anything else. |
| `tagline` | One line, up to roughly 90 characters before it clips. Also fed to AI search as match context, so describe the product rather than the company. |
| `imageUrl` | Use the `px()` helper. |

That is the only edit required. The product grid, the category counts, the filter, the stats figure and AI search all pick it up automatically.

### Ids have gaps, and that is fine

Current ids run 1–31 with **26 products** — 12, 25, 28, 29 and 30 were removed at some point. Nothing depends on ids being contiguous. **Do not renumber to close the gaps:** ids are how AI search refers to products, and re-sequencing would silently change what an id means. Take the next number above the current maximum.

### Images

```ts
const px = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop`;
```

Find a photo on [pexels.com](https://www.pexels.com), take the numeric id from its URL, pass it to `px()`. The helper pins size and compression so every card renders at a consistent 4:3.

These are hotlinked from the Pexels CDN. An earlier version used `source.unsplash.com`, which was deprecated and broke every image at once — worth knowing if they ever go blank. Self-hosting them in `public/` removes that dependency at the cost of repository size.

---

## Removing a product

Delete its object. Do not renumber the rest.

Check whether the name appears anywhere else first:

```bash
cd client && grep -rn "Alphonso" src/
```

Product names are referenced in the About and Home page copy in a few places, and those are hand-written prose rather than generated from the catalogue.

---

## The other content files

All in `src/constants/`. Each is plain typed data.

| File | Controls | Notes |
|---|---|---|
| `contact.ts` | `CONTACT_INFO` — phones, email, Instagram · `NAV_LINKS` | Also given to the AI assistant so it can hand a buyer to a human. Update here and it changes in the footer, the contact page, and the assistant at once. |
| `categories.ts` | Category cards on the home page, footer category links | The four categories are also a TypeScript union in `src/types` — adding a fifth means editing the type too, and TypeScript will point at every place that needs updating. |
| `stats.ts` | The three figures in the stats strip | "Export Products" is derived from the catalogue. The other two are marketing claims — verify them with the client before changing. |
| `features.ts` | "Why choose us" items on the home page | Each carries a `lucide-react` icon component. |
| `pillars.ts` | The three pillars on the About page | Same shape as features. |
| `productOptions.ts` | Category filter options, enquiry form dropdown | Keep the enquiry dropdown values in step with `ProductCategory`, plus `general`. |

### Icons

`features.ts` and `pillars.ts` import icon *components* from `lucide-react`:

```ts
import { ShieldCheck, Leaf, Globe } from 'lucide-react';
```

Browse names at [lucide.dev/icons](https://lucide.dev/icons). Import the component and reference it as `Icon`, not a string.

---

## Adding a category

More involved than adding a product, because the four categories are a type:

1. `src/types/index.ts` — add to the `ProductCategory` union.
2. Run `npm run typecheck`. **TypeScript will list every place that needs updating** — the filter options, the enquiry dropdown, the `isValidCategory` guard in `Products.tsx`, the catalogue constant in `api/_lib/catalogue.ts`. Work through the errors.
3. `src/constants/categories.ts` — add a showcase card and footer link.
4. Add products in the new category.

Leaning on the type checker here is deliberate: it is what stops a new category appearing in the filter but not the enquiry form.

---

## Page copy

Longer prose — the About page narrative, the hero headline, the enquiry page intro — is written directly in the page components under `src/pages/`. It was not extracted into constants because it is written once and rarely changed, and pulling it out would add indirection without removing duplication.

| Page | File |
|---|---|
| Home | `src/pages/Home.tsx` |
| About | `src/pages/About.tsx` |
| Products (heading only) | `src/pages/Products.tsx` |
| Enquiry | `src/pages/Enquiry.tsx` |
| Contact | `src/pages/Contact.tsx` |

---

## Checking a change

```bash
cd client
npm run typecheck   # catches a bad category, a missing field, a wrong icon import
npm run dev         # http://localhost:5173
```

Content edits do not need `npm run dev:api` — that is only for the enquiry form, search, and the assistant.

Push to `main` and Vercel redeploys. See [DEPLOYMENT.md](./DEPLOYMENT.md) for verifying a deploy actually landed.

### Things worth re-checking after a catalogue change

- The **stats strip** figure updates itself now, but confirm it reads sensibly.
- **`public/sitemap.xml`** lists routes, not products, so it needs no change unless you add a page.
- **AI search** picks up new products with no redeploy of its own — it reads the same file.
