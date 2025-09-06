"use client";
import React, { useEffect, useRef, useState } from "react";

interface OptimizedScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  disabled?: boolean;
}

export const OptimizedScrollAnimation: React.FC<OptimizedScrollAnimationProps> = ({
  children,
  className = "",
  direction = 'up',
  delay = 0,
  disabled = false,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (disabled || hasAnimated) return;
    
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setTimeout(() => {
              setIsVisible(true);
              setHasAnimated(true);
            }, delay);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "30px 0px -30px 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [delay, disabled, hasAnimated]);

  const getTransform = () => {
    if (disabled) return "";
    
    if (!isVisible) {
      switch (direction) {
        case 'left': return '-translate-x-12 opacity-0';
        case 'right': return 'translate-x-12 opacity-0';
        case 'up': return 'translate-y-12 opacity-0';
        case 'down': return '-translate-y-12 opacity-0';
        default: return 'opacity-0';
      }
    }
    
    return 'translate-x-0 translate-y-0 opacity-100';
  };

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-700 ease-out ${getTransform()} ${className}`}
    >
      {children}
    </div>
  );
};
