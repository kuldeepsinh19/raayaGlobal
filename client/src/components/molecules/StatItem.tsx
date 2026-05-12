import type { Stat } from '../../constants/stats';

export default function StatItem({ value, label }: Stat) {
  return (
    <div className="py-5 sm:py-10 px-2 sm:px-8 text-center">
      <p className="text-xl sm:text-3xl md:text-4xl font-semibold text-[#0a0a0a] tracking-tight">{value}</p>
      <p className="mt-1 text-[9px] sm:text-sm text-gray-500 uppercase tracking-widest leading-tight">{label}</p>
    </div>
  );
}
