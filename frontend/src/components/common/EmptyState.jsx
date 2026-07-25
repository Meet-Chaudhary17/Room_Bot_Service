import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function EmptyState({
  title = 'No records found',
  description = 'There are no active records in this list.',
  icon: Icon = HelpCircle,
  children
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-slate-100 rounded-2xl">
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 leading-tight mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-400 font-medium max-w-sm mb-4">
        {description}
      </p>
      {children}
    </div>
  );
}