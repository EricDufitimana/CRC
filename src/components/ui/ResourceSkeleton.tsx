import React from "react";

interface ResourceSkeletonProps {
  count?: number;
}

const ResourceSkeleton: React.FC<ResourceSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-center pb-12">
        <div className="content border border-gray-700 rounded-md p-8 w-[1100px]">
          {Array.from({ length: count }).map((_, index) => (
            <div key={index}>
              <div className="p-8 flex justify-between">
                {/* Image skeleton */}
                <div className="relative w-[350px] h-[350px]">
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
                </div>
                
                {/* Content skeleton */}
                <div className="w-[50%] flex flex-col justify-between h-[350px]">
                  <div className="">
                    {/* Title skeleton */}
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
                    {/* Description skeleton - multiple lines */}
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Buttons skeleton */}
                  <div className="flex justify-between mt-auto">
                    <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
                    <div className="h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
                  </div>
                </div>
              </div>
              
              {/* Divider skeleton */}
              {index < count - 1 && (
                <hr className="w-full my-8 border-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourceSkeleton;
