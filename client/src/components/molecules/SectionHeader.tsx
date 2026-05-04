import type { ReactNode } from 'react';
import SectionLabel from '../atoms/SectionLabel';

interface SectionHeaderProps {
  label?: string;
  title: ReactNode;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export default function SectionHeader({
  label,
  title,
  subtitle,
  align = 'left',
  className = '',
}: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : '';

  return (
    <div className={`${alignClass} ${className}`.trim()}>
      {label && <SectionLabel className="mb-3">{label}</SectionLabel>}
      <h2 className="text-headline font-semibold text-[#0a0a0a] tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-xl-body text-gray-500 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
