"use client";
import * as motion from "motion/react-client";
import React from "react";

export type ExtrudingIconType = "checkmark" | "x" | "plus" | "minus" | "arrow-right" | "arrow-left" | "custom";

interface ExtrudingButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  iconType?: ExtrudingIconType;
  customIcon?: React.ReactNode;
  variant?: "success" | "error" | "primary" | "secondary" | "custom";
  size?: "sm" | "md" | "lg";
  delay?: number;
  springBounce?: number;
  pathDuration?: number;
  customColors?: {
    bg: string;
    hover: string;
    icon: string;
  };
}

export const ExtrudingButton: React.FC<ExtrudingButtonProps> = ({
  children,
  onClick,
  className = "",
  iconType = "checkmark",
  customIcon,
  variant = "primary",
  size = "md",
  delay = 0.05,
  springBounce = 0.3,
  pathDuration = 0.4,
  customColors,
}) => {
  // Size configurations
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-8 h-8"
  };

  // Variant configurations
  const variantClasses = {
    success: "bg-green-100 hover:bg-green-200 text-green-600",
    error: "bg-red-100 hover:bg-red-200 text-red-600",
    primary: "bg-blue-100 hover:bg-blue-200 text-blue-600",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-600",
    custom: customColors ? `${customColors.bg} ${customColors.hover} ${customColors.icon}` : "bg-gray-100 hover:bg-gray-200 text-gray-600"
  };

  // Icon path configurations
  const iconPaths = {
    checkmark: {
      viewBox: "0 0 24 24",
      paths: [
        { d: "M5 13l4 4L19 7", delay: 0.1 }
      ]
    },
    x: {
      viewBox: "0 0 24 24", 
      paths: [
        { d: "M6 18L18 6", delay: 0.1 },
        { d: "M6 6L18 18", delay: 0.3 }
      ]
    },
    plus: {
      viewBox: "0 0 24 24",
      paths: [
        { d: "M12 5v14", delay: 0.1 },
        { d: "M5 12h14", delay: 0.25 }
      ]
    },
    minus: {
      viewBox: "0 0 24 24",
      paths: [
        { d: "M5 12h14", delay: 0.1 }
      ]
    },
    "arrow-right": {
      viewBox: "0 0 24 24",
      paths: [
        { d: "M5 12h14", delay: 0.1 },
        { d: "M12 5l7 7-7 7", delay: 0.25 }
      ]
    },
    "arrow-left": {
      viewBox: "0 0 24 24", 
      paths: [
        { d: "M19 12H5", delay: 0.1 },
        { d: "M12 19l-7-7 7-7", delay: 0.25 }
      ]
    }
  };

  const renderIcon = () => {
    if (customIcon) {
      return customIcon;
    }

    if (iconType === "custom") {
      return children;
    }

    const iconConfig = iconPaths[iconType as keyof typeof iconPaths];
    
    return (
      <motion.svg 
        className={`${iconSizes[size]} absolute`}
        fill="none" 
        stroke="currentColor" 
        viewBox={iconConfig.viewBox}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ 
          duration: pathDuration, 
          delay: delay + 0.05,
          ease: "easeOut"
        }}
      >
        {iconConfig.paths.map((pathData, index) => (
          <motion.path 
            key={index}
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2.5} 
            d={pathData.d}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ 
              duration: pathDuration, 
              delay: delay + pathData.delay,
              ease: "easeOut"
            }}
          />
        ))}
      </motion.svg>
    );
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: delay,
        scale: { 
          type: "spring", 
          visualDuration: 0.4, 
          bounce: springBounce, 
          delay: delay 
        },
      }}
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-full ${variantClasses[variant]} flex items-center justify-center transition-colors duration-200 relative flex-shrink-0 ${className}`}
    >
      {renderIcon()}
    </motion.button>
  );
};
