import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label,
  error,
  icon: Icon = null,
  type = 'text',
  id,
  required = false,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-4 text-slate-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        <input
          id={id}
          type={inputType}
          required={required}
          className={`
            w-full py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none
            ${Icon ? 'pl-11' : 'pl-4'}
            ${isPassword ? 'pr-11' : 'pr-4'}
            ${error 
              ? 'border-rose-300 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500' 
              : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}
          `}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {error && (
        <span className="text-xs font-medium text-rose-500 pl-1">
          {error}
        </span>
      )}
    </div>
  );
}