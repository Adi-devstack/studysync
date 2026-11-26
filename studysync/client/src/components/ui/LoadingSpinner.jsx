import React from 'react';

const SIZES = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-[3px]',
};

export default function LoadingSpinner({
  size = 'md',
  text = '',
  fullScreen = false,
  className = '',
}) {
  const sizeClass = SIZES[size] || SIZES.md;

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeClass} rounded-full border-slate-200 border-t-indigo-600 animate-spin`}
      />
      {text && <p className="text-sm text-slate-500 font-medium">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}
