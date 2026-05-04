interface SectionLabelProps {
  children: string;
  className?: string;
}

export default function SectionLabel({ children, className = '' }: SectionLabelProps) {
  return (
    <p className={`text-xs uppercase tracking-widest text-green-600${className ? ` ${className}` : ''}`}>
      {children}
    </p>
  );
}
