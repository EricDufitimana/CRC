export function StudentManagementLoading() {
  return (
    <div className="p-6">
      <div className="space-y-4">
        {/* Header Skeleton */}
        <div>
          <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
          <div className="h-3 w-80 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Search Bar and Filters Skeleton */}
        <div className="flex flex-col gap-2 mb-4">
          {/* Search Bar Skeleton */}
          <div className="flex gap-2 items-center">
            <div className="flex-1 h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          
          {/* Filters Row Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="border border-gray-300/80 rounded-lg bg-white/80 backdrop-blur-sm dark:border-gray-600/80 dark:bg-gray-800/80">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-2">
                <div className="grid grid-cols-6 gap-3">
                  <div className="h-3.5 w-3.5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="flex items-center gap-1.5">
                    <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    <div className="h-3.5 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3.5 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="flex gap-1.5">
                    <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between px-3 py-2 bg-white/80 border border-gray-300/80 rounded-lg dark:bg-gray-800/80 dark:border-gray-600/80">
          <div className="flex items-center gap-3">
            <div className="h-7 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
            <div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

