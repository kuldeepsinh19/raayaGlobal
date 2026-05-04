import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { Feature } from '../../constants/features';

interface FeatureItemProps extends Feature {
  index: number;
}

export default function FeatureItem({ Icon, title, body, index }: FeatureItemProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Icon size={22} strokeWidth={1.5} className="text-green-600 mb-4" />
      <h3 className="text-base font-semibold text-[#0a0a0a] mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
    </motion.div>
  );
}
