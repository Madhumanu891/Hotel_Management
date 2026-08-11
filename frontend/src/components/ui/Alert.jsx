import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { useState } from 'react';

const config = {
  success: {
    icon:       CheckCircle,
    container:  'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
    icon_color: 'text-green-600 dark:text-green-400',
    text:       'text-green-800 dark:text-green-300',
  },
  error: {
    icon:       XCircle,
    container:  'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
    icon_color: 'text-red-600 dark:text-red-400',
    text:       'text-red-800 dark:text-red-300',
  },
  warning: {
    icon:       AlertCircle,
    container:  'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800',
    icon_color: 'text-yellow-600 dark:text-yellow-400',
    text:       'text-yellow-800 dark:text-yellow-300',
  },
  info: {
    icon:       Info,
    container:  'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800',
    icon_color: 'text-blue-600 dark:text-blue-400',
    text:       'text-blue-800 dark:text-blue-300',
  },
};

export default function Alert({
  type       = 'info',
  message,
  title,
  dismissible = false,
  className   = '',
}) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const c    = config[type] || config.info;
  const Icon = c.icon;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl ${c.container} ${className}`}>
      <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${c.icon_color}`} />
      <div className="flex-1 min-w-0">
        {title && (
          <p className={`font-semibold text-sm mb-0.5 ${c.text}`}>{title}</p>
        )}
        {message && (
          <p className={`text-sm ${c.text}`}>{message}</p>
        )}
      </div>
      {dismissible && (
        <button
          onClick={() => setVisible(false)}
          className={`flex-shrink-0 ${c.icon_color} hover:opacity-70`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}