import React from 'react';

export default function Input({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  ...props
}) {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-4 h-4 text-slate-400" />
          </div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-lg border bg-white text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed ${
            Icon ? 'pl-10 pr-3.5' : 'px-3.5'
          } py-2.5 ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-300'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
