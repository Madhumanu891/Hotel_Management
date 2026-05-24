export const SkeletonLine = ({ width = 'full', height = 4 }) => (
  <div className={`h-${height} w-${width} bg-gray-200 rounded animate-pulse`} />
);

export const SkeletonCard = () => (
  <div className="card overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="flex gap-2">
        {[1,2,3].map(i => <div key={i} className="h-4 w-4 bg-gray-200 rounded" />)}
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-7 bg-gray-200 rounded w-24" />
        <div className="h-8 bg-gray-200 rounded w-20" />
      </div>
    </div>
  </div>
);

export const SkeletonRow = ({ cols = 4 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
      </td>
    ))}
  </tr>
);

export const SkeletonStats = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {[1,2,3,4].map(i => (
      <div key={i} className="card p-6 animate-pulse space-y-3">
        <div className="h-10 w-10 bg-gray-200 rounded-xl" />
        <div className="h-7 bg-gray-200 rounded w-16" />
        <div className="h-4 bg-gray-200 rounded w-24" />
      </div>
    ))}
  </div>
);