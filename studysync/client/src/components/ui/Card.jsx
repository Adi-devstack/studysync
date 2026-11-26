import React from 'react';

export default function Card({
  children,
  className = '',
  hover = true,
  padding = 'p-5',
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-slate-200 ${
        hover ? 'hover:shadow-md transition-all duration-200' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
