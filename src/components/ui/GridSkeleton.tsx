import React from "react";
import CardSkeleton from "./CardSkeleton";

interface GridSkeletonProps {
  count?: number;
  columns?: number;
  cardProps?: React.ComponentProps<typeof CardSkeleton>;
  className?: string;
}

const GridSkeleton: React.FC<GridSkeletonProps> = ({
  count = 6,
  columns = 3,
  cardProps = {},
  className = "",
}) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
  };

  return (
    <div className={`grid gap-6 ${gridCols[columns as keyof typeof gridCols] || gridCols[3]} ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} {...cardProps} />
      ))}
    </div>
  );
};

export default GridSkeleton;

