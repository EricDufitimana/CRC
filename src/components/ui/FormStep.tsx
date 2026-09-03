"use client";

import React from "react";

interface FormStepProps {
  step: number;
  currentStep: number;
  isTransitioning: boolean;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function FormStep({ 
  step, 
  currentStep, 
  isTransitioning, 
  title, 
  description, 
  children 
}: FormStepProps) {
  if (currentStep !== step) return null;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Step heading block */}
      <div className={`mb-7 transition-all duration-300 ${
        isTransitioning ? 'opacity-0 transform -translate-x-2' : 'opacity-100 transform translate-x-0'
      }`}>
        <h2 className="text-[17px] font-bold text-[rgb(34,34,34)] leading-snug mb-2">
          {title}
        </h2>
        <p className="text-[13px] font-light text-[rgba(96,115,142,0.88)] leading-relaxed">
          {description}
        </p>
      </div>

      {/* Fields */}
      <div className={`flex-1 flex flex-col gap-5 transition-all duration-300 ${
        isTransitioning ? 'opacity-0 transform -translate-x-2' : 'opacity-100 transform translate-x-0'
      }`}>
        {children}
      </div>
    </div>
  );
}
