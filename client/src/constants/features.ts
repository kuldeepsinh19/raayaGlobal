import { ShieldCheck, Leaf, Globe, Clock, Scale, Award } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Feature {
  Icon: LucideIcon;
  title: string;
  body: string;
}

export const FEATURES: Feature[] = [
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
