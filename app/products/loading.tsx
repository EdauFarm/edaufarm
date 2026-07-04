export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-4" />
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
        </div>

        {/* Filters Skeleton */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-lg w-24 flex-shrink-0 animate-pulse" />
          ))}
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Image skeleton */}
              <div className="aspect-square bg-gray-200 animate-pulse" />
              
              {/* Content skeleton */}
              <div className="p-3 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
