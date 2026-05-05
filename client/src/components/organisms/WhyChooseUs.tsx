import { FEATURES } from '../../constants/features';
import FeatureItem from '../molecules/FeatureItem';
import SectionHeader from '../molecules/SectionHeader';

export default function WhyChooseUs() {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8 sm:mb-14">
          <SectionHeader
            label="Why choose us"
            title="Built on quality, trust, and transparency."
            className="max-w-lg"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 sm:gap-x-12 sm:gap-y-12">
          {FEATURES.map((feature, i) => (
            <FeatureItem key={feature.title} {...feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
