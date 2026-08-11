import { Loader2 } from 'lucide-react';

const variants = {
  primary:   'bg-primary-700 hover:bg-primary-800 active:bg-primary-900 text-white border-transparent shadow-sm',
  secondary: 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600',
  danger:    'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border-transparent shadow-sm',
  ghost:     'bg-transparent hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400 border-transparent',
  success:   'bg-green-600 hover:bg-green-700 text-white border-transparent shadow-sm',
};

const sizes = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-base px-6 py-3 gap-2.5',
};

export default function Button({
  children,
  variant    = 'primary',
  size       = 'md',
  loading    = false,
  disabled   = false,
  className  = '',
  type       = 'button',
  onClick,
  form,
  fullWidth  = false,
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      form={form}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium rounded-xl border
        transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500
        focus:ring-offset-2 dark:focus:ring-offset-slate-900
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${sizes[size]       || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
      )}
      {children}
    </button>
  );
}