import React from "react";

interface ContentSkeletonProps {
  lines?: number;
  className?: string;
}

const ContentSkeleton: React.FC<ContentSkeletonProps> = ({ 
  lines = 3, 
  className = "" 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${
            index === lines - 1 ? "w-3/4" : "w-full"
          }`}
        />
      ))}
    </div>
  );
};

export default ContentSkeleton;

