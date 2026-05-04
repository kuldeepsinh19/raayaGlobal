import Hero from '../components/organisms/Hero';
import StatsStrip from '../components/organisms/StatsStrip';
import CategoryShowcase from '../components/organisms/CategoryShowcase';
import WhyChooseUs from '../components/organisms/WhyChooseUs';
import EnquiryCta from '../components/organisms/EnquiryCta';

export default function Home() {
  return (
    <>
      <Hero />
      <StatsStrip />
      <CategoryShowcase />
      <WhyChooseUs />
      <EnquiryCta />
    </>
  );
}
