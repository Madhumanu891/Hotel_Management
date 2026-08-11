import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  hint,
  icon:  Icon,
  iconRight: IconRight,
  className = '',
  type      = 'text',
  ...props
}, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="h-4 w-4 text-gray-400 dark:text-slate-500" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            w-full px-3 py-2.5 border rounded-xl bg-white dark:bg-slate-800
            text-gray-900 dark:text-slate-100
            placeholder-gray-400 dark:placeholder-slate-500
            border-gray-300 dark:border-slate-600
            focus:outline-none focus:ring-2 focus:ring-primary-500
            focus:border-transparent transition-colors text-sm
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-slate-900
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${Icon      ? 'pl-9'  : ''}
            ${IconRight ? 'pr-9'  : ''}
            ${className}
          `}
          {...props}
        />
        {IconRight && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <IconRight className="h-4 w-4 text-gray-400 dark:text-slate-500" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-gray-400 dark:text-slate-500">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;