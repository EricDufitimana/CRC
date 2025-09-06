"use client";
import React from "react";
import { useExtrudingEffect, ExtrudingEffectOptions } from "@/hooks/useExtrudingEffect";

interface ExtrudingComponentProps extends ExtrudingEffectOptions {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "button" | "span" | "section" | "article" | "header" | "footer";
  onClick?: () => void;
  onHover?: () => void;
}

export const ExtrudingComponent: React.FC<ExtrudingComponentProps> = ({
  children,
  className = "",
  as: Component = "div",
  onClick,
  onHover,
  ...extrudingOptions
}) => {
  const { elementRef, playAnimation, resetAnimation } = useExtrudingEffect(extrudingOptions);

  const handleClick = () => {
    onClick?.();
    if (extrudingOptions.playOnClick) {
      resetAnimation();
      setTimeout(playAnimation, 10);
    }
  };

  const handleMouseEnter = () => {
    onHover?.();
    if (extrudingOptions.playOnHover) {
      resetAnimation();
      setTimeout(playAnimation, 10);
    }
  };

  return (
    <Component
      ref={elementRef as any}
      className={className}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      style={{
        opacity: extrudingOptions.autoPlay ? 0 : 1,
        transform: extrudingOptions.autoPlay ? `scale(${extrudingOptions.scaleFrom || 0})` : 'scale(1)',
      }}
    >
      {children}
    </Component>
  );
};
