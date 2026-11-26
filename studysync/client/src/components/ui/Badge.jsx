import React from 'react';

const VARIANTS = {
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  yellow: 'bg-amber-50 text-amber-700 border-amber-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  purple: 'bg-violet-50 text-violet-700 border-violet-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function Badge({
  children,
  variant = 'indigo',
  size = 'sm',
  className = '',
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.indigo;
  const sizeClass =
    size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${variantClass} ${sizeClass} ${className}`}
    >
      {children}
    </span>
  );
}
