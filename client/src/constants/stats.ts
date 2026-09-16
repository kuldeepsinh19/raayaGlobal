import { products } from '../data/products';

export interface Stat {
  value: string;
  label: string;
}

export const STATS: Stat[] = [
  { value: '20+', label: 'Countries Reached' },
  // Derived, not typed in. This read "31" while the catalogue held 26 — five
  // products had been removed without the figure being updated, and a buyer
  // can count the grid on /products. Deriving it means the claim cannot drift
  // from what the site actually shows.
  { value: `${products.length}`, label: 'Export Products' },
  { value: '100%', label: 'Quality Assured' },
];
