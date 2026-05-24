export default function ResponsiveTable({ headers, rows, emptyIcon: Icon, emptyText }) {
  if (rows.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        {Icon && <Icon className="h-8 w-8 mx-auto mb-2 opacity-40" />}
        <p className="text-sm">{emptyText || 'No data found'}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <table className="w-full min-w-max">
        <thead>
          <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
            {headers.map(h => (
              <th key={h} className="px-4 sm:px-6 py-3 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows}
        </tbody>
      </table>
    </div>
  );
}