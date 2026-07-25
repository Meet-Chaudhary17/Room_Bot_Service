import React from 'react';
import { Bell } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';

export default function Notifications() {
  return (
    <div className="max-w-3xl mx-auto bg-white p-6 border border-slate-100 rounded-3xl shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Admin Logs</h2>
          <p className="text-xs font-semibold text-slate-400 mt-1">Audit log indicators for administrative actions</p>
        </div>
      </div>

      <EmptyState
        title="No administrative alerts"
        description="System operations are running smoothly. Audit log features can be implemented here."
        icon={Bell}
      />
    </div>
  );
}