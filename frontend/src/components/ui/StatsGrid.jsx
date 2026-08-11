export default function StatsGrid({ stats, cols = 4 }) {
  const colMap = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  };

  return (
    <div className={`grid ${colMap[cols] || colMap[4]} gap-4`}>
      {stats.map(({ label, value, sub, icon: Icon, color, trend }) => (
        <div key={label} className="card dark:bg-slate-800 p-5">
          <div className="flex items-center justify-between mb-3">
            {Icon && (
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
            )}
            {trend !== undefined && (
              <span className={`text-xs font-semibold ${
                trend >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </div>
          <div className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            {label}
          </div>
          {sub && (
            <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
              {sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}