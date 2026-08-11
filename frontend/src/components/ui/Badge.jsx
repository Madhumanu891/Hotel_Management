const variants = {
  success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800',
  warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  error:   'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800',
  info:    'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  purple:  'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  gray:    'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-600',
  primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-primary-200 dark:border-primary-800',
};

export default function Badge({
  children,
  variant   = 'gray',
  dot       = false,
  className = '',
}) {
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full
      text-xs font-semibold border
      ${variants[variant] || variants.gray}
      ${className}
    `}>
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}