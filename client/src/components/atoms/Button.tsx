import { Link } from 'react-router-dom';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'outline-dark' | 'outline-light' | 'text';

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 text-sm font-medium rounded-md hover:bg-green-700 transition-colors',
  'outline-dark':
    'inline-flex items-center gap-2 border border-[#0a0a0a] text-[#0a0a0a] px-6 py-3 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors',
  'outline-light':
    'flex-shrink-0 inline-flex items-center gap-2 border border-white text-white px-7 py-3.5 text-sm font-medium rounded-md hover:bg-white hover:text-[#0a0a0a] transition-colors',
  text: 'inline-block text-sm font-medium text-[#0a0a0a] border-b border-[#0a0a0a] hover:text-green-600 hover:border-green-600 transition-colors pb-0.5',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  to?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  to,
  icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const cls = `${variantClass[variant]}${className ? ` ${className}` : ''}`;

  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
        {icon}
      </Link>
    );
  }

  return (
    <button className={cls} {...props}>
      {children}
      {icon}
    </button>
  );
}
