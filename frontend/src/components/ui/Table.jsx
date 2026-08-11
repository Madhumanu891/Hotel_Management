import Spinner from './Spinner';

export default function Table({
  headers,
  rows,
  isLoading,
  emptyText  = 'No data found',
  emptyIcon: EmptyIcon,
  className  = '',
}) {
  return (
    <div className={`overflow-x-auto scrollbar-hide ${className}`}>
      <table className="w-full min-w-max">
        <thead>
          <tr className="text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50 dark:bg-slate-700/50">
            {headers.map(h => (
              <th
                key={typeof h === 'string' ? h : h.key}
                className="px-4 py-3 whitespace-nowrap"
              >
                {typeof h === 'string' ? h : h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
          {isLoading ? (
            <tr>
              <td colSpan={headers.length} className="py-8">
                <div className="flex justify-center">
                  <Spinner />
                </div>
              </td>
            </tr>
          ) : rows?.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="py-12 text-center">
                {EmptyIcon && (
                  <EmptyIcon className="h-8 w-8 mx-auto mb-2 text-gray-200 dark:text-slate-600" />
                )}
                <p className="text-sm text-gray-400 dark:text-slate-500">
                  {emptyText}
                </p>
              </td>
            </tr>
          ) : rows}
        </tbody>
      </table>
    </div>
  );
}