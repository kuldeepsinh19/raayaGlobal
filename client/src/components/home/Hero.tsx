import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function Hero() {
  return (
    <section className="min-h-[92vh] bg-white flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.p
              variants={fadeUp}
              className="text-sm font-medium text-green-600 uppercase tracking-widest mb-6"
            >
              Agricultural Exports from India
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="text-hero font-semibold text-[#0a0a0a] tracking-tight leading-[1.08]"
            >
              Connecting India's Finest Produce to the World
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-xl text-gray-500 leading-relaxed max-w-lg"
            >
              Raaya Global Solutions exports premium vegetables, fruits, grains,
              and spices sourced directly from Indian farms, meeting international
              quality standards with every shipment.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                Explore Products
                <ArrowRight size={16} strokeWidth={1.75} />
              </Link>
              <Link
                to="/enquiry"
                className="inline-flex items-center gap-2 border border-[#0a0a0a] text-[#0a0a0a] px-6 py-3 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                Send an Enquiry
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="hidden lg:block"
          >
            <div className="relative aspect-[5/4] rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=960&fit=crop"
                alt="Fresh Indian produce ready for export"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/5" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
