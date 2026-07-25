import { useState, useEffect } from 'react';
import useSocket from './useSocket';
import useAuth from './useAuth';
import { fetchNotificationsHistory } from '../services/notification.service';

export default function useNotification() {
  const { notifications, unreadCount, clearUnread, setNotifications } = useSocket();
  const { role, isAuthenticated } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    if (!isAuthenticated || !role || role === 'ADMIN') return;
    setLoading(true);
    try {
      const response = await fetchNotificationsHistory(role);
      setHistory(response.data || []);
      // Sync notifications context state
      if (response.data) {
        setNotifications(response.data);
      }
    } catch (err) {
      console.error('Failed to load notifications history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory();
    }
  }, [isAuthenticated, role]);

  return {
    notifications: notifications.length > 0 ? notifications : history,
    unreadCount,
    clearUnread,
    loading,
    refresh: loadHistory,
  };
}