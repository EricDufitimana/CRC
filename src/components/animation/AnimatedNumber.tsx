"use client";
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface AnimatedNumberProps {
  /** The target number to animate to */
  value: number;
  /** Duration of the animation in seconds (default: 2) */
  duration?: number;
  /** Delay before animation starts in seconds (default: 0) */
  delay?: number;
  /** Number of decimal places to show (default: 0) */
  decimals?: number;
  /** Custom formatting function for the number */
  formatter?: (value: number) => string;
  /** Additional CSS classes */
  className?: string;
  /** Easing function (default: "power2.out") */
  ease?: string;
  /** Custom scroll trigger start position (default: "top 80%") */
  triggerStart?: string;
  /** Whether to use scroll trigger (default: true) */
  useScrollTrigger?: boolean;
  /** Prefix to add before the number (e.g., "$", "+") */
  prefix?: string;
  /** Suffix to add after the number (e.g., "%", "+", "k") */
  suffix?: string;
  /** Start value for the animation (default: 0) */
  startValue?: number;
  /** Whether to restart animation when scrolling back (default: true) */
  restartOnScroll?: boolean;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 2,
  delay = 0,
  decimals = 0,
  formatter,
  className = "",
  ease = "power2.out",
  triggerStart = "top 80%",
  useScrollTrigger = true,
  prefix = "",
  suffix = "",
  startValue = 0,
  restartOnScroll = true,
}) => {
  const numberRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef(startValue);

  useEffect(() => {
    if (!numberRef.current) return;

    const element = numberRef.current;
    
    // Set initial value
    const formatValue = (val: number) => {
      if (formatter) {
        return formatter(val);
      }
      return val.toFixed(decimals);
    };

    const updateNumber = () => {
      if (element) {
        element.textContent = `${prefix}${formatValue(valueRef.current)}${suffix}`;
      }
    };

    // Set initial display
    updateNumber();

    let animationTween: gsap.core.Tween | null = null;

    const animateToTarget = () => {
      // Kill any existing animation
      if (animationTween) {
        animationTween.kill();
      }
      
      // Create a simple object for GSAP to animate
      const animObj = { val: valueRef.current };
      
      console.log('Starting animation from', valueRef.current, 'to', value);
      
      animationTween = gsap.to(animObj, {
        val: value,
        duration,
        delay,
        ease,
        onUpdate: () => {
          valueRef.current = animObj.val;
          updateNumber();
        },
        onComplete: () => {
          // Ensure we show the exact final value
          valueRef.current = value;
          updateNumber();
          console.log('Animation completed');
        }
      });
    };

    const resetToStart = () => {
      // Kill any existing animation
      if (animationTween) {
        animationTween.kill();
      }
      
      // Reset to start value
      valueRef.current = startValue;
      updateNumber();
    };

    if (useScrollTrigger) {
      if (restartOnScroll) {
        // Create scroll trigger with restart functionality
        ScrollTrigger.create({
          trigger: element,
          start: triggerStart,
          end: "bottom top", // When element goes completely out of view at top
          onEnter: () => {
            console.log('Scroll trigger onEnter fired');
            animateToTarget();
          },
          onLeave: resetToStart, // Reset when scrolling down past element
          onEnterBack: () => {
            console.log('Scroll trigger onEnterBack fired');
            animateToTarget();
          }, // Restart when scrolling back up
          onLeaveBack: resetToStart, // Reset when scrolling up past element
        });
      } else {
        // Create scroll trigger that only runs once
        ScrollTrigger.create({
          trigger: element,
          start: triggerStart,
          once: true,
          onEnter: () => {
            console.log('Scroll trigger onEnter (once) fired');
            animateToTarget();
          }
        });
      }
    } else {
      // Animate immediately
      setTimeout(animateToTarget, delay * 1000);
    }

    // Cleanup
    return () => {
      // Kill animation tween
      if (animationTween) {
        animationTween.kill();
      }
      
      // Kill scroll triggers
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [value, duration, delay, decimals, formatter, ease, triggerStart, useScrollTrigger, prefix, suffix, startValue, restartOnScroll]);

  return (
    <span
      ref={numberRef}
      className={`inline-block ${className}`}
    >
      {prefix}{startValue.toFixed(decimals)}{suffix}
    </span>
  );
};

// Preset components for common use cases
export const AnimatedCounter: React.FC<Omit<AnimatedNumberProps, 'formatter'>> = (props) => (
  <AnimatedNumber {...props} />
);

export const AnimatedPercentage: React.FC<Omit<AnimatedNumberProps, 'suffix' | 'formatter'>> = (props) => (
  <AnimatedNumber {...props} suffix="%" />
);

export const AnimatedCurrency: React.FC<Omit<AnimatedNumberProps, 'prefix' | 'formatter'> & { currency?: string }> = ({ 
  currency = "$", 
  ...props 
}) => (
  <AnimatedNumber {...props} prefix={currency} decimals={2} />
);

export const AnimatedPlusNumber: React.FC<Omit<AnimatedNumberProps, 'suffix'>> = (props) => (
  <AnimatedNumber {...props} suffix="+" />
);

// Advanced formatter examples
export const formatters = {
  // Format large numbers with K, M, B
  largeNumber: (value: number): string => {
    if (value >= 1000000000) {
      return (value / 1000000000).toFixed(1) + 'B';
    }
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  },
  
  // Format with commas
  withCommas: (value: number): string => {
    return Math.floor(value).toLocaleString();
  },
  
  // Format time (assuming seconds)
  timeFormat: (value: number): string => {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = Math.floor(value % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
};

export default AnimatedNumber;
