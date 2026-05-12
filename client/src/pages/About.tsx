import EnquiryCta from '../components/organisms/EnquiryCta';
import PillarCard from '../components/molecules/PillarCard';
import { PILLARS } from '../constants/pillars';

const ABOUT_METRICS = [
  { label: 'Products Exported', value: '31+' },
  { label: 'Countries Served', value: '20+' },
  { label: 'Order Flexibility', value: '100 kg – 1000 MT' },
  { label: 'Response Time', value: 'Within 24 hours' },
];

export default function About() {
  return (
    <>
      <section className="bg-[#0a0a0a] py-16 sm:py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-xs uppercase tracking-widest text-green-500 mb-5">About us</p>
          <h1 className="text-hero font-semibold text-white tracking-tight leading-[1.08] max-w-3xl">
            Growing from the heart of India. Reaching every corner of the world.
          </h1>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            <div>
              <p className="text-xl-body text-gray-500 leading-relaxed">
                Raaya Global Solutions was founded with a single conviction: India's
                extraordinary agricultural produce deserves a larger stage.
                From the spice gardens of Kerala to the wheat fields of Punjab and
                the mango orchards of Maharashtra, we work directly with farmers to
                bring the finest produce to international markets.
              </p>
              <p className="mt-6 text-xl-body text-gray-500 leading-relaxed">
                Our team handles every step of the export journey: sourcing,
                quality certification, packaging, documentation, and logistics.
                We maintain lasting relationships with our buyers because we treat
                every shipment as a reflection of India's agricultural legacy.
              </p>
            </div>
            <div className="space-y-6">
              {ABOUT_METRICS.map(({ label, value }) => (
                <div key={label} className="flex items-baseline justify-between gap-4 border-b border-gray-100 pb-4">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm sm:text-base font-semibold text-[#0a0a0a] shrink-0 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-24 bg-[#f9fafb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8 sm:mb-14">
            <p className="text-xs uppercase tracking-widest text-green-600 mb-3">Our pillars</p>
            <h2 className="text-headline font-semibold text-[#0a0a0a] tracking-tight max-w-md">
              Principles that guide everything we do.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {PILLARS.map((pillar, i) => (
              <PillarCard key={pillar.title} {...pillar} index={i} />
            ))}
          </div>
        </div>
      </section>

      <EnquiryCta />
    </>
  );
}
