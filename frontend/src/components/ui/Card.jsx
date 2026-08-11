export default function Card({
  children,
  className  = '',
  padding    = true,
  hoverable  = false,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-slate-800
        border border-gray-200 dark:border-slate-700
        rounded-xl shadow-sm
        ${padding    ? 'p-6'                           : ''}
        ${hoverable  ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}
        ${onClick    ? 'cursor-pointer'                : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-5 ${className}`}>
      <div>
        <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}