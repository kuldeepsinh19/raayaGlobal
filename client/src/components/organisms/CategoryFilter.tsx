import { CATEGORY_FILTER_OPTIONS, type FilterOption } from '../../constants/productOptions';

interface CategoryFilterProps {
  active: FilterOption;
  onChange: (category: FilterOption) => void;
}

export default function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 border-b border-gray-200">
      {CATEGORY_FILTER_OPTIONS.map(({ value, label }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`pb-3 text-xs sm:text-sm font-medium border-b-2 transition-colors -mb-px ${
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
