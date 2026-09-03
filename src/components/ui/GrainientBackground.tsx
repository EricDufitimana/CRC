"use client";

import React from "react";
import Grainient from "@/components/setup/Grainient";

interface GrainientBackgroundProps {
  colors: {
    color1: string;
    color2: string;
    color3: string;
  };
  config?: {
    timeSpeed?: number;
    warpStrength?: number;
    grainAmount?: number;
    zoom?: number;
    blendAngle?: number;
  };
  className?: string;
}

export function GrainientBackground({
  colors,
  config = {
    timeSpeed: 0.3,
    warpStrength: 0.8,
    grainAmount: 0.05,
    zoom: 1.2,
    blendAngle: 45
  },
  className = "w-2/5 rounded-[20px] overflow-hidden relative border border-slate-300 self-stretch min-h-[300px]"
}: GrainientBackgroundProps) {
  return (
    <div className={className}>
      <Grainient
        color1={colors.color1}
        color2={colors.color2}
        color3={colors.color3}
        timeSpeed={config.timeSpeed}
        warpStrength={config.warpStrength}
        grainAmount={config.grainAmount}
        zoom={config.zoom}
        blendAngle={config.blendAngle}
        className="w-full h-full opacity-100"
      />
    </div>
  );
}
