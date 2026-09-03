"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "@phosphor-icons/react";

interface MultiStepDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  children: React.ReactNode;
  maxSteps: number;
  currentStep: number;
  isTransitioning: boolean;
  grainientColors?: {
    color1: string;
    color2: string;
    color3: string;
  };
  grainientConfig?: {
    timeSpeed?: number;
    warpStrength?: number;
    grainAmount?: number;
    zoom?: number;
    blendAngle?: number;
  };
}

export function MultiStepDialog({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  maxSteps,
  currentStep,
  isTransitioning,
  grainientColors = {
    color1: "#F0B07A",
    color2: "#F87171",
    color3: "#FEF3C7",
  },
  grainientConfig = {
    timeSpeed: 0.3,
    warpStrength: 0.8,
    grainAmount: 0.05,
    zoom: 1.2,
    blendAngle: 45,
  },
}: MultiStepDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // ── Escape key ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // ── Body scroll lock ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  // ── Focus trap + restore previous focus ───────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    // Remember who had focus before the dialog opened
    previouslyFocusedRef.current = document.activeElement as HTMLElement;

    // Move focus into the dialog on the next frame
    const raf = requestAnimationFrame(() => {
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.[0]?.focus();
    });

    return () => {
      cancelAnimationFrame(raf);
      // Restore focus when dialog closes
      previouslyFocusedRef.current?.focus();
    };
  }, [isOpen]);

  // ── Focus trap: keep Tab inside the dialog ────────────────────────────────
  const handleKeyDownTrap = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) ?? []
    ).filter((el) => !el.hasAttribute("disabled"));

    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  if (!isOpen) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      onKeyDown={handleKeyDownTrap}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog card */}
      <div
        ref={dialogRef}
        className="relative bg-white rounded-[33px] w-full max-w-[812px] flex flex-col shadow-[0_8px_40px_rgba(0,0,0,0.12)] max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog Header */}
        <div className="flex justify-between items-center px-9 pt-8 pb-0 shrink-0">
          <StepIndicator
            currentStep={currentStep}
            maxSteps={maxSteps}
            isTransitioning={isTransitioning}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body — flex-1 so it fills dialog height, items-stretch so grainient matches left col */}
        <form onSubmit={handleFormSubmit} className="flex-1 min-h-0 flex gap-6 px-9 pt-7 pb-6 items-stretch overflow-hidden">
          {children}
        </form>
      </div>
    </div>
  );

  // Render into a portal so it escapes any parent stacking contexts
  return typeof document !== "undefined"
    ? createPortal(content, document.body)
    : null;
}

interface StepIndicatorProps {
  currentStep: number;
  maxSteps: number;
  isTransitioning: boolean;
}

function StepIndicator({ currentStep, maxSteps, isTransitioning }: StepIndicatorProps) {
  return (
    <div className="w-[154px] h-[5px] flex gap-0.5 items-center">
      {Array.from({ length: maxSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <div
            key={stepNumber}
            className={`h-[5px] rounded-[27px] transition-all duration-500 ease-out ${isActive
              ? "w-[43px] bg-[#222]"
              : isCompleted
                ? "w-[30px] bg-[#222]"
                : "w-[30px] bg-[rgba(212,212,212,0.5)]"
              }`}
          />
        );
      })}
    </div>
  );
}
