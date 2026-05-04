import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ShieldCheck,
  Leaf,
  Globe,
  Clock,
  Scale,
  Award,
} from 'lucide-react';

const FEATURES = [
  {
    Icon: ShieldCheck,
    title: 'Premium Quality',
    body: 'Every product is inspected against international food safety standards before packaging and dispatch.',
  },
  {
    Icon: Leaf,
    title: 'Ethical Sourcing',
    body: 'We partner directly with local farmers, ensuring fair trade and environmentally responsible cultivation.',
  },
  {
    Icon: Globe,
    title: 'Global Reach',
    body: 'Established export channels to over 20 countries across Asia, Europe, the Middle East, and Africa.',
  },
  {
    Icon: Clock,
    title: 'Timely Delivery',
    body: 'Reliable logistics and end-to-end shipment tracking ensure produce arrives fresh, on schedule.',
  },
  {
    Icon: Scale,
    title: 'Flexible Orders',
    body: 'We accommodate order volumes from 100 kg to 1000 MT, tailored to your business requirements.',
  },
  {
    Icon: Award,
    title: 'Certified Products',
    body: 'Our produce meets APEDA, FSSAI, and relevant international certification requirements.',
  },
];

function FeatureItem({ Icon, title, body, index }: typeof FEATURES[0] & { index: number }) {
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

export default function WhyChooseUs() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-14">
          <p className="text-xs uppercase tracking-widest text-green-600 mb-3">Why choose us</p>
          <h2 className="text-headline font-semibold text-[#0a0a0a] tracking-tight max-w-lg">
            Built on quality, trust, and transparency.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
          {FEATURES.map((feature, i) => (
            <FeatureItem key={feature.title} {...feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
