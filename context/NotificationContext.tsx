import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
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
    if (!user) {
        setNotifications([]);
        setLoading(false);
        return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false });
      
      if (data) {
        setNotifications(data as Notification[]);
      }
      setLoading(false);
    };

    fetchNotifications();

    const subscription = supabase
        .channel(`notifications-${user.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `userId=eq.${user.id}` }, (payload) => {
            if (payload.eventType === 'INSERT') {
                setNotifications(prev => [payload.new as Notification, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
                setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new as Notification : n));
            } else if (payload.eventType === 'DELETE') {
                setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
            }
        })
        .subscribe();

    return () => {
        supabase.removeChannel(subscription);
    };
  }, [user]);

  const addNotification = async (userId: string, title: string, message: string, type: Notification['type']) => {
    const newNotification = {
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };

    const { error } = await supabase
        .from('notifications')
        .insert([newNotification]);
    
    if (error) throw error;
  };

  const sendNotificationToAll = async (title: string, message: string, type: Notification['type']) => {
    // In a real app, this might be a server-side function or a broadcast.
    // For now, we'll just notify the current user if admin, or implement a logic to notify everyone.
    // If we want to notify ALL users, we'd need to fetch all user IDs or use a broadcast channel.
    // Let's assume we have a 'profiles' table we can get IDs from.
    const { data: profiles } = await supabase.from('profiles').select('id');
    if (profiles) {
        const notifications = profiles.map(p => ({
            userId: p.id,
            title,
            message,
            type,
            read: false,
            createdAt: new Date().toISOString()
        }));
        await supabase.from('notifications').insert(notifications);
    }
  };

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
    
    if (error) throw error;
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('userId', user.id);
    
    if (error) throw error;
  };

  const deleteNotification = async (notificationId: string) => {
    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
    
    if (error) throw error;
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
