export function AssignmentsManagementLoading() {
  return (
    <div className="p-6">
      <div className="space-y-4">
        {/* Header Skeleton */}
    

        {/* Filters Skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Navigation Guide Skeleton */}
        <div className="border border-dashed border-gray-300 rounded-lg p-8 bg-gray-50/50">
          <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto mb-4" />
          <div className="h-5 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-2" />
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
        </div>
      </div>
    </div>
  );
}

