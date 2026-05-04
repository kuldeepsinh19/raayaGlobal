const STATS = [
  { value: '20+', label: 'Countries Reached' },
  { value: '31', label: 'Export Products' },
  { value: '100%', label: 'Quality Assured' },
];

export default function StatsStrip() {
  return (
    <section className="border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-3 divide-x divide-gray-200">
          {STATS.map(({ value, label }) => (
            <div key={label} className="py-10 px-8 text-center first:pl-0 last:pr-0">
              <p className="text-4xl font-semibold text-[#0a0a0a] tracking-tight">{value}</p>
              <p className="mt-1.5 text-sm text-gray-500 uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
