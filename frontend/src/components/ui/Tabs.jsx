export default function Tabs({ tabs, activeKey, onChange, className = '' }) {
  return (
    <div className={`flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1 overflow-x-auto scrollbar-hide ${className}`}>
      {tabs.map(tab => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              whitespace-nowrap transition-all
              ${activeKey === tab.key
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
              }
            `}
          >
            {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                activeKey === tab.key
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-slate-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}