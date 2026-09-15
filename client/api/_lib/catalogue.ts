/**
 * Grounding data for every AI feature.
 *
 * This imports the SAME product list the website renders. That is deliberate
 * and it is the most important line in this file: if the assistant read from
 * its own hand-maintained copy of the catalogue, the two would drift the moment
 * anyone added a product — and the assistant would start confidently describing
 * items the site does not sell. There is one catalogue.
 *
 * Files under api/_lib are ignored by Vercel's function router (the leading
 * underscore), so this is shared code, not an endpoint.
 */

import { products } from '../../src/data/products';
import { CONTACT_INFO } from '../../src/constants/contact';
import type { Product, ProductCategory } from '../../src/types';

export { products };
export type { Product, ProductCategory };

export const CATEGORIES: ProductCategory[] = ['fruits', 'vegetables', 'grains', 'spices'];

export const COMPANY_NAME = 'Raaya Global Solutions';

/**
 * The catalogue rendered compactly for a prompt.
 *
 * Only id, name, category and tagline — the model needs to identify products,
 * not describe images. Keeping this small matters: it is re-sent on every
 * assistant turn, so the difference between this and a verbose dump is the
 * difference between a widget that costs cents and one that costs dollars.
 */
export function catalogueForPrompt(): string {
  return products
    .map((p) => `${p.id}\t${p.name}\t${p.category}\t${p.tagline}`)
    .join('\n');
}

/** Contact details, so the assistant can hand a buyer off to a real human. */
export function contactForPrompt(): string {
  return [
    `Phone: ${CONTACT_INFO.phones.join(' / ')}`,
    `Email: ${CONTACT_INFO.email}`,
    `Instagram: @${CONTACT_INFO.instagram} (${CONTACT_INFO.instagramUrl})`,
    'Enquiry form: /enquiry on this website',
  ].join('\n');
}

export function productById(id: number): Product | undefined {
  return products.find((p) => p.id === id);
}

/**
 * Deterministic keyword search — the fallback that makes the search box work
 * with no API key, no network, and no spend.
 *
 * Scores a simple weighted term match across name, category and tagline. It is
 * not clever and is not meant to be: it exists so that an AI outage degrades
 * the search box to something that still finds "onion" when you type "onion",
 * rather than showing an error to a buyer.
 */
export function keywordSearch(query: string, limit = 12): Product[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);

  if (terms.length === 0) return products.slice(0, limit);

  const scored = products.map((product) => {
    const name = product.name.toLowerCase();
    const category = product.category.toLowerCase();
    const tagline = product.tagline.toLowerCase();

    let score = 0;
    for (const term of terms) {
      if (name.includes(term)) score += 10;
      if (category.includes(term)) score += 6;
      if (tagline.includes(term)) score += 2;
    }
    return { product, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.product);
}
