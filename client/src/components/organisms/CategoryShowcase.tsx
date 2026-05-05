import { SHOWCASE_CATEGORIES } from '../../constants/categories';
import CategoryCard from '../molecules/CategoryCard';
import SectionHeader from '../molecules/SectionHeader';

export default function CategoryShowcase() {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8 sm:mb-12">
          <SectionHeader
            label="What we export"
            title={
              <>
                Four categories.{' '}
                <br className="hidden sm:block" />
                Endless possibilities.
              </>
            }
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {SHOWCASE_CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.label} {...cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
