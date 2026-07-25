import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import useNotification from '../../hooks/useNotification';
import { formatDate } from '../../utils/helpers';
import Loader from '../common/Loader';

export default function NotificationPanel({ onClose }) {
  const { notifications, loading, refresh } = useNotification();
  const navigate = useNavigate();
  const { role } = useNotification(); // get current role context

  const handleViewAll = () => {
    onClose();
    if (role === 'STUDENT') {
      navigate('/student/notifications');
    } else {
      navigate('/staff/notifications');
    }
  };

  return (
    <div className="flex flex-col max-h-[400px]">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Notifications</h4>
        <button 
          onClick={refresh}
          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700"
        >
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {loading ? (
          <div className="p-6">
            <Loader size="sm" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto text-slate-200 mb-2" />
            <p className="text-xs font-semibold">All caught up!</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">No new notifications.</p>
          </div>
        ) : (
          notifications.slice(0, 5).map((notif, index) => (
            <div key={notif.id || index} className="p-4 hover:bg-slate-50 transition-colors">
              <p className="text-xs font-bold text-slate-800 leading-snug">{notif.title}</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-1 leading-normal">{notif.message}</p>
              <p className="text-[9px] text-slate-400 font-medium mt-1.5">{formatDate(notif.createdAt)}</p>
            </div>
          ))
        )}
      </div>

      <button
        onClick={handleViewAll}
        className="p-3 text-center text-xs font-bold text-indigo-600 hover:bg-slate-50 border-t border-slate-100 w-full"
      >
        View All Notifications
      </button>
    </div>
  );
}