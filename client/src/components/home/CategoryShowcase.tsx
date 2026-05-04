import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const CATEGORIES = [
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

function CategoryCard({ label, tagline, path, imageUrl, index }: typeof CATEGORIES[0] & { index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link
        to={path}
        className="group block relative aspect-[4/3] overflow-hidden rounded-lg"
      >
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

export default function CategoryShowcase() {
  return (
    <section className="py-24 bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-green-600 mb-3">What we export</p>
          <h2 className="text-headline font-semibold text-[#0a0a0a] tracking-tight">
            Four categories. <br className="hidden sm:block" />Endless possibilities.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.label} {...cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
