"use client";
import { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin once
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type TextAnimationType = 
  | "words-slide-up"
  | "words-rotate-in" 
  | "words-slide-from-right"
  | "letters-slide-up"
  | "letters-slide-down"
  | "letters-fade-in"
  | "letters-fade-in-random"
  | "scrub-each-word";

interface UseTextAnimationsOptions {
  animationType: TextAnimationType;
  trigger?: string;
  startTrigger?: string;
  endTrigger?: string;
}

// Animation configurations - moved outside component to avoid recreation
const ANIMATIONS = {
  "words-slide-up": {
    selector: ".word",
    from: { opacity: 0, yPercent: 100 },
    duration: 0.5,
    ease: "back.out(2)",
    stagger: 0.1
  },
  "words-rotate-in": {
    selector: ".word",
    set: { transformPerspective: 1000 },
    from: { rotationX: -90 },
    duration: 0.6,
    ease: "power2.out",
    stagger: 0.6
  },
  "words-slide-from-right": {
    selector: ".word",
    from: { opacity: 0, x: "1em" },
    duration: 0.4,
    ease: "power2.out",
    stagger: 0.08
  },
  "letters-slide-up": {
    selector: ".char",
    from: { yPercent: 100 },
    duration: 0.2,
    ease: "power1.out",
    stagger: 0.6
  },
  "letters-slide-down": {
    selector: ".char",
    from: { yPercent: -120 },
    duration: 0.3,
    ease: "power1.out",
    stagger: 0.7
  },
  "letters-fade-in": {
    selector: ".char",
    from: { opacity: 0 },
    duration: 0.2,
    ease: "power1.out",
    stagger: 0.8
  },
  "letters-fade-in-random": {
    selector: ".char",
    from: { opacity: 0 },
    duration: 0.05,
    ease: "power1.out",
    stagger: { amount: 0.4, from: "random" }
  }
} as const;

export const useTextAnimations = (options: UseTextAnimationsOptions) => {
  const elementRef = useRef<HTMLElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Memoized cleanup function
  const cleanup = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
  }, []);

  // Memoized animation creation
  const createAnimation = useCallback(async (element: HTMLElement) => {
    // Dynamic import with error handling
    let SplitType;
    try {
      SplitType = (await import("split-type")).default;
    } catch (error) {
      console.error("Failed to load SplitType:", error);
      return;
    }

    // Set initial opacity
    gsap.set(element, { opacity: 1 });

    // Split text
    const splitText = new SplitType(element, {
      types: "words,chars",
      tagName: "span"
    });

    let tl: gsap.core.Timeline;

    // Handle scrub animation separately (different pattern)
    if (options.animationType === "scrub-each-word") {
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: options.startTrigger || "top center",
          end: options.endTrigger || "center top",
          scrub: true
        }
      });
      tl.from(element.querySelectorAll(".word"), {
        opacity: 0.2,
        duration: 0.2,
        ease: "power1.out",
        stagger: { each: 0.4 }
      });
    } else {
      // Handle regular animations
      const config = ANIMATIONS[options.animationType];
      if (!config) return;

      tl = gsap.timeline({ paused: true });
      const targets = element.querySelectorAll(config.selector);

      // Apply set properties if they exist
      if ('set' in config && config.set) {
        tl.set(targets, config.set);
      }

      // Create animation
      const animProps: any = { ...config.from };
      animProps.duration = config.duration;
      animProps.ease = config.ease;
      
      if (typeof config.stagger === "number") {
        animProps.stagger = { amount: config.stagger };
      } else {
        animProps.stagger = config.stagger;
      }

      tl.from(targets, animProps);

      // Create scroll triggers more efficiently
      const triggers = [
        ScrollTrigger.create({
          trigger: element,
          start: "top bottom",
          onLeaveBack: () => tl.progress(0).pause()
        }),
        ScrollTrigger.create({
          trigger: element,
          start: options.startTrigger || "top center",
          onEnter: () => tl.play()
        })
      ];

      // Store additional triggers for cleanup
      cleanupRef.current = () => {
        splitText.revert();
        triggers.forEach(trigger => trigger.kill());
        tl.kill();
      };
    }

    // For scrub animations, cleanup is handled by ScrollTrigger automatically
    if (options.animationType === "scrub-each-word") {
      cleanupRef.current = () => {
        splitText.revert();
        tl.kill();
      };
    }
  }, [options.animationType, options.startTrigger, options.endTrigger]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof window === "undefined") return;

    // Cleanup previous animation
    cleanup();
    
    // Create new animation
    createAnimation(element);

    // Return cleanup function
    return cleanup;
  }, [createAnimation, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return elementRef;
};