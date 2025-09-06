"use client";
import React, { useEffect, useRef, useState } from "react";

interface OptimizedAnimatedTextProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  animation?: "fade-up" | "slide-up" | "slide-up-smooth" | "slide-up-hero" | "slide-right" | "slide-down" | "none";
  delay?: number;
}

export const OptimizedAnimatedText: React.FC<OptimizedAnimatedTextProps> = ({
  children,
  className = "",
  as: Component = "div",
  animation = "fade-up",
  delay = 0,
}) => {
  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasAnimated) return;

    // Use Intersection Observer to match Framer Motion's useInView behavior
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
        threshold: 0.1,
        rootMargin: "-100px 0px", // Match Framer Motion's margin setting exactly
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [delay, hasAnimated]);

  const getAnimationClasses = () => {
    if (animation === "none") return "";
    
    // Special handling for hero slide-up animation
    if (animation === "slide-up-hero") {
      if (!isVisible) {
        return "opacity-0 transform translate-y-10";
      }
      return "hero-slide-up";
    }
    
    // Smooth slide-up that matches Framer Motion's easeOut
    if (animation === "slide-up-smooth") {
      const smoothClasses = "transition-all duration-500 will-change-transform";
      const smoothEasing = "cubic-bezier(0.25, 0.46, 0.45, 0.94)"; // Framer Motion's easeOut
      
      if (!isVisible) {
        return `${smoothClasses} opacity-0 translate-y-12 transform`;
      }
      return `${smoothClasses} opacity-100 translate-y-0 transform`;
    }
    
    const baseClasses = "transition-all duration-800 ease-out transform";
    
    if (!isVisible) {
      switch (animation) {
        case "fade-up":
          return `${baseClasses} opacity-0 translate-y-8`;
        case "slide-up":
          return `${baseClasses} opacity-0 translate-y-24`;
        case "slide-down":
          return `${baseClasses} opacity-0 -translate-y-16`;
        case "slide-right":
          return `${baseClasses} opacity-0 -translate-x-8`;
        default:
          return `${baseClasses} opacity-0`;
      }
    }
    
    return `${baseClasses} opacity-100 translate-y-0 translate-x-0`;
  };

  return (
    <Component 
      ref={elementRef as any} 
      className={`${getAnimationClasses()} ${className}`}
    >
      {children}
    </Component>
  );
};
