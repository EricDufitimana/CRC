"use client";
import { useEffect, useRef } from "react";
import * as motion from "motion/react-client";

export interface ExtrudingEffectOptions {
  // Animation timing
  delay?: number;
  duration?: number;
  springBounce?: number;
  
  // Animation type
  scaleFrom?: number;
  scaleTo?: number;
  opacityFrom?: number;
  opacityTo?: number;
  
  // Spring physics
  useSpring?: boolean;
  springStiffness?: number;
  springDamping?: number;
  
  // Path animation (for SVG elements)
  animatePaths?: boolean;
  pathDuration?: number;
  pathDelay?: number;
  
  // Trigger options
  autoPlay?: boolean;
  playOnHover?: boolean;
  playOnClick?: boolean;
}

export const useExtrudingEffect = (options: ExtrudingEffectOptions = {}) => {
  const elementRef = useRef<HTMLElement>(null);
  const animationRef = useRef<any>(null);

  const {
    delay = 0,
    duration = 0.4,
    springBounce = 0.3,
    scaleFrom = 0,
    scaleTo = 1,
    opacityFrom = 0,
    opacityTo = 1,
    useSpring = true,
    springStiffness = 400,
    springDamping = 30,
    animatePaths = false,
    pathDuration = 0.4,
    pathDelay = 0.1,
    autoPlay = true,
    playOnHover = false,
    playOnClick = false,
  } = options;

  const playAnimation = () => {
    if (!elementRef.current) return;

    // Base animation properties
    const animationProps: any = {
      opacity: [opacityFrom, opacityTo],
      scale: [scaleFrom, scaleTo],
    };

    // Transition configuration
    const transitionConfig: any = {
      duration,
      delay,
      ease: useSpring ? "easeOut" : "linear",
    };

    // Add spring physics if enabled
    if (useSpring) {
      transitionConfig.scale = {
        type: "spring",
        stiffness: springStiffness,
        damping: springDamping,
        bounce: springBounce,
        delay,
      };
    }

    // Apply animation using CSS transforms directly
    const element = elementRef.current;
    element.style.transform = `scale(${scaleFrom})`;
    element.style.opacity = `${opacityFrom}`;
    
    // Use setTimeout to create the animation effect
    setTimeout(() => {
      element.style.transition = useSpring 
        ? `all ${duration}s cubic-bezier(0.68, -0.55, 0.265, 1.55)` 
        : `all ${duration}s ease-out`;
      element.style.transform = `scale(${scaleTo})`;
      element.style.opacity = `${opacityTo}`;
    }, delay * 1000);

    // Animate SVG paths if enabled
    if (animatePaths && elementRef.current) {
      const paths = elementRef.current.querySelectorAll('path');
      paths.forEach((path, index) => {
        const pathElement = path as SVGPathElement;
        const totalLength = pathElement.getTotalLength();
        pathElement.style.strokeDasharray = `${totalLength}`;
        pathElement.style.strokeDashoffset = `${totalLength}`;
        
        setTimeout(() => {
          pathElement.style.transition = `stroke-dashoffset ${pathDuration}s ease-out`;
          pathElement.style.strokeDashoffset = '0';
        }, (delay + pathDelay + (index * 0.1)) * 1000);
      });
    }
  };

  const resetAnimation = () => {
    if (!elementRef.current) return;
    
    // Reset to initial state
    const element = elementRef.current;
    element.style.transition = 'none';
    element.style.transform = `scale(${scaleFrom})`;
    element.style.opacity = `${opacityFrom}`;

    // Reset SVG paths
    if (animatePaths && elementRef.current) {
      const paths = elementRef.current.querySelectorAll('path');
      paths.forEach((path) => {
        const pathElement = path as SVGPathElement;
        const totalLength = pathElement.getTotalLength();
        pathElement.style.transition = 'none';
        pathElement.style.strokeDasharray = `${totalLength}`;
        pathElement.style.strokeDashoffset = `${totalLength}`;
      });
    }
  };

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;

    // Set initial state
    resetAnimation();

    // Auto play animation
    if (autoPlay) {
      const timer = setTimeout(playAnimation, 50); // Small delay to ensure element is ready
      return () => clearTimeout(timer);
    }

    // Event listeners for hover/click triggers
    const handleMouseEnter = () => {
      if (playOnHover) {
        resetAnimation();
        setTimeout(playAnimation, 10);
      }
    };

    const handleClick = () => {
      if (playOnClick) {
        resetAnimation();
        setTimeout(playAnimation, 10);
      }
    };

    if (playOnHover) {
      element.addEventListener('mouseenter', handleMouseEnter);
    }

    if (playOnClick) {
      element.addEventListener('click', handleClick);
    }

    return () => {
      if (playOnHover) {
        element.removeEventListener('mouseenter', handleMouseEnter);
      }
      if (playOnClick) {
        element.removeEventListener('click', handleClick);
      }
      if (animationRef.current) {
        animationRef.current.stop?.();
      }
    };
  }, [autoPlay, playOnHover, playOnClick]);

  return {
    elementRef,
    playAnimation,
    resetAnimation,
  };
};
