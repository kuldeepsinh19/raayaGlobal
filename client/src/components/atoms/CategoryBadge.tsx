import type { ProductCategory } from '../../types';

const LABELS: Record<ProductCategory, string> = {
  fruits: 'Fruits',
  vegetables: 'Vegetables',
  grains: 'Grains',
  spices: 'Spices',
};

interface CategoryBadgeProps {
  category: ProductCategory;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span className="text-[11px] uppercase tracking-widest font-medium text-green-600">
      {LABELS[category]}
    </span>
  );
}
