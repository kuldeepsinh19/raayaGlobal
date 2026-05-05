import { STATS } from '../../constants/stats';
import StatItem from '../molecules/StatItem';

export default function StatsStrip() {
  return (
    <section className="border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-3 divide-x divide-gray-200">
          {STATS.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
