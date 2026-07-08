export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="h-10 bg-primary-200 rounded w-64 mb-4 animate-pulse" />
          <div className="h-5 bg-primary-200 rounded w-96 animate-pulse" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md border border-primary-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-primary-200 rounded w-28 animate-pulse" />
                <div className="w-12 h-12 bg-primary-200 rounded-full animate-pulse" />
              </div>
              <div className="h-10 bg-primary-200 rounded w-24 mb-2 animate-pulse" />
              <div className="h-4 bg-primary-200 rounded w-36 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md border border-primary-100 p-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-primary-200 rounded-lg animate-pulse" />
                <div className="flex-1">
                  <div className="h-5 bg-primary-200 rounded w-32 mb-2 animate-pulse" />
                  <div className="h-4 bg-primary-200 rounded w-24 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg shadow-md border border-primary-100 overflow-hidden">
          <div className="p-6 border-b border-primary-100">
            <div className="h-6 bg-primary-200 rounded w-48 animate-pulse" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-primary-50">
                <tr>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <th key={i} className="px-6 py-3">
                      <div className="h-4 bg-primary-200 rounded w-20 animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5].map((j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-primary-200 rounded w-24 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
