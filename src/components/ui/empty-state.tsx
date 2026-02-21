"use client";

import Image from "next/image";

interface EmptyStateProps {
  image: string;
  headerText: string;
  subtext: string;
  className?: string;
  imageClassName?: string;
  imageSize?: "default" | "custom";
  showDashedBorder?: boolean;
}

export function EmptyState({ 
  image, 
  headerText, 
  subtext, 
  className = "", 
  imageClassName = "",
  imageSize = "default",
  showDashedBorder = true

}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-24 bg-white rounded-2xl ${
      showDashedBorder ? " border border-dashed border-gray-200" : ""
    } ${className}`}>
      <div className={`relative ml-8 opacity-50 grayscale ${
        imageSize === "default" ? "w-40 h-40" : ""
      } ${imageClassName}`}>
        <Image
          src={image}
          alt={headerText}
          fill
          className=" object-contain "
        />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{headerText}</h3>
      <p className="text-gray-500 text-sm text-center max-w-xs">
        {subtext}
      </p>
    </div>
  );
}
