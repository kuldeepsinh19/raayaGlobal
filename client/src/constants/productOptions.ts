import type { ProductCategory } from '../types';

export type FilterOption = ProductCategory | 'all';

export const CATEGORY_FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'grains', label: 'Grains' },
  { value: 'spices', label: 'Spices' },
];

export const ENQUIRY_PRODUCT_OPTIONS = [
  { value: 'fruits', label: 'Fruits' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'grains', label: 'Grains' },
  { value: 'spices', label: 'Spices' },
  { value: 'general', label: 'General Inquiry' },
];
