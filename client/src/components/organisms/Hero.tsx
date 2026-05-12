import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Button from '../atoms/Button';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function Hero() {
  return (
    <section className="md:min-h-[92vh] bg-white flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full py-16 sm:py-20 md:py-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div variants={stagger} initial="hidden" animate="visible">
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
              className="mt-4 sm:mt-6 text-base sm:text-xl text-gray-500 leading-relaxed max-w-lg"
            >
              Raaya Global Solutions exports premium vegetables, fruits, grains,
              and spices sourced directly from Indian farms, meeting international
              quality standards with every shipment.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 sm:mt-10 flex flex-wrap gap-4">
              <Button
                to="/products"
                variant="primary"
                icon={<ArrowRight size={16} strokeWidth={1.75} />}
              >
                Explore Products
              </Button>
              <Button to="/enquiry" variant="outline-dark">
                Send an Enquiry
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="hidden md:block"
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
