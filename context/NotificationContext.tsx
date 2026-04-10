import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { getLocalData, setLocalData } from '../lib/storage_helper';
import { useAuth } from './AuthContext';
import type { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  loading: boolean;
  addNotification: (userId: string, title: string, message: string, type: Notification['type']) => Promise<void>;
  sendNotificationToAll: (title: string, message: string, type: Notification['type']) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = () => {
      setLoading(true);
      const data = getLocalData<Notification[]>('notifications', []);
      setNotifications(data);
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  const addNotification = async (userId: string, title: string, message: string, type: Notification['type']) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };

    const updated = [newNotification, ...notifications];
    setNotifications(updated);
    setLocalData('notifications', updated);
  };

  const sendNotificationToAll = async (title: string, message: string, type: Notification['type']) => {
    // In a simplified system, we don't have all users easily.
    // We'll just notify the current user for now as a placeholder.
    if (user) {
        await addNotification(user.id, title, message, type);
    }
  };

  const markAsRead = async (notificationId: string) => {
    const updated = notifications.map(n => n.id === notificationId ? { ...n, read: true } : n);
    setNotifications(updated);
    setLocalData('notifications', updated);
  };

  const markAllAsRead = async () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    setLocalData('notifications', updated);
  };

  const deleteNotification = async (notificationId: string) => {
    const updated = notifications.filter(n => n.id !== notificationId);
    setNotifications(updated);
    setLocalData('notifications', updated);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      loading, 
      addNotification, 
      sendNotificationToAll,
      markAsRead, 
      markAllAsRead,
      deleteNotification, 
      unreadCount 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
