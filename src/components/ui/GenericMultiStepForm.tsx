"use client";

import React, { useState } from "react";
import { MultiStepDialog } from "./MultiStepDialog";
import { FormStep } from "./FormStep";
import { FormField, CheckboxField, NavigationButtons } from "./FormFields";
import { GrainientBackground } from "./GrainientBackground";

interface StepConfig {
  title: string;
  description: string;
  fields: FieldConfig[];
}

interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "url" | "textarea" | "date" | "checkbox";
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  options?: string[]; // for select fields if needed later
}

interface GenericMultiStepFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => void;
  steps: StepConfig[];
  grainientColors?: {
    color1: string;
    color2: string;
    color3: string;
  };
  initialData?: Record<string, any>;
}

export function GenericMultiStepForm({
  isOpen,
  onClose,
  onSubmit,
  steps,
  grainientColors = {
    color1: "#F0B07A",
    color2: "#F87171", 
    color3: "#FEF3C7"
  },
  initialData = {}
}: GenericMultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors for this field when user starts typing
    if (typeof value === 'string') {
      setFieldErrors(prev => ({ ...prev, [field]: [] }));
    }
  };

  const validateCurrentStep = (): boolean => {
    const currentStepConfig = steps[currentStep - 1];
    const errors: Record<string, string[]> = {};

    currentStepConfig.fields.forEach(field => {
      if (field.required && !formData[field.name]?.toString().trim()) {
        errors[field.name] = [`${field.label} is required`];
      }
      
      // URL validation
      if (field.type === "url" && formData[field.name]?.trim()) {
        try {
          new URL(formData[field.name]);
        } catch {
          errors[field.name] = ["Must be a valid URL"];
        }
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    setIsTransitioning(true);
    setTimeout(() => {
      if (currentStep < steps.length) {
        setCurrentStep(prev => prev + 1);
      }
      setIsTransitioning(false);
    }, 300);
  };

  const handlePrevious = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setIsTransitioning(false);
    }, 300);
  };

  const handleSubmit = () => {
    if (!validateCurrentStep()) return;
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData(initialData);
    setFieldErrors({});
    setCurrentStep(1);
    onClose();
  };

  return (
    <MultiStepDialog
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title="Multi-Step Form"
      maxSteps={steps.length}
      currentStep={currentStep}
      isTransitioning={isTransitioning}
      grainientColors={grainientColors}
    >
      {/* Left Column - Form Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {steps.map((step, index) => (
          <FormStep
            key={index + 1}
            step={index + 1}
            currentStep={currentStep}
            isTransitioning={isTransitioning}
            title={step.title}
            description={step.description}
          >
            {step.fields.map(field => (
              field.type === "checkbox" ? (
                <CheckboxField
                  key={field.name}
                  id={field.name}
                  label={field.label}
                  checked={formData[field.name] || false}
                  onChange={(checked) => handleInputChange(field.name, checked)}
                />
              ) : (
                <FormField
                  key={field.name}
                  label={field.label}
                  type={field.type}
                  placeholder={field.placeholder || ""}
                  value={formData[field.name] || ""}
                  onChange={(value) => handleInputChange(field.name, value)}
                  error={fieldErrors[field.name]}
                  maxLength={field.maxLength}
                  currentLength={formData[field.name]?.length || 0}
                  required={field.required}
                />
              )
            ))}
          </FormStep>
        ))}

        {/* Navigation Buttons */}
        <NavigationButtons
          currentStep={currentStep}
          maxSteps={steps.length}
          onPrevious={handlePrevious}
          onNext={currentStep === steps.length ? handleSubmit : handleNext}
          isTransitioning={isTransitioning}
        />
      </div>

      {/* Right Column - Grainient Background */}
      <GrainientBackground colors={grainientColors} />
    </MultiStepDialog>
  );
}
