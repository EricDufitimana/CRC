"use client";

import { useState } from "react";
import { Button } from "@/zenith/components/ui/button";
import { Input } from "@/zenith/components/ui/input";
import { Label } from "@/zenith/components/ui/label";
import { Textarea } from "@/zenith/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/zenith/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/zenith/components/ui/select";
import { Plus, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { FileUpload } from "@/zenith/components/ui/file-upload";
import MDEditor from '@uiw/react-md-editor';
import { z } from "zod";
import imageCompression from "browser-image-compression";
import { addEvent } from "@/lib/action";
import { showToastPromise } from "@/components/toasts";
import { useQueryClient } from "@tanstack/react-query";

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

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddEventDialog({ open, onOpenChange }: AddEventDialogProps) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [formError, setFormError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
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
    setFormError("");
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

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!formData.type || !formData.category || !formData.title || !formData.description || !formData.date || !formData.location) {
        setFormError("Please fill in all required fields before proceeding.");
        return;
      }
      setFormError("");
      setCurrentStep(2);
    }
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
          const errors: Record<string, string> = {};
          error.errors.forEach((err) => {
            if (err.path) errors[err.path[0] as string] = err.message;
          });
          setValidationErrors(errors);
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

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) resetForm();
      onOpenChange(val);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>Create a new event for the platform</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center p-4">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= 1 ? 'bg-primary border-primary text-white' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
              <span className="text-sm font-medium">1</span>
            </div>
            <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${currentStep >= 2 ? 'bg-primary border-primary text-white' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
              <span className="text-sm font-medium">2</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {formError}
            </div>
          )}

          {currentStep === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select value={formData.type} onValueChange={(val) => handleFormDataChange('type', val)}>
                    <SelectTrigger className="rounded-xl focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="previous_events">Previous Events</SelectItem>
                      <SelectItem value="upcoming_events">Upcoming Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(val) => handleFormDataChange('category', val)}>
                    <SelectTrigger className="rounded-xl focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Event Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleFormDataChange('title', e.target.value)}
                    placeholder="Enter event title"
                    className="rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0"
                    maxLength={60}
                  />
              </div>

              <div className="space-y-2" data-color-mode="light">
                <Label>Description</Label>
                <MDEditor
                  value={formData.description}
                  onChange={(val) => handleFormDataChange('description', val || '')}
                  preview="live"
                  height={200}
                  textareaProps={{
                    placeholder: "Description with markdown support...",
                    maxLength: 460,
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleFormDataChange('date', e.target.value)}
                    className="rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => handleFormDataChange('location', e.target.value)}
                    placeholder="Event location"
                    className="rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Organizer Name</Label>
                  <Input
                    value={formData.event_organizer_name}
                    onChange={(e) => handleFormDataChange('event_organizer_name', e.target.value)}
                    placeholder="Name"
                    className="rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Organizer Role</Label>
                  <Input
                    value={formData.event_organizer_role}
                    onChange={(e) => handleFormDataChange('event_organizer_role', e.target.value)}
                    placeholder="Role"
                    className="rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Event Images</Label>
                <FileUpload
                  multiple={formData.type === "previous_events"}
                  maxFiles={formData.type === "upcoming_events" ? 1 : 10}
                  value={selectedImages}
                  onChange={async (files) => {
                    if (!files) return;
                    const compressed = await Promise.all(files.map(f => compressImage(f)));
                    const filtered = compressed.filter(Boolean) as File[];
                    setSelectedImages(filtered);
                    setImagePreviewUrls(filtered.map(f => URL.createObjectURL(f)));
                    if (filtered.length > 0) setSelectedHeroImage(0);
                  }}
                  onRemove={(idx) => {
                    const newImages = selectedImages.filter((_, i) => i !== idx);
                    setSelectedImages(newImages);
                    setImagePreviewUrls(newImages.map(f => URL.createObjectURL(f)));
                  }}
                />

                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {imagePreviewUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border">
                        <Image src={url} alt="Preview" fill className="object-cover" />
                        <div className="absolute top-1 left-1">
                          <input
                            type="radio"
                            checked={selectedHeroImage === idx}
                            onChange={() => setSelectedHeroImage(idx)}
                            className="h-4 w-4 accent-primary"
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

        <div className="flex justify-between pt-6 border-t mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <div className="flex gap-2">
            {currentStep === 2 && <Button variant="outline" onClick={() => setCurrentStep(1)} className="rounded-xl">Back</Button>}
            {currentStep === 1 ? (
              <Button onClick={handleNextStep} className="rounded-xl bg-black text-white px-8">Next</Button>
            ) : (
              <Button 
                onClick={handleCreateEvent} 
                className="rounded-xl bg-primary text-white px-8" 
                disabled={isCreatingEvent}
              >
                {isCreatingEvent ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Event
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
