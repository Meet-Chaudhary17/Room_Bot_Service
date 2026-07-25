import React, { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { connectSocket, disconnectSocket } from '../services/socket';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && token) {
      const socketInstance = connectSocket(token);
      setSocket(socketInstance);

      // Listen for incoming notifications
      socketInstance.on('notification', (data) => {
        setNotifications((prev) => [data, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Display toast alert
        toast.info(data.message, {
          duration: 5000,
          position: 'top-right',
          style: {
            border: '1px solid #4f46e5',
            padding: '16px',
            color: '#1e293b',
            fontWeight: 500
          },
          icon: '🔔'
        });
      });

      return () => {
        socketInstance.off('notification');
        disconnectSocket();
        setSocket(null);
      };
    } else {
      disconnectSocket();
      setSocket(null);
    }
  }, [isAuthenticated, token]);

  const clearUnread = () => setUnreadCount(0);

  const value = {
    socket,
    notifications,
    unreadCount,
    clearUnread,
    setNotifications
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};