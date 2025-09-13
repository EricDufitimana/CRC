"use client";
import React from "react";
import { useTextAnimations, TextAnimationType } from "@/hooks/useTextAnimations";

interface AnimatedTextProps {
  children: React.ReactNode;
  animation: TextAnimationType;
  className?: string;
  as?: "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  trigger?: string;
  startTrigger?: string;
  endTrigger?: string;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  animation,
  className = "",
  as: Component = "div",
  trigger,
  startTrigger,
  endTrigger,
}) => {
  const elementRef = useTextAnimations({
    animationType: animation,
    trigger,
    startTrigger,
    endTrigger,
  });

  return (
    <Component 
      ref={elementRef as any} 
      className={`${className}`}
      style={{ 
        opacity: 0
      }}
    >
      {children}
    </Component>
  );
};
