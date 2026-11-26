import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-6 bg-white rounded-xl border border-slate-200 ${className}`}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mb-5">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
