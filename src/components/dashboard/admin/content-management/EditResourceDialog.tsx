"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { showToastPromise } from "@/components/toasts";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { DialogTitle } from "@/zenith/components/ui/dialog";
import { Resource } from "./types";
import { StableGrainient } from "./StableGrainient";

const TITLE_MAX = 40;
const DESC_MAX = 420;

// Common text color for all inputs
const INPUT_TEXT_COLOR = "text-gray-800";


interface EditResourceDialogProps {
  resource: Resource | null;
  onClose: () => void;
}

interface ResourceFormData {
  title: string;
  description: string;
  imageAddress: string;
  url: string;
  secondaryUrl: string;
  deadline: string;
}

interface FormErrors {
  title?: string[];
  description?: string[];
  url?: string[];
  secondaryUrl?: string[];
  imageAddress?: string[];
  deadline?: string[];
}

export function EditResourceDialog({
  resource,
  onClose,
}: EditResourceDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const leftColumnRef = useRef<HTMLDivElement | null>(null);
  const [grainientHeight, setGrainientHeight] = useState(420);
  const [formData, setFormData] = useState<ResourceFormData>({
    title: "",
    description: "",
    imageAddress: "",
    url: "",
    secondaryUrl: "",
    deadline: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  const updateResourceMutation = useMutation({
    ...trpc.resources.update.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [['contentManagement', 'getResourcesByCategory']],
      });
      queryClient.invalidateQueries({
        queryKey: [['resources', 'getByCategory']],
      });
      onClose();
    },
  });

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title,
        description: resource.description,
        imageAddress: resource.image_address || "",
        url: resource.url || "",
        secondaryUrl: resource.secondary_url || "",
        deadline: resource.opportunity_deadline || "",
      });
      setFieldErrors({});
    }
  }, [resource]);

  const handleInputChange = (field: keyof ResourceFormData, value: string) => {
    // Apply character limits
    if (field === 'title' && value.length > TITLE_MAX) return;
    if (field === 'description' && value.length > DESC_MAX) return;
    
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors for this field when user starts typing
    setFieldErrors(prev => ({ ...prev, [field]: [] }));
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    // Title validation
    if (!formData.title.trim()) {
      errors.title = ["Title is required"];
    }
    
    // Description validation
    if (!formData.description.trim()) {
      errors.description = ["Description is required"];
    }
    
    // URL validation
    if (!formData.url.trim()) {
      errors.url = ["URL is required"];
    } else {
      try {
        new URL(formData.url);
      } catch {
        errors.url = ["Must be a valid URL"];
      }
    }
    
    // Secondary URL validation (optional)
    if (resource?.category === 'templates' && formData.secondaryUrl.trim()) {
      try {
        new URL(formData.secondaryUrl);
      } catch {
        errors.secondaryUrl = ["Must be a valid URL"];
      }
    }
    
    // Image address validation (required)
    if (!formData.imageAddress.trim()) {
      errors.imageAddress = ["Image Address is required"];
    } else {
      try {
        new URL(formData.imageAddress);
      } catch {
        errors.imageAddress = ["Must be a valid URL"];
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (!formData.title.trim() || !formData.description.trim()) {
        const errors: FormErrors = {};
        if (!formData.title.trim()) errors.title = ["Title is required"];
        if (!formData.description.trim()) errors.description = ["Description is required"];
        setFieldErrors(errors);
        return;
      }
    }
    
    if (currentStep === 2) {
      if (!validateForm()) {
        return;
      }
    }
    
    setIsTransitioning(true);
    setTimeout(() => {
      if (currentStep < 3) setCurrentStep(currentStep + 1);
      else handleSubmit();
      setIsTransitioning(false);
    }, 300);
  };

  const handlePrevious = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (currentStep > 1) setCurrentStep(currentStep - 1);
      setIsTransitioning(false);
    }, 300);
  };

  const handleSubmit = () => {
    if (!resource) return;
    
    if (!validateForm()) {
      setCurrentStep(2);
      return;
    }

    const promise = updateResourceMutation.mutateAsync({
      id: resource.id,
      title: formData.title.trim(),
      description: formData.description.trim(),
      url: formData.url.trim(),
      secondary_url: formData.secondaryUrl?.trim() || undefined,
      image_address: formData.imageAddress?.trim() || undefined,
      opportunity_deadline: formData.deadline?.trim() || undefined,
    });

    showToastPromise({
      promise,
      loadingText: 'Updating resource...',
      successText: 'The resource has been updated',
      successHeaderText: 'Resource Updated Successfully',
      errorText: 'We couldn\'t update the resource. Please try again or contact support.',
      errorHeaderText: 'Failed To Update Resource',
      direction: 'right'
    });
  };

  useEffect(() => {
    const el = leftColumnRef.current;
    if (!el) return;

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const next = clamp(Math.ceil(entry.contentRect.height), 360, 640);
      setGrainientHeight((prev) => (prev === next ? prev : next));
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!resource) return null;

  return (
    <div className="w-full">
      <VisuallyHidden.Root>
        <DialogTitle>Edit Resource</DialogTitle>
      </VisuallyHidden.Root>
      
      {/* Step indicator */}
      <div className="w-[154px] h-[5px] flex gap-0.5 items-center">
        <div className={`h-[5px] rounded-[27px] transition-all duration-500 ease-out ${
          currentStep === 1 ? 'w-[43px] bg-[#222]' : 
          currentStep === 2 ? 'w-[30px] bg-[rgba(212,212,212,0.5)]' : 
          'w-[30px] bg-[rgba(212,212,212,0.5)]'
        }`} />
        <div className={`h-[5px] rounded-[27px] transition-all duration-500 ease-out ${
          currentStep === 1 ? 'w-[30px] bg-[rgba(212,212,212,0.5)]' : 
          currentStep === 2 ? 'w-[30px] bg-[#222]' : 
          'w-[30px] bg-[rgba(212,212,212,0.5)]'
        }`} />
        <div className={`h-[5px] rounded-[27px] transition-all duration-500 ease-out ${
          currentStep === 1 ? 'w-[30px] bg-[rgba(212,212,212,0.5)]' : 
          currentStep === 2 ? 'w-[30px] bg-[rgba(212,212,212,0.5)]' : 
          'w-[30px]  bg-[#222]'
        }`} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex gap-6 pt-7 items-stretch"
      >

          {/* Left Column */}
          <div ref={leftColumnRef} className="flex-1 flex flex-col min-h-0">

            {/* Step heading block — fixed height so columns stay aligned */}
            <div className={`mb-7 transition-all duration-300 ${isTransitioning ? 'opacity-0 transform -translate-x-2' : 'opacity-100 transform translate-x-0'}`}>
              <h2 className="text-[17px] font-bold text-[rgb(34,34,34)] leading-snug mb-2">
                {currentStep === 1 && "Edit resource"}
                {currentStep === 2 && "Resource details"}
                {currentStep === 3 && "Review & submit"}
              </h2>
              <p className="text-[13px] font-light text-[rgba(96,115,142,0.88)] leading-relaxed">
                {currentStep === 1 && "Update the information that will be displayed in the student's front page"}
                {currentStep === 2 && "Provide additional details about the resource including difficulty and requirements"}
                {currentStep === 3 && "Review your information before submitting the changes"}
              </p>
            </div>

            {/* Fields grow to fill available space */}
            <div className={`flex-1 flex flex-col gap-5 transition-all duration-300 ${isTransitioning ? 'opacity-0 transform -translate-x-2' : 'opacity-100 transform translate-x-0'}`}>

              {/* Step 1 */}
              {currentStep === 1 && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                      Title*
                    </label>
                    <div>

                      <input
                        type="text"
                        placeholder="Enter a title for the resource"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        maxLength={TITLE_MAX}
                        className={`w-full h-10 px-3.5 rounded-[10px] border bg-[rgba(187,187,187,0.26)] text-[14px] ${INPUT_TEXT_COLOR} outline-none resize-y focus:border-[rgba(136,136,136,0.4)] transition-colors ${
                          fieldErrors.title && fieldErrors.title.length > 0 ? 'border-red-500' : 'border-[rgba(136,136,136,0.2)]'
                        }`}
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span className={formData.title.length === TITLE_MAX ? "text-red-500" : "text-gray-400"}>
                          {TITLE_MAX - formData.title.length} characters left
                        </span>
                        {fieldErrors.title && fieldErrors.title.length > 0 && (
                          <span className="text-red-500">{fieldErrors.title[0]}</span>
                        )} 
                      </div>
                    </div>
                   
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                      Description*
                    </label>
                    <div>
                      <textarea
                      placeholder="Enter a description for the opportunity"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      maxLength={DESC_MAX}
                      className={`w-full min-h-[120px] px-3.5 py-3 rounded-[10px] border bg-[rgba(187,187,187,0.26)] text-[14px] ${INPUT_TEXT_COLOR} outline-none resize-y focus:border-[rgba(136,136,136,0.4)] transition-colors ${
                        fieldErrors.description && fieldErrors.description.length > 0 ? 'border-red-500' : 'border-[rgba(136,136,136,0.2)]'
                      }`}
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span className={formData.description.length === DESC_MAX ? "text-red-500" : "text-gray-400"}>
                          {DESC_MAX - formData.description.length} characters left
                        </span>
                        {fieldErrors.description && fieldErrors.description.length > 0 && (
                          <span className="text-red-500">{fieldErrors.description[0]}</span>
                        )}
                      </div>

                    </div>
                    
                  </div>
                </>
              )}

              {/* Step 2 */}
              {currentStep === 2 && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                      Image Address*
                    </label>
                    <input
                      type="url"
                      placeholder="Enter the image URL"
                      value={formData.imageAddress}
                      onChange={(e) => handleInputChange('imageAddress', e.target.value)}
                      className={`w-full h-10 px-3.5 rounded-[10px] border bg-[rgba(187,187,187,0.26)] text-[14px] ${INPUT_TEXT_COLOR} outline-none focus:border-[rgba(136,136,136,0.4)] transition-colors ${
                        fieldErrors.imageAddress && fieldErrors.imageAddress.length > 0 ? 'border-red-500' : 'border-[rgba(136,136,136,0.2)]'
                      }`}
                    />
                    {fieldErrors.imageAddress && fieldErrors.imageAddress.length > 0 && (
                      <div className="text-red-500 text-xs mt-1">{fieldErrors.imageAddress[0]}</div>
                    )}
                  </div>

                  {resource.category === 'templates' ? (
                    <>
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                          Blank Template URL*
                        </label>
                        <input
                          type="url"
                          placeholder="https://example.com/blank-template"
                          value={formData.url}
                          onChange={(e) => handleInputChange('url', e.target.value)}
                          className={`w-full h-10 px-3.5 rounded-[10px] border bg-[rgba(187,187,187,0.26)] text-[14px] ${INPUT_TEXT_COLOR} outline-none focus:border-[rgba(136,136,136,0.4)] transition-colors ${
                            fieldErrors.url && fieldErrors.url.length > 0 ? 'border-red-500' : 'border-[rgba(136,136,136,0.2)]'
                          }`}
                        />
                        {fieldErrors.url && fieldErrors.url.length > 0 && (
                          <div className="text-red-500 text-xs mt-1">{fieldErrors.url[0]}</div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                          Sample Template URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://example.com/sample-template"
                          value={formData.secondaryUrl}
                          onChange={(e) => handleInputChange('secondaryUrl', e.target.value)}
                          className={`w-full h-10 px-3.5 rounded-[10px] border bg-[rgba(187,187,187,0.26)] text-[14px] ${INPUT_TEXT_COLOR} outline-none focus:border-[rgba(136,136,136,0.4)] transition-colors ${
                            fieldErrors.secondaryUrl && fieldErrors.secondaryUrl.length > 0 ? 'border-red-500' : 'border-[rgba(136,136,136,0.2)]'
                          }`}
                        />
                        {fieldErrors.secondaryUrl && fieldErrors.secondaryUrl.length > 0 && (
                          <div className="text-red-500 text-xs mt-1">{fieldErrors.secondaryUrl[0]}</div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                        Resource URL*
                      </label>
                      <input
                        type="url"
                        placeholder="Enter the resource URL"
                        value={formData.url}
                        onChange={(e) => handleInputChange('url', e.target.value)}
                        className={`w-full h-10 px-3.5 rounded-[10px] border bg-[rgba(187,187,187,0.26)] text-[14px] ${INPUT_TEXT_COLOR} outline-none focus:border-[rgba(136,136,136,0.4)] transition-colors ${
                          fieldErrors.url && fieldErrors.url.length > 0 ? 'border-red-500' : 'border-[rgba(136,136,136,0.2)]'
                        }`}
                      />
                      {fieldErrors.url && fieldErrors.url.length > 0 && (
                        <div className="text-red-500 text-xs mt-1">{fieldErrors.url[0]}</div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                      Deadline (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleInputChange('deadline', e.target.value)}
                      className={`w-full h-10 px-3.5 rounded-[10px] border border-[rgba(136,136,136,0.2)] bg-[rgba(187,187,187,0.26)] text-[14px] ${INPUT_TEXT_COLOR} outline-none focus:border-[rgba(136,136,136,0.4)] transition-colors`}
                    />
                  </div>
                </>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        <span className="text-[11px] font-semibold text-gray-400">
                          Resource Summary
                        </span>
                      </div>
                    </div>

                    {[
                      { label: "Title", value: formData.title },
                      { label: "Description", value: formData.description },
                      { label: "Image URL", value: formData.imageAddress },
                      ...(resource.category === 'templates' ? [
                        { label: "Blank Template URL", value: formData.url },
                        { label: "Sample Template URL", value: formData.secondaryUrl || 'None' }
                      ] : [
                        { label: "Resource URL", value: formData.url }
                      ]),
                      { label: "Deadline", value: formData.deadline || 'None' },
                    ].map(({ label, value }, i, arr) => (
                      <div
                        key={label}
                        className={`flex items-baseline gap-4 px-4 py-2.5 ${
                          i < arr.length - 1 ? "border-b border-gray-50" : ""
                        }`}
                      >
                        <span className="text-[11px] font-semibold text-gray-400 w-24 shrink-0">
                          {label}
                        </span>
                        {value ? (
                          <span className="text-xs text-gray-800 break-all">{value}</span>
                        ) : (
                          <span className="text-xs text-gray-300 italic">Not provided</span>
                        )}
                      </div>
                    ))}

                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50/80 border-t border-gray-100">
                      <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Review the details above. Click{" "}
                        <span className="font-medium text-gray-500">Submit</span> to save changes, or{" "}
                        <span className="font-medium text-gray-500">Back</span> to make changes.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* ── Buttons — pinned to bottom of left column ── */}
            <div className={`flex gap-3 mt-4 pt-4 border-t border-[rgba(34,34,34,0.06)] transition-all duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={isTransitioning}
                  className="flex-1 h-10 rounded-[10px] border border-[rgba(34,34,34,0.15)] bg-white text-[13px] font-semibold text-[rgb(34,34,34)] cursor-pointer transition-all duration-150 hover:bg-[rgba(34,34,34,0.04)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
              )}
            
              <button
                type="button"
                onClick={handleNext}
                disabled={isTransitioning || updateResourceMutation.isPending}
                className="flex-1 h-10 rounded-[10px] bg-[rgb(34,34,34)] text-[13px] font-semibold text-white cursor-pointer transition-all duration-150 hover:bg-[rgb(51,51,51)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateResourceMutation.isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  currentStep === 3 ? "Submit" : "Next"
                )}
              </button>
            </div>

          </div>

          {/* Right Column - Grainient */}
          <div
            className="w-2/5 rounded-[28px] overflow-hidden relative border border-slate-300"
            style={{ height: grainientHeight }}
          >
            <StableGrainient />
          </div>
      </form>
    </div>
  );
}

