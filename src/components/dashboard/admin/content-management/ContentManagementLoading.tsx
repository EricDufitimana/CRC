export function ContentManagementLoading() {
  return (
    <div className="p-8">
      <div className="space-y-8">
        <div>
          <div className="h-10 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-1 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="col-span-4">
            <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

