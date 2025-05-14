
import { useState, useEffect } from 'react';
import { Notification } from '@/components/layout/NotificationDropdown';
import { useToast } from '@/hooks/use-toast';

const NOTIFICATIONS_STORAGE_KEY = 'vision-hub-notifications';

export const useNotifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from storage on component mount
  useEffect(() => {
    const storedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (storedNotifications) {
      try {
        setNotifications(JSON.parse(storedNotifications));
      } catch (error) {
        console.error('Failed to parse stored notifications:', error);
      }
    }
  }, []);

  // Save notifications to storage whenever they change
  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      id: `notification-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Also show a toast for real-time feedback
    if (toast) {
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'error' ? 'destructive' : 'default',
      });
    }
    
    return newNotification;
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification
  };
};
