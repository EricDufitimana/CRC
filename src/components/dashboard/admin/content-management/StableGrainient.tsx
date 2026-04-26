"use client";

import { memo } from "react";
import Grainient from "@/components/setup/Grainient";

interface StableGrainientProps {
  color1?: string;
  color2?: string;
  color3?: string;
}

// memo + stable props = Grainient never re-renders due to parent state changes
export const StableGrainient = memo(function StableGrainient({ 
  color1 = "#F0B07A", 
  color2 = "#F87171", 
  color3 = "#FEF3C7" 
}: StableGrainientProps) {
  return (
    <Grainient
      color1={color1}
      color2={color2}
      color3={color3}
      timeSpeed={0.3}
      warpStrength={0.8}
      grainAmount={0.05}
      zoom={1.2}
      blendAngle={45}
      className="w-full h-full opacity-100"
    />
  );
});
