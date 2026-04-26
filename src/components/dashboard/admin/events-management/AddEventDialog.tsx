"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/zenith/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/zenith/components/ui/select";
import { Loader2, X as CloseIcon } from "lucide-react";
import Image from "next/image";
import { FileUpload as FileUploadBase } from "@/components/application/file-upload/file-upload-base";
import MDEditor from '@uiw/react-md-editor';
import { z } from "zod";
import imageCompression from "browser-image-compression";
import { addEvent } from "@/lib/action";
import { showToastPromise } from "@/components/toasts";
import { useQueryClient } from "@tanstack/react-query";
import { StableGrainient } from "../content-management/StableGrainient";

const eventCategories = [
  "conference",
  "seminar", 
  "workshop",
  "webinar",
  "training",
  "other"
];

const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(60, "Title must be 60 characters or less"),
  description: z.string().min(1, "Description is required").max(460, "Description must be 460 characters or less"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Category is required"),
  type: z.string().min(1, "Event type is required"),
  event_organizer_name: z.string().optional(),
  event_organizer_role: z.string().optional(),
  event_organizer_image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

interface FileUploadProps {
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  value: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  helperText?: React.ReactNode;
  className?: string;
}

function FileUpload({
  multiple = false,
  accept = "image/*",
  maxFiles = 10,
  value = [],
  onChange,
  disabled = false,
  helperText,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<Array<{ id: string; file: File; progress: number; failed: boolean }>>(
    value.map((file, index) => ({
      id: `${file.name}-${index}`,
      file,
      progress: 100,
      failed: false,
    }))
  );

  useEffect(() => {
    setFiles(value.map((file, index) => ({
      id: `${file.name}-${index}`,
      file,
      progress: 100,
      failed: false,
    })));
  }, [value]);

  const handleDropFiles = (filesList: FileList) => {
    const fileArray = Array.from(filesList);
    const updatedFiles = multiple ? [...value, ...fileArray].slice(0, maxFiles) : fileArray.slice(0, 1);
    onChange(updatedFiles);
  };

  const handleRemoveFile = (fileId: string) => {
    const updatedFiles = files.filter((f) => f.id !== fileId).map((f) => f.file);
    onChange(updatedFiles);
  };

  return (
    <div className={className}>
      <FileUploadBase.DropZone
        accept={accept}
        allowsMultiple={multiple}
        isDisabled={disabled}
        onDropFiles={handleDropFiles}
      />
      {files.length > 0 && (
        <FileUploadBase.Root className="mt-4">
          <FileUploadBase.List className="!grid !grid-cols-2 !gap-2">
            {files.map((fileItem) => (
              <FileUploadBase.ListItem
                key={fileItem.id}
                name={fileItem.file.name}
                size={fileItem.file.size}
                progress={fileItem.progress}
                onDelete={() => handleRemoveFile(fileItem.id)}
                className="!p-2 !gap-1.5 [&_p]:!text-xs [&_hr]:!h-2 [&>svg]:!size-6 [&>div>div>div>div>svg]:!size-2.5 min-w-0"
              />
            ))}
          </FileUploadBase.List>
        </FileUploadBase.Root>
      )}
      {helperText && <p className="text-sm text-gray-500 mt-2">{helperText}</p>}
    </div>
  );
}

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddEventDialog({ open, onOpenChange }: AddEventDialogProps) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const leftColumnRef = useRef<HTMLDivElement | null>(null);
  const [grainientHeight, setGrainientHeight] = useState(420);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  
  const [formData, setFormData] = useState({
    type: "previous_events",
    category: "",
    title: "",
    description: "",
    date: "",
    location: "",
    event_organizer_name: "",
    event_organizer_role: "",
    event_organizer_image: "",
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [selectedHeroImage, setSelectedHeroImage] = useState<number>(0);

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      type: "previous_events",
      category: "",
      title: "",
      description: "",
      date: "",
      location: "",
      event_organizer_name: "",
      event_organizer_role: "",
      event_organizer_image: "",
    });
    setSelectedImages([]);
    setImagePreviewUrls([]);
    setSelectedHeroImage(0);
    setValidationErrors({});
  };

  const handleFormDataChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  async function compressImage(file: File) {
    if(!file) return null;
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      return await imageCompression(file, options);
    } catch (error) {
      console.error(`Compression failed for ${file.name}:`, error);
      return null;
    }
  }

  const validateStep = (step: number) => {
    const errors: Record<string, string[]> = {};
    if (step === 1) {
      if (!formData.title) errors.title = ["Title is required"];
      if (!formData.description) errors.description = ["Description is required"];
      if (!formData.type) errors.type = ["Event type is required"];
      if (!formData.category) errors.category = ["Category is required"];
    } else if (step === 2) {
      if (!formData.date) errors.date = ["Date is required"];
      if (!formData.location) errors.location = ["Location is required"];
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    setIsTransitioning(true);
    setTimeout(() => {
      if (currentStep < 3) setCurrentStep(currentStep + 1);
      else handleCreateEvent();
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

  const handleCreateEvent = async () => {
    setIsCreatingEvent(true);
    
    const createEventPromise = (async () => {
      try {
        await eventSchema.parseAsync(formData);
        
        const formDataToSubmit = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          formDataToSubmit.append(key, value);
        });
        formDataToSubmit.append('heroImageIndex', selectedHeroImage.toString());
        
        selectedImages.forEach((file) => {
          formDataToSubmit.append('images', file);
        });
        
        const result = await addEvent({}, formDataToSubmit);
        
        if (result.status === "SUCCESS") {
          onOpenChange(false);
          resetForm();
          queryClient.invalidateQueries({ queryKey: [["eventsManagement", "getEvents"]] });
          return { success: true };
        } else {
          throw new Error(result.error || "Failed to add event");
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors: Record<string, string[]> = {};
          error.errors.forEach((err) => {
            if (err.path) errors[err.path[0] as string] = [err.message];
          });
          setValidationErrors(errors);
          setCurrentStep(1); // go back to step 1 to show errors, or keep current
          throw new Error("Validation failed. Please check the form fields.");
        }
        throw error;
      } finally {
        setIsCreatingEvent(false);
      }
    })();

    showToastPromise({
      promise: createEventPromise,
      loadingText: 'Creating event...',
      successText: 'The event has been created successfully',
      successHeaderText: 'Success',
      errorText: 'Failed to create event',
      errorHeaderText: 'Error',
      direction: 'right'
    });
  };

  useEffect(() => {
    if (!open) return;
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
  }, [open, currentStep]);

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) resetForm();
      onOpenChange(val);
    }}>
      <DialogContent 
        className="max-w-3xl rounded-[40px] sm:rounded-[40px] overflow-hidden border-none shadow-2xl p-8"
        closeButton={
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <CloseIcon size={20} />
            <span className="sr-only">Close</span>
          </button>
        }
      >
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
              if (currentStep === 3) handleCreateEvent();
              else handleNext();
            }}
            className="flex gap-6 pt-7 items-stretch"
          >
            {/* Left Column */}
            <div ref={leftColumnRef} className="flex-1 flex flex-col min-h-0 max-h-[65vh]">
              {/* Step heading block */}
              <div className={`mb-7 shrink-0 transition-all duration-300 ${isTransitioning ? 'opacity-0 transform -translate-x-2' : 'opacity-100 transform translate-x-0'}`}>
                <h2 className="text-[17px] font-bold text-[rgb(34,34,34)] leading-snug mb-2">
                  {currentStep === 1 && "Basic details"}
                  {currentStep === 2 && "Event logistics"}
                  {currentStep === 3 && "Media & review"}
                </h2>
                <p className="text-[13px] font-light text-[rgba(96,115,142,0.88)] leading-relaxed">
                  {currentStep === 1 && "Enter the primary details for the new event"}
                  {currentStep === 2 && "Where and when is this happening?"}
                  {currentStep === 3 && "Upload event photos and submit"}
                </p>
              </div>

              <div className={`flex-1 flex flex-col gap-5 transition-all duration-300 overflow-y-auto overflow-x-hidden pr-3 -mr-3 pb-2 ${isTransitioning ? 'opacity-0 transform -translate-x-2' : 'opacity-100 transform translate-x-0'}`}>
                {currentStep === 1 && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                          Event Type*
                        </label>
                        <Select value={formData.type} onValueChange={(val) => handleFormDataChange('type', val)}>
                          <SelectTrigger className={`w-full h-10 px-3.5 rounded-[10px] border bg-[rgba(187,187,187,0.26)] text-[14px] text-gray-800 outline-none focus:ring-0 focus:ring-offset-0 ${validationErrors.type ? 'border-red-500' : 'border-[rgba(136,136,136,0.2)]'}`}>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="previous_events">Previous Events</SelectItem>
                            <SelectItem value="upcoming_events">Upcoming Events</SelectItem>
                          </SelectContent>
                        </Select>
                        {validationErrors.type && <span className="text-red-500 text-xs mt-1">{validationErrors.type[0]}</span>}
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                          Category*
                        </label>
                        <Select value={formData.category} onValueChange={(val) => handleFormDataChange('category', val)}>
                          <SelectTrigger className={`w-full h-10 px-3.5 rounded-[10px] border bg-[rgba(187,187,187,0.26)] text-[14px] text-gray-800 outline-none focus:ring-0 focus:ring-offset-0 ${validationErrors.category ? 'border-red-500' : 'border-[rgba(136,136,136,0.2)]'}`}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventCategories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {validationErrors.category && <span className="text-red-500 text-xs mt-1">{validationErrors.category[0]}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                        Event Title*
                      </label>
                      <input
                        type="text"
                        placeholder="Enter event title"
                        value={formData.title}
                        onChange={(e) => handleFormDataChange('title', e.target.value)}
                        maxLength={60}
                        className={`w-full h-10 px-3.5 rounded-[10px] border bg-[rgba(187,187,187,0.26)] text-[14px] text-gray-800 outline-none focus:border-[rgba(136,136,136,0.4)] transition-colors ${validationErrors.title ? 'border-red-500' : 'border-[rgba(136,136,136,0.2)]'}`}
                      />
                      {validationErrors.title && <span className="text-red-500 text-xs mt-1">{validationErrors.title[0]}</span>}
                    </div>

                    <div className="flex flex-col gap-2" data-color-mode="light">
                      <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                        Description*
                      </label>
                      <div className={`rounded-[10px] overflow-hidden border ${validationErrors.description ? 'border-red-500' : 'border-[rgba(136,136,136,0.2)]'}`}>
                        <MDEditor
                          value={formData.description}
                          onChange={(val) => handleFormDataChange('description', val || '')}
                          preview="edit"
                          height={180}
                          textareaProps={{
                            placeholder: "Description with markdown support...",
                            maxLength: 460,
                          }}
                          className="bg-[rgba(187,187,187,0.26)]"
                        />
                      </div>
                      {validationErrors.description && <span className="text-red-500 text-xs mt-1">{validationErrors.description[0]}</span>}
                    </div>
                  </>
                )}

                {currentStep === 2 && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                          Date*
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => handleFormDataChange('date', e.target.value)}
                          className={`w-full h-10 px-3.5 rounded-[10px] border bg-[rgba(187,187,187,0.26)] text-[14px] text-gray-800 outline-none focus:border-[rgba(136,136,136,0.4)] transition-colors ${validationErrors.date ? 'border-red-500' : 'border-[rgba(136,136,136,0.2)]'}`}
                        />
                        {validationErrors.date && <span className="text-red-500 text-xs mt-1">{validationErrors.date[0]}</span>}
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                          Location*
                        </label>
                        <input
                          type="text"
                          placeholder="Event location"
                          value={formData.location}
                          onChange={(e) => handleFormDataChange('location', e.target.value)}
                          className={`w-full h-10 px-3.5 rounded-[10px] border bg-[rgba(187,187,187,0.26)] text-[14px] text-gray-800 outline-none focus:border-[rgba(136,136,136,0.4)] transition-colors ${validationErrors.location ? 'border-red-500' : 'border-[rgba(136,136,136,0.2)]'}`}
                        />
                        {validationErrors.location && <span className="text-red-500 text-xs mt-1">{validationErrors.location[0]}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                      <h3 className="text-sm font-medium text-gray-800 mb-1 border-b border-gray-100 pb-2">Organizer Information (Optional)</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                            Name
                          </label>
                          <input
                            type="text"
                            placeholder="Organizer name"
                            value={formData.event_organizer_name}
                            onChange={(e) => handleFormDataChange('event_organizer_name', e.target.value)}
                            className="w-full h-10 px-3.5 rounded-[10px] border border-[rgba(136,136,136,0.2)] bg-[rgba(187,187,187,0.26)] text-[14px] text-gray-800 outline-none focus:border-[rgba(136,136,136,0.4)] transition-colors"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                            Role
                          </label>
                          <input
                            type="text"
                            placeholder="Organizer role"
                            value={formData.event_organizer_role}
                            onChange={(e) => handleFormDataChange('event_organizer_role', e.target.value)}
                            className="w-full h-10 px-3.5 rounded-[10px] border border-[rgba(136,136,136,0.2)] bg-[rgba(187,187,187,0.26)] text-[14px] text-gray-800 outline-none focus:border-[rgba(136,136,136,0.4)] transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {currentStep === 3 && (
                  <div className="flex flex-col h-full space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-medium text-[rgb(136,136,136)] tracking-wide">
                        Event Images
                      </label>
                      <FileUpload
                        multiple={formData.type === "previous_events"}
                        maxFiles={formData.type === "upcoming_events" ? 1 : 10}
                        value={selectedImages}
                        onChange={async (files: File[]) => {
                          if (!files) return;
                          const compressed = await Promise.all(files.map((f: File) => compressImage(f)));
                          const filtered = compressed.filter(Boolean) as File[];
                          setSelectedImages(filtered);
                          setImagePreviewUrls(filtered.map((f: File) => URL.createObjectURL(f)));
                          if (filtered.length > 0) setSelectedHeroImage(0);
                        }}
                      />

                      {imagePreviewUrls.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-3 max-h-[160px] overflow-y-auto pr-1">
                          {imagePreviewUrls.map((url, idx) => (
                            <div key={idx} className="relative aspect-video rounded-md overflow-hidden border border-gray-200">
                              <Image src={url} alt="Preview" fill className="object-cover" />
                              <div className="absolute top-1 left-1 bg-white/80 rounded-full p-0.5">
                                <input
                                  type="radio"
                                  checked={selectedHeroImage === idx}
                                  onChange={() => setSelectedHeroImage(idx)}
                                  className="h-3 w-3 accent-black"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className={`shrink-0 flex gap-3 mt-4 pt-4 border-t border-[rgba(34,34,34,0.06)] transition-all duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
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
                  disabled={isTransitioning || isCreatingEvent}
                  className="flex-1 h-10 rounded-[10px] bg-[rgb(34,34,34)] text-[13px] font-semibold text-white cursor-pointer transition-all duration-150 hover:bg-[rgb(51,51,51)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingEvent ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating...</span>
                    </div>
                  ) : (
                    currentStep === 3 ? "Submit" : "Next"
                  )}
                </button>
              </div>
            </div>

            {/* Right Column - Grainient */}
            <div
              className="w-2/5 rounded-[28px] overflow-hidden relative border border-slate-300 hidden md:block"
              style={{ height: grainientHeight }}
            >
              <StableGrainient color1="#1F6F5F" color2="#6FCF97" color3="#2FA084" />
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
