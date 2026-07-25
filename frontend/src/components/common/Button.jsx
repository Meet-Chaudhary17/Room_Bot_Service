import React from 'react';
import Loader from './Loader';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon = null,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  const baseStyle = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus:ring-indigo-500 shadow-lg shadow-indigo-100',
    secondary: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:bg-indigo-200 focus:ring-indigo-400',
    outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:ring-slate-500',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-500 shadow-lg shadow-rose-100',
    ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:ring-slate-400'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        ${baseStyle}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${(loading || disabled) ? 'opacity-65 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader size="sm" className="text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
}