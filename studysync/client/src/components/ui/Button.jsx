import React from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-sm hover:shadow focus:ring-indigo-500',
  secondary:
    'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 focus:ring-indigo-500',
  outline:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 focus:ring-indigo-500',
  danger:
    'bg-red-600 text-white hover:bg-red-700 shadow-sm focus:ring-red-500',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
