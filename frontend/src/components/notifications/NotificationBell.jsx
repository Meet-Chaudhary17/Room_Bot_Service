import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import useNotification from '../../hooks/useNotification';
import NotificationPanel from './NotificationPanel';

export default function NotificationBell() {
  const { unreadCount, clearUnread } = useNotification();
  const [panelOpen, setPanelOpen] = useState(false);

  const togglePanel = () => {
    setPanelOpen(!panelOpen);
    if (!panelOpen) {
      clearUnread();
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={togglePanel}
        className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 relative border border-slate-100 focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
        )}
      </button>

      {panelOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setPanelOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
            <NotificationPanel onClose={() => setPanelOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
}