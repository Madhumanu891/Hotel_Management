import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, X, CheckCheck, Trash2, Check,
  CheckCircle, Calendar, ChefHat, BarChart3,
  Hotel, AlertCircle, Clock,
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

const iconMap = {
  check:    CheckCircle,
  hotel:    Hotel,
  login:    CheckCircle,
  clean:    AlertCircle,
  chart:    BarChart3,
  calendar: Calendar,
  food:     ChefHat,
};

const typeColors = {
  booking_confirmed: 'bg-green-100 text-green-600',
  welcome:           'bg-primary-100 text-primary-600',
  arrival:           'bg-blue-100 text-blue-600',
  task:              'bg-orange-100 text-orange-600',
  revenue:           'bg-purple-100 text-purple-600',
  leave:             'bg-yellow-100 text-yellow-600',
  default:           'bg-gray-100 text-gray-600',
};

const timeAgo = (dateStr) => {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export default function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const {
    notifications, unreadCount,
    markRead, markAllRead,
    removeNotification, clearAll,
  } = useNotifications();

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary-600" />
              <span className="font-semibold text-gray-900 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="h-8 w-8 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-medium">No notifications</p>
                <p className="text-xs text-gray-300 mt-1">You are all caught up!</p>
              </div>
            ) : (
              notifications.map(notif => {
                const Icon  = iconMap[notif.icon] || AlertCircle;
                const color = typeColors[notif.type] || typeColors.default;

                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 cursor-pointer ${
                      !notif.read ? 'bg-primary-50/30' : ''
                    }`}
                    onClick={() => markRead(notif.id)}
                  >
                    {/* Icon */}
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium ${notif.read ? 'text-gray-600' : 'text-gray-900'}`}>
                          {notif.title}
                        </p>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notif.read && (
                            <span className="h-2 w-2 bg-primary-600 rounded-full" />
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                            className="text-gray-300 hover:text-gray-500"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t bg-gray-50 text-center">
              <button
                onClick={() => setOpen(false)}
                className="text-xs text-primary-600 font-medium hover:text-primary-700"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}