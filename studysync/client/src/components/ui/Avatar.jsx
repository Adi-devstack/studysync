import React from 'react';

const SIZES = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
};

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function Avatar({
  src,
  name = '',
  size = 'md',
  className = '',
}) {
  const sizeClass = SIZES[size] || SIZES.md;

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        className={`${sizeClass} rounded-full object-cover border border-slate-200 flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-semibold flex items-center justify-center flex-shrink-0 select-none ${className}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
