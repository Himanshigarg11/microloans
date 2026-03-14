import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import apiClient from '../services/apiClient';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let socket;

    const bootstrap = async () => {
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      try {
        const res = await apiClient.get('/notifications');
        const list = res.data?.data ?? res.data ?? [];
        setNotifications(list);
        setUnreadCount(list.filter(n => !n.isRead).length);
      } catch (e) {
        console.error('Failed to load notifications', e);
      }

      socket = io('/', {
        path: '/socket.io',
        auth: {
          userId: user.id
        }
      });

      socket.on('notification', (payload) => {
        setNotifications(prev => [payload, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    };

    bootstrap();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user]);

  const markAllRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark notifications as read', e);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
};

