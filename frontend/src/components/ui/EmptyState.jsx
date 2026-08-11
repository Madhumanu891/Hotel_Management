import Button from './Button';

export default function EmptyState({
  icon:  Icon,
  title,
  description,
  action,
  compact = false,
}) {
  return (
    <div className={`text-center ${compact ? 'py-8' : 'py-16'}`}>
      {Icon && (
        <div className={`mx-auto rounded-2xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center mb-4 ${compact ? 'h-12 w-12' : 'h-16 w-16'}`}>
          <Icon className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} text-gray-400 dark:text-slate-500`} />
        </div>
      )}
      <h3 className={`font-semibold text-gray-900 dark:text-white mb-1 ${compact ? 'text-sm' : 'text-base'}`}>
        {title}
      </h3>
      {description && (
        <p className={`text-gray-500 dark:text-slate-400 mb-5 ${compact ? 'text-xs' : 'text-sm'}`}>
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} size={compact ? 'sm' : 'md'}>
          {action.label}
        </Button>
      )}
    </div>
  );
}