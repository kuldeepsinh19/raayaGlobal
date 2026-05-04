import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import type { ShowcaseCategory } from '../../constants/categories';

interface CategoryCardProps extends ShowcaseCategory {
  index: number;
}

export default function CategoryCard({ label, tagline, path, imageUrl, index }: CategoryCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link to={path} className="group block relative aspect-[4/3] overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt={label}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute bottom-0 left-0 p-6">
          <p className="text-xl font-semibold text-white tracking-tight">{label}</p>
          <p className="text-sm text-white/70 mt-1">{tagline}</p>
        </div>
      </Link>
    </motion.div>
  );
}
