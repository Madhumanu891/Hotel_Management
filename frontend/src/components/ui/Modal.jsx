import { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size      = 'md',
  closable  = true,
}) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-4xl',
  };

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => {
      if (e.key === 'Escape' && closable) onClose();
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, closable, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closable ? onClose : undefined}
      />

      {/* Modal */}
      <div className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full ${sizes[size] || sizes.md} max-h-[90vh] flex flex-col`}>
        {/* Header */}
        {(title || closable) && (
          <div className="flex items-center justify-between px-6 py-4 border-b dark:border-slate-700 flex-shrink-0">
            {title && (
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {title}
              </h2>
            )}
            {closable && (
              <button
                onClick={onClose}
                className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t dark:border-slate-700 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}