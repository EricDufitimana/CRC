"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface FormFieldProps {
  label: string;
  type: "text" | "url" | "textarea" | "date";
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string[];
  maxLength?: number;
  currentLength?: number;
  required?: boolean;
  className?: string;
}

export function FormField({
  label,
  type,
  placeholder,
  value,
  onChange,
  error,
  maxLength,
  currentLength,
  required = false,
  className = ""
}: FormFieldProps) {
  const hasError = error && error.length > 0;
  const showCharCounter = maxLength && currentLength !== undefined;

  const inputElement = type === "textarea" ? (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={maxLength}
      className={`w-full min-h-[120px] px-3.5 py-3 rounded-[10px] border bg-[rgba(187,187,187,0.26)] text-[14px] text-[#999] outline-none resize-y focus:border-[rgba(136,136,136,0.4)] transition-colors ${hasError ? 'border-red-500' : 'border-[rgba(136,136,136,0.2)]'
        } ${className}`}
    />
  ) : (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={maxLength}
      className={`w-full h-10 px-3.5 rounded-[10px] border bg-[rgba(187,187,187,0.26)] text-[14px] text-[#999] outline-none resize-y focus:border-[rgba(136,136,136,0.4)] transition-colors ${hasError ? 'border-red-500' : 'border-[rgba(136,136,136,0.2)]'
        } ${className}`}
    />
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
        {label}{required && "*"}
      </label>
      {inputElement}
      <div className="flex justify-between text-xs mt-1">
        {showCharCounter && (
          <span className={currentLength === maxLength ? "text-red-500" : "text-gray-400"}>
            {maxLength - currentLength} characters left
          </span>
        )}
        {hasError && (
          <span className="text-red-500">{error[0]}</span>
        )}
      </div>
    </div>
  );
}

interface CheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CheckboxField({ id, label, checked, onChange }: CheckboxFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-[rgb(34,34,34)] focus:ring-[rgb(34,34,34)]"
      />
      <label htmlFor={id} className="text-[12px] font-medium text-[rgb(136,136,136)]">
        {label}
      </label>
    </div>
  );
}

interface NavigationButtonsProps {
  currentStep: number;
  maxSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  isTransitioning: boolean;
  isLoading?: boolean;
}

export function NavigationButtons({
  currentStep,
  maxSteps,
  onPrevious,
  onNext,
  isTransitioning,
  isLoading = false,
}: NavigationButtonsProps) {
  const isFinalStep = currentStep === maxSteps;
  const isDisabled = isTransitioning || isLoading;

  return (
    <div className={`flex gap-3 mt-4 pt-4 border-t border-[rgba(34,34,34,0.06)] transition-all duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'
      }`}>
      {currentStep > 1 && (
        <button
          type="button"
          onClick={onPrevious}
          disabled={isDisabled}
          className="flex-1 h-10 rounded-[10px] border border-[rgba(34,34,34,0.15)] bg-white text-[13px] font-semibold text-[rgb(34,34,34)] cursor-pointer transition-all duration-150 hover:bg-[rgba(34,34,34,0.04)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={isDisabled}
        className="flex-1 h-10 rounded-[10px] bg-[rgb(34,34,34)] text-[13px] font-semibold text-white cursor-pointer transition-all duration-150 hover:bg-[rgb(51,51,51)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isFinalStep && isLoading ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Creating...
          </>
        ) : (
          isFinalStep ? "Create" : "Next"
        )}
      </button>
    </div>
  );
}
