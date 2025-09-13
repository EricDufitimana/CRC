import React from "react";

interface CardSkeletonProps {
  imageHeight?: string;
  imageWidth?: string;
  titleHeight?: string;
  descriptionLines?: number;
  showButtons?: boolean;
  buttonCount?: number;
  className?: string;
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({
  imageHeight = "h-48",
  imageWidth = "w-full",
  titleHeight = "h-6",
  descriptionLines = 3,
  showButtons = true,
  buttonCount = 2,
  className = "",
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Image skeleton */}
      <div className={`${imageWidth} ${imageHeight} bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-4`} />
      
      {/* Title skeleton */}
      <div className={`${titleHeight} bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3`} />
      
      {/* Description skeleton */}
      <div className="space-y-2 mb-4">
        {Array.from({ length: descriptionLines }).map((_, index) => (
          <div
            key={index}
            className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${
              index === descriptionLines - 1 ? "w-3/4" : "w-full"
            }`}
          />
        ))}
      </div>
      
      {/* Buttons skeleton */}
      {showButtons && (
        <div className="flex gap-3">
          {Array.from({ length: buttonCount }).map((_, index) => (
            <div
              key={index}
              className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CardSkeleton;

