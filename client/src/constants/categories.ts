export interface ShowcaseCategory {
  label: string;
  tagline: string;
  path: string;
  imageUrl: string;
}

export const SHOWCASE_CATEGORIES: ShowcaseCategory[] = [
  {
    label: 'Fruits',
    tagline: 'Mangoes, grapes, pomegranates and more',
    path: '/products?category=fruits',
    imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=900&h=700&fit=crop',
  },
  {
    label: 'Vegetables',
    tagline: 'Onion, tomato, garlic from farm to shipment',
    path: '/products?category=vegetables',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&h=700&fit=crop',
  },
  {
    label: 'Grains',
    tagline: 'Basmati rice, wheat and premium cereals',
    path: '/products?category=grains',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=900&h=700&fit=crop',
  },
  {
    label: 'Spices',
    tagline: 'Cumin, turmeric, pepper and rare blends',
    path: '/products?category=spices',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=900&h=700&fit=crop',
  },
];

export const FOOTER_PRODUCT_CATEGORIES = [
  { label: 'Fruits', path: '/products?category=fruits' },
  { label: 'Vegetables', path: '/products?category=vegetables' },
  { label: 'Grains', path: '/products?category=grains' },
  { label: 'Spices', path: '/products?category=spices' },
];
