import React from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import useNotification from '../../hooks/useNotification';
import { formatDate } from '../../utils/helpers';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

export default function Notifications() {
  const { notifications, loading, refresh } = useNotification();

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 border border-slate-100 rounded-3xl shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Notifications</h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">Grievances updates, assignments and completions status logs</p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={refresh} loading={loading}>
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <div className="divide-y divide-slate-100">
        {loading ? (
          <div className="py-12">
            <Loader size="md" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Bell className="w-12 h-12 mx-auto text-slate-200 mb-2" />
            <p className="text-sm font-semibold">No notifications received yet.</p>
          </div>
        ) : (
          notifications.map((notif, index) => (
            <div key={notif.id || index} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
              <span className="text-indigo-500 mt-1">🔔</span>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800 leading-snug">{notif.title}</p>
                <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">{notif.message}</p>
                <p className="text-[9px] text-slate-400 font-medium">{formatDate(notif.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}