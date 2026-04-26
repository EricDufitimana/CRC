"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { StableGrainient } from "../content-management/StableGrainient";
import { showToastSuccess, showToastError, showToastPromise } from "@/components/toasts";
import { Check, ChevronsUpDown, X as CloseIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/zenith/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/zenith/components/ui/command";
import { Badge } from "@/zenith/components/ui/badge";
import { cn } from "@/zenith/lib/utils";

interface AddWorkshopDialogProps {
  onClose: () => void;
}

interface WorkshopFormData {
  title: string;
  description: string;
  google_slide_url: string;
  workshop_date: string;
  workshop_groups: string[];
}

interface FormErrors {
  title?: string[];
  description?: string[];
  workshop_groups?: string[];
  workshop_date?: string[];
}

export function AddWorkshopDialog({ onClose }: AddWorkshopDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const leftColumnRef = useRef<HTMLDivElement | null>(null);
  const [grainientHeight, setGrainientHeight] = useState(420);

  const [formData, setFormData] = useState<WorkshopFormData>({
    title: "",
    description: "",
    google_slide_url: "",
    workshop_date: "",
    workshop_groups: [],
  });
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { data: crcClasses = [], isLoading: crcClassesLoading } = useQuery(
    trpc.workshopsManagement.getCrcClasses.queryOptions()
  );

  const createWorkshopMutation = useMutation({
    ...trpc.workshopsManagement.createWorkshop.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['workshopsManagement', 'getWorkshopsByCategory']] });
      setFormData({
        title: "",
        description: "",
        google_slide_url: "",
        workshop_date: "",
        workshop_groups: [],
      });
      setFieldErrors({});
      setCurrentStep(1);
      onClose();
    },
    onError: (error) => {
      showToastError({
        headerText: 'Creation Failed',
        paragraphText: error.message || 'We couldn\'t add the workshop. Please try again.',
        direction: 'right'
      });
    }
  });

  const gradeGroups = [
    { value: "Enrichment_Year", label: "Enrichment Year" },
    { value: "Senior_4", label: "Senior 4" },
    { value: "Senior_5", label: "Senior 5" },
    { value: "Senior_6", label: "Senior 6" },
  ];

  const handleInputChange = (field: keyof WorkshopFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: [] }));
  };

  const toggleGroup = (value: string) => {
    const group = gradeGroups.find(g => g.value === value);
    
    setFormData(prev => {
      let nextGroups = [...prev.workshop_groups];
      
      if (group) {
        // It's a grade group (All)
        const subClasses = crcClasses
          .filter((c: any) => c.grade_group === value)
          .map((c: any) => `class:${c.id}`);
        
        const allSubSelected = subClasses.every(id => nextGroups.includes(id));
        
        if (allSubSelected) {
          nextGroups = nextGroups.filter(id => !subClasses.includes(id));
        } else {
          nextGroups = Array.from(new Set([...nextGroups, ...subClasses]));
        }
      } else {
        // Individual class
        if (nextGroups.includes(value)) {
          nextGroups = nextGroups.filter(v => v !== value);
        } else {
          nextGroups.push(value);
        }
      }
      
      return { ...prev, workshop_groups: nextGroups };
    });
    setFieldErrors(prev => ({ ...prev, workshop_groups: [] }));
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.title.trim()) {
      errors.title = ["Title is required"];
    }
    if (!formData.description.trim()) {
      errors.description = ["Description is required"];
    }

    if (currentStep === 2) {
      if (formData.workshop_groups.length === 0) {
        errors.workshop_groups = ["At least one class or group is required"];
      }
      if (!formData.workshop_date) {
        errors.workshop_date = ["Workshop date is required"];
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
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
      if (!validateForm()) return;
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
    if (!validateForm()) {
      setCurrentStep(2);
      return;
    }

    const promise = createWorkshopMutation.mutateAsync({
      ...formData,
      presentation_url: "", // Default from original form
    });

    showToastPromise({
      promise,
      loadingText: 'Creating workshop...',
      successText: 'The workshop has been added successfully',
      successHeaderText: 'Workshop Created',
      errorText: 'Failed to create workshop',
      errorHeaderText: 'Error',
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

  return (
    <div className="w-full">
      {/* Step indicator */}
      <div className="w-[154px] h-[5px] flex gap-0.5 items-center">
        <div className={`h-[5px] rounded-[27px] transition-all duration-500 ease-out ${currentStep === 1 ? 'w-[43px] bg-[#222]' :
            'w-[30px] bg-[rgba(212,212,212,0.5)]'
          }`} />
        <div className={`h-[5px] rounded-[27px] transition-all duration-500 ease-out ${currentStep === 2 ? 'w-[43px] bg-[#222]' :
            'w-[30px] bg-[rgba(212,212,212,0.5)]'
          }`} />
        <div className={`h-[5px] rounded-[27px] transition-all duration-500 ease-out ${currentStep === 3 ? 'w-[43px] bg-[#222]' :
            'w-[30px] bg-[rgba(212,212,212,0.5)]'
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
          {/* Step heading block */}
          <div className={`mb-7 transition-all duration-300 ${isTransitioning ? 'opacity-0 transform -translate-x-2' : 'opacity-100 transform translate-x-0'}`}>
            <h2 className="text-[17px] font-bold text-[rgb(34,34,34)] leading-snug mb-2">
              {currentStep === 1 && "Add a new workshop"}
              {currentStep === 2 && "Workshop details"}
              {currentStep === 3 && "Review & submit"}
            </h2>
            <p className="text-[13px] font-light text-[rgba(96,115,142,0.88)] leading-relaxed">
              {currentStep === 1 && "Enter the primary details for the new workshop"}
              {currentStep === 2 && "Select the class and date for this workshop"}
              {currentStep === 3 && "Review your information before submitting"}
            </p>
          </div>

          <div className={`flex-1 flex flex-col gap-5 transition-all duration-300 ${isTransitioning ? 'opacity-0 transform -translate-x-2' : 'opacity-100 transform translate-x-0'}`}>
            {currentStep === 1 && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                    Title*
                  </label>
                  <input
                    type="text"
                    placeholder="Workshop title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full h-10 px-3.5 rounded-[10px] border bg-[rgba(187,187,187,0.26)] text-[14px] text-gray-800 outline-none focus:border-[rgba(136,136,136,0.4)] transition-colors ${fieldErrors.title && fieldErrors.title.length > 0 ? 'border-red-500' : 'border-[rgba(136,136,136,0.2)]'
                      }`}
                  />
                  {fieldErrors.title && fieldErrors.title.length > 0 && (
                    <span className="text-red-500 text-xs mt-1">{fieldErrors.title[0]}</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                    Description*
                  </label>
                  <textarea
                    placeholder="Workshop description..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={`w-full min-h-[120px] px-3.5 py-3 rounded-[10px] border bg-[rgba(187,187,187,0.26)] text-[14px] text-gray-800 outline-none resize-y focus:border-[rgba(136,136,136,0.4)] transition-colors ${fieldErrors.description && fieldErrors.description.length > 0 ? 'border-red-500' : 'border-[rgba(136,136,136,0.2)]'
                      }`}
                  />
                  {fieldErrors.description && fieldErrors.description.length > 0 && (
                    <span className="text-red-500 text-xs mt-1">{fieldErrors.description[0]}</span>
                  )}
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                    CRC Classes / Groups*
                  </label>
                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        role="combobox"
                        aria-expanded={isPopoverOpen}
                        className={cn(
                          "w-full min-h-10 px-3.5 py-2 rounded-[10px] border bg-[rgba(187,187,187,0.26)] text-[14px] text-gray-800 outline-none flex items-center justify-between transition-all duration-200 hover:bg-[rgba(187,187,187,0.3)]",
                          fieldErrors.workshop_groups && fieldErrors.workshop_groups.length > 0 ? "border-red-500" : "border-[rgba(136,136,136,0.2)]"
                        )}
                      >
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {formData.workshop_groups.length === 0 ? (
                            <span className="text-gray-400 font-light">Select classes or groups</span>
                          ) : (
                            formData.workshop_groups.map((val) => {
                              const group = gradeGroups.find(g => g.value === val);
                              const cls = crcClasses.find((c: any) => `class:${c.id}` === val);
                              const label = group ? `${group.label} (All)` : cls?.name || val;
                              return (
                                <Badge
                                  key={val}
                                  variant="secondary"
                                  className="bg-white/80 backdrop-blur-sm border-gray-100 text-[11px] font-medium text-gray-700 h-6 px-2 rounded-lg flex items-center gap-1 group/badge"
                                >
                                  {label}
                                  <CloseIcon
                                    size={12}
                                    className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleGroup(val);
                                    }}
                                  />
                                </Badge>
                              );
                            })
                          )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[320px] p-0 rounded-2xl border border-gray-100 shadow-2xl bg-white/95 backdrop-blur-md overflow-hidden" align="start">
                      <Command className="bg-transparent h-full">
                        <CommandInput placeholder="Search classes..." className="h-11 border-none focus:ring-0 text-[13px]" />
                        <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden py-1">
                          <CommandEmpty className="py-6 text-center text-sm text-gray-400">No classes found.</CommandEmpty>
                          {gradeGroups.map((group) => (
                            <CommandGroup key={group.value} heading={group.label} className="px-2">
                              <CommandItem
                                onSelect={() => toggleGroup(group.value)}
                                className="flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors"
                              >
                                {(() => {
                                  const subClasses = crcClasses
                                    .filter((c: any) => c.grade_group === group.value)
                                    .map((c: any) => `class:${c.id}`);
                                  const allSubSelected = subClasses.length > 0 && subClasses.every(id => formData.workshop_groups.includes(id));
                                  return (
                                    <div className={cn(
                                      "w-4 h-4 rounded-md border flex items-center justify-center transition-all",
                                      allSubSelected ? "bg-[#222] border-[#222]" : "border-gray-200"
                                    )}>
                                      {allSubSelected && <Check className="h-3 w-3 text-white" />}
                                    </div>
                                  );
                                })()}
                                <span className="text-[13px] font-medium text-gray-700">{group.label} (All)</span>
                              </CommandItem>
                              {crcClasses
                                .filter((c: any) => c.grade_group === group.value)
                                .map((c: any) => (
                                  <CommandItem
                                    key={c.id}
                                    onSelect={() => toggleGroup(`class:${c.id}`)}
                                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors ml-4"
                                  >
                                    <div className={cn(
                                      "w-4 h-4 rounded-md border flex items-center justify-center transition-all",
                                      formData.workshop_groups.includes(`class:${c.id}`) ? "bg-[#222] border-[#222]" : "border-gray-200"
                                    )}>
                                      {formData.workshop_groups.includes(`class:${c.id}`) && <Check className="h-3 w-3 text-white" />}
                                    </div>
                                    <span className="text-[13px] text-gray-600">{c.name}</span>
                                  </CommandItem>
                                ))
                              }
                            </CommandGroup>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {fieldErrors.workshop_groups && fieldErrors.workshop_groups.length > 0 && (
                    <span className="text-red-500 text-xs mt-1">{fieldErrors.workshop_groups[0]}</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                    Workshop Date*
                  </label>
                  <input
                    type="date"
                    value={formData.workshop_date}
                    onChange={(e) => handleInputChange('workshop_date', e.target.value)}
                    className={`w-full h-10 px-3.5 rounded-[10px] border bg-[rgba(187,187,187,0.26)] text-[14px] text-gray-800 outline-none focus:border-[rgba(136,136,136,0.4)] transition-colors ${fieldErrors.workshop_date && fieldErrors.workshop_date.length > 0 ? 'border-red-500' : 'border-[rgba(136,136,136,0.2)]'
                      }`}
                  />
                  {fieldErrors.workshop_date && fieldErrors.workshop_date.length > 0 && (
                    <span className="text-red-500 text-xs mt-1">{fieldErrors.workshop_date[0]}</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                    Google Slides Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://docs.google.com/presentation/..."
                    value={formData.google_slide_url}
                    onChange={(e) => handleInputChange('google_slide_url', e.target.value)}
                    className="w-full h-10 px-3.5 rounded-[10px] border border-[rgba(136,136,136,0.2)] bg-[rgba(187,187,187,0.26)] text-[14px] text-gray-800 outline-none focus:border-[rgba(136,136,136,0.4)] transition-colors"
                  />
                </div>
              </>
            )}

            {currentStep === 3 && (
              <div className="space-y-3">
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span className="text-[11px] font-semibold text-gray-400">
                        Workshop Summary
                      </span>
                    </div>
                  </div>

                  {[
                    { label: "Title", value: formData.title },
                    { label: "Description", value: formData.description },
                    { 
                      label: "Groups/Classes", 
                      value: formData.workshop_groups.map(val => {
                        const group = gradeGroups.find(g => g.value === val);
                        const cls = crcClasses.find((c: any) => `class:${c.id}` === val);
                        return group ? group.label : cls?.name || val;
                      }).join(", ") 
                    },
                    { label: "Date", value: formData.workshop_date },
                    { label: "Slides URL", value: formData.google_slide_url || 'None' },
                  ].map(({ label, value }, i, arr) => (
                    <div
                      key={label}
                      className={`flex items-baseline gap-4 px-4 py-2.5 ${i < arr.length - 1 ? "border-b border-gray-50" : ""
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
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Review the details above. Click <span className="font-medium text-gray-500">Submit</span> to create.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

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
              disabled={isTransitioning || createWorkshopMutation.isPending}
              className="flex-1 h-10 rounded-[10px] bg-[rgb(34,34,34)] text-[13px] font-semibold text-white cursor-pointer transition-all duration-150 hover:bg-[rgb(51,51,51)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createWorkshopMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Adding...</span>
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
          <StableGrainient color1="#1F6F5F" color2="#6FCF97" color3="#2FA084" />
        </div>
      </form>
    </div>
  );
}
