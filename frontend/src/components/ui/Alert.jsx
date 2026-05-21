import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

const icons   = { success: CheckCircle, warning: AlertCircle, error: XCircle, info: Info };
const styles  = {
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error:   'bg-red-50 border-red-200 text-red-800',
  info:    'bg-blue-50 border-blue-200 text-blue-800',
};

export default function Alert({ type = 'info', message }) {
  const Icon = icons[type];
  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${styles[type]}`}>
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}