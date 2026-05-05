import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { products } from '../data/products';
import { type FilterOption } from '../constants/productOptions';
import type { ProductCategory } from '../types';
import ProductCard from '../components/molecules/ProductCard';
import CategoryFilter from '../components/organisms/CategoryFilter';
import EnquiryCta from '../components/organisms/EnquiryCta';

function isValidCategory(value: string): value is ProductCategory {
  return ['fruits', 'vegetables', 'grains', 'spices'].includes(value);
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get('category') ?? '';
  const activeFilter: FilterOption = isValidCategory(categoryParam) ? categoryParam : 'all';

  const filtered =
    activeFilter === 'all'
      ? products
      : products.filter((p) => p.category === activeFilter);

  function handleFilterChange(category: FilterOption) {
    if (category === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  }

  useEffect(() => {
    if (categoryParam && !isValidCategory(categoryParam)) {
      setSearchParams({});
    }
  }, [categoryParam, setSearchParams]);

  return (
    <>
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-6 sm:mb-10">
            <p className="text-xs uppercase tracking-widest text-green-600 mb-3">Our products</p>
            <h1 className="text-headline font-semibold text-[#0a0a0a] tracking-tight">
              Premium exports from India.
            </h1>
          </div>

          <div className="mb-5 sm:mb-8">
            <CategoryFilter active={activeFilter} onChange={handleFilterChange} />
          </div>

          <p className="text-xs sm:text-sm text-gray-400 mb-5 sm:mb-8">
            Showing {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <EnquiryCta />
    </>
  );
}
