import React from "react";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`}
      {...props}
    />
  );
}

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
        <Skeleton
          key={index}
          className={index === lines - 1 ? "w-3/4 h-4" : "w-full h-4"}
        />
      ))}
    </div>
  );
};

export default ContentSkeleton;
