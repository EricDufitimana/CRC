"use client";
import React, { useEffect, useRef, useState } from "react";

interface OptimizedSlideUpProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  fadeIn?: boolean;
  distance?: number;
}

export const OptimizedSlideUp: React.FC<OptimizedSlideUpProps> = ({
  children,
  className = "",
  delay = 0,
  direction = 'up',
  fadeIn = true,
  distance = 50,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasAnimated) return;

    // Use Intersection Observer to match Framer Motion's behavior
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setTimeout(() => {
              setIsVisible(true);
              setHasAnimated(true);
            }, delay * 1000); // Convert to milliseconds like Framer Motion
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "-100px 0px", // Match Framer Motion's margin setting
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [delay, hasAnimated]);

  const getInitialTransform = () => {
    let x = 0;
    let y = 0;

    if (direction === 'left') x = -distance;
    else if (direction === 'right') x = distance;
    else if (direction === 'up') y = distance;
    else if (direction === 'down') y = -distance;

    return { x, y };
  };

  const { x: initialX, y: initialY } = getInitialTransform();

  const getTransformStyle = () => {
    if (!isVisible) {
      return {
        opacity: fadeIn ? 0 : 1,
        transform: `translate3d(${initialX}px, ${initialY}px, 0)`,
        transition: 'none'
      };
    }

    return {
      opacity: 1,
      transform: 'translate3d(0, 0, 0)',
      // Match Framer Motion's easeOut timing exactly
      transition: 'opacity 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      willChange: 'transform, opacity'
    };
  };

  return (
    <div
      ref={elementRef}
      className={className}
      style={getTransformStyle()}
    >
      {children}
    </div>
  );
};
