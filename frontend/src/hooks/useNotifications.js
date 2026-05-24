import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';

const STORAGE_KEY = 'nexora_notifications';

const generateNotification = (type, data) => ({
  id:        `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
  type,
  ...data,
  read:      false,
  createdAt: new Date().toISOString(),
});

export const useNotifications = () => {
  const { user } = useAuthStore();

  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${user?._id}`);
      return stored ? JSON.parse(stored) : getDefaultNotifications(user?.role);
    } catch {
      return getDefaultNotifications(user?.role);
    }
  });

  const save = (notifs) => {
    setNotifications(notifs);
    try {
      localStorage.setItem(`${STORAGE_KEY}_${user?._id}`, JSON.stringify(notifs));
    } catch { /* non-critical */ }
  };

  const addNotification = useCallback((type, data) => {
    const notif = generateNotification(type, data);
    setNotifications(prev => {
      const updated = [notif, ...prev].slice(0, 50);
      try {
        localStorage.setItem(`${STORAGE_KEY}_${user?._id}`, JSON.stringify(updated));
      } catch { /* non-critical */ }
      return updated;
    });
  }, [user?._id]);

  const markRead = (id) => {
    save(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    save(notifications.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id) => {
    save(notifications.filter(n => n.id !== id));
  };

  const clearAll = () => save([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markRead,
    markAllRead,
    removeNotification,
    clearAll,
  };
};

function getDefaultNotifications(role) {
  const now   = new Date();
  const ago1h = new Date(now - 60 * 60 * 1000).toISOString();
  const ago2h = new Date(now - 2 * 60 * 60 * 1000).toISOString();
  const ago1d = new Date(now - 24 * 60 * 60 * 1000).toISOString();

  if (role === 'guest') return [
    {
      id: 'demo-1', type: 'booking_confirmed', read: false, createdAt: ago1h,
      title:   'Booking Confirmed!',
      message: 'Your booking BK-2026-DEMO has been confirmed.',
      icon:    'check',
    },
    {
      id: 'demo-2', type: 'welcome', read: false, createdAt: ago1d,
      title:   'Welcome to NexoraHotels!',
      message: 'Your account has been created. Start exploring hotels.',
      icon:    'hotel',
    },
  ];

  if (role === 'receptionist') return [
    {
      id: 'demo-1', type: 'arrival', read: false, createdAt: ago1h,
      title:   'Guest Arriving Soon',
      message: '3 guests are expected to check in today.',
      icon:    'login',
    },
  ];

  if (role === 'housekeeping') return [
    {
      id: 'demo-1', type: 'task', read: false, createdAt: ago2h,
      title:   'New Cleaning Task',
      message: 'Room 205 needs checkout cleaning — High priority.',
      icon:    'clean',
    },
  ];

  if (role === 'hotel_manager' || role === 'super_admin') return [
    {
      id: 'demo-1', type: 'revenue', read: false, createdAt: ago1h,
      title:   'Daily Revenue Report',
      message: 'Today\'s revenue: ₹45,000 — 12% above target.',
      icon:    'chart',
    },
    {
      id: 'demo-2', type: 'leave', read: false, createdAt: ago2h,
      title:   'Leave Request Pending',
      message: '2 staff members have pending leave requests.',
      icon:    'calendar',
    },
  ];

  return [];
}