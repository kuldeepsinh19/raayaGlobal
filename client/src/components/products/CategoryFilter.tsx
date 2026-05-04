import { ProductCategory } from '../../types';

type FilterOption = ProductCategory | 'all';

interface CategoryFilterProps {
  active: FilterOption;
  onChange: (category: FilterOption) => void;
}

const OPTIONS: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'grains', label: 'Grains' },
  { value: 'spices', label: 'Spices' },
];

export default function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-gray-200">
      {OPTIONS.map(({ value, label }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              isActive
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-400 hover:text-[#0a0a0a]'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
