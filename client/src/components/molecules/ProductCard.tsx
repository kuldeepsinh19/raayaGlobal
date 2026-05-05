import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import CategoryBadge from '../atoms/CategoryBadge';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group border border-gray-200 hover:border-gray-400 transition-colors rounded-md overflow-hidden bg-white">
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="p-3 sm:p-5">
        <CategoryBadge category={product.category} />
        <h3 className="mt-1 sm:mt-1.5 text-sm sm:text-base font-semibold text-[#0a0a0a]">{product.name}</h3>
        <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-2">{product.tagline}</p>
        <Link
          to={`/enquiry?product=${encodeURIComponent(product.name)}`}
          className="inline-block mt-3 sm:mt-4 text-xs sm:text-sm font-medium text-[#0a0a0a] border-b border-[#0a0a0a] hover:text-green-600 hover:border-green-600 transition-colors pb-0.5"
        >
          Enquire
        </Link>
      </div>
    </div>
  );
}
