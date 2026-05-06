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
            className={`pb-3 text-xs sm:text-sm transition-all duration-200 -mb-px ${
              isActive
                ? 'border-b-3 border-green-600 text-green-600 font-semibold'
                : 'border-b-2 border-transparent text-gray-400 hover:text-green-600 hover:border-green-600'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
