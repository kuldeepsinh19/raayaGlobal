interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export default function SectionHeader({ title, subtitle, align = 'left' }: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : '';

  return (
    <div className={`max-w-2xl ${alignClass}`}>
      <h2 className="text-headline font-semibold text-[#0a0a0a] tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-xl-body text-gray-500 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
