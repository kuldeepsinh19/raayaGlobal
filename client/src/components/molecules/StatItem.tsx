import type { Stat } from '../../constants/stats';

export default function StatItem({ value, label }: Stat) {
  return (
    <div className="py-10 px-8 text-center first:pl-0 last:pr-0">
      <p className="text-4xl font-semibold text-[#0a0a0a] tracking-tight">{value}</p>
      <p className="mt-1.5 text-sm text-gray-500 uppercase tracking-widest">{label}</p>
    </div>
  );
}
