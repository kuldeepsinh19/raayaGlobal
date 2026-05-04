import { Leaf, ShieldCheck, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Pillar {
  Icon: LucideIcon;
  title: string;
  body: string;
}

export const PILLARS: Pillar[] = [
  {
    Icon: Leaf,
    title: 'Sustainable Sourcing',
    body: 'We work hand-in-hand with local farming communities, ensuring eco-friendly cultivation practices and fair compensation throughout the supply chain.',
  },
  {
    Icon: ShieldCheck,
    title: 'Quality Assurance',
    body: 'Stringent quality control at every stage, from farm inspection and grading to packaging and pre-shipment checks, ensures only the best reaches our buyers.',
  },
  {
    Icon: Globe,
    title: 'Global Standards',
    body: 'Our operations comply with APEDA, FSSAI, and international food safety protocols, giving importing partners complete confidence in regulatory compliance.',
  },
];
