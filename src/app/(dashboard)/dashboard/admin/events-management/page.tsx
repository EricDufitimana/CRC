"use client";

import { useState, useEffect, useActionState, useTransition, startTransition } from "react";
import { Button } from "../../../../../../zenith/src/components/ui/button";
import { Input } from "../../../../../../zenith/src/components/ui/input";
import { Label } from "../../../../../../zenith/src/components/ui/label";
import { Textarea } from "../../../../../../zenith/src/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../../zenith/src/components/ui/card";
import { Badge } from "../../../../../../zenith/src/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../zenith/src/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../../../zenith/src/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../../zenith/src/components/ui/select";
import { Plus, Edit, Trash2, Calendar, MapPin, Users, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import { FileUpload } from "../../../../../../zenith/src/components/ui/file-upload";
import MDEditor from '@uiw/react-md-editor';
import { addEvent, updateEvent, deleteEvent, fetchEventsByType } from "@/lib/action";
import { showToastSuccess, showToastError, showToastPromise } from "@/components/toasts";

import { Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

type SanityEvent = {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  type: "previous_events" | "upcoming_events";
  event_organizer?: {
    name: string;
    role: string;
    image?: string;
  };
  gallery?: Array<{
    _key: string;
    _type: "image";
    asset: {
      _id: string;
      url: string;
    };
    isHero?: boolean;
  }>;
  _createdAt?: string;
};

const categories = [
  { id: "previous-events", label: "Previous Events", icon: Calendar, color: "bg-orange-100 text-orange-900 border-orange-200" },
  { id: "upcoming-events", label: "Upcoming Events", icon: Calendar, color: "bg-orange-100 text-orange-900 border-orange-200" },
];

const eventCategories = [
  "conference",
  "seminar", 
  "workshop",
  "webinar",
  "training",
  "other"
];

// Validation schema for events
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

export default function EventsManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get category from URL params or default to previous-events
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const categoryFromUrl = searchParams?.get('category');
    return categoryFromUrl || "previous-events";
  });
  const [events, setEvents] = useState<SanityEvent[]>([]);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [eventIdToDelete, setEventIdToDelete] = useState<string | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<SanityEvent | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    type: "previous_events",
    event_organizer_name: "",
    event_organizer_role: "",
    event_organizer_image: "",
  });

  // Edit image upload states
  const [editSelectedImages, setEditSelectedImages] = useState<File[]>([]);
  const [editImagePreviewUrls, setEditImagePreviewUrls] = useState<string[]>([]);
  const [editCurrentStep, setEditCurrentStep] = useState(1);
  const [editExistingImages, setEditExistingImages] = useState<Array<{
    _key: string;
    _type: "image";
    asset: {
      _id: string;
      url: string;
    };
    isHero?: boolean;
  }>>([]);



  // Form state for description
  const [form, setForm] = useState({
    description: ""
  });

  // Image upload states
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  // Form error states
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
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

  const [selectedHeroImage, setSelectedHeroImage] = useState<number>(0);
  const [editSelectedHeroImage, setEditSelectedHeroImage] = useState<number>(0);

  // Zod validation states
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [editValidationErrors, setEditValidationErrors] = useState<Record<string, string>>({});
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  // Manage body scroll when dialogs are open
  useEffect(() => {
    if (isAddEventOpen || editDialogOpen || deleteConfirmationOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAddEventOpen, editDialogOpen, deleteConfirmationOpen]);

  // Image compression function
  async function compressImage(file: File) {
    if(!file) return null;
    try{
      console.log(`🔧 Compressing image: ${file.name} (${file.size} bytes)`);
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      console.log(`✅ Compression complete: ${file.name} - ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
      return compressedFile;
    } catch (error) {
      console.error(`❌ Compression failed for ${file.name}:`, error);
      return null;
    }
  }



  // Form submission handler for useActionState
  const handleEventSubmission = async (prevState: any, formData: FormData) => {
    console.log("🚀 Event submission started");
    console.log("📦 Selected images count:", selectedImages.length);
    console.log("🎯 Hero image index:", selectedHeroImage);
    console.log("🎯 Hero image index type:", typeof selectedHeroImage);
    
    try {
      // Validate form data before submission
      const formValue = {
        title: formData.get("title") as string,
        description: form.description,
        date: formData.get("date") as string,
        location: formData.get("location") as string,
        category: formData.get("category") as string,
        type: formData.get("type") as string,
        event_organizer_name: formData.get("event_organizer_name") as string,
        event_organizer_role: formData.get("event_organizer_role") as string,
        event_organizer_image: formData.get("event_organizer_image") as string,
      };
      
      console.log("🔍 Form values for validation:", formValue);
      
      await eventSchema.parseAsync(formValue);
      console.log("✅ Validation passed");
      
      // Add images if any are selected
      if (selectedImages.length > 0) {
        console.log("📤 Adding images to FormData...");
        selectedImages.forEach((file, index) => {
          console.log(`📤 Adding image ${index + 1}: ${file.name} (${file.size} bytes)`);
          formData.append('images', file);
        });
      }
      
      // Add hero image index
      console.log("🎯 Adding hero image index to FormData:", selectedHeroImage.toString());
      formData.append('heroImageIndex', selectedHeroImage.toString());
      
      console.log("📞 Calling addEvent server action...");
      let result;
      try {
        console.log("⏳ Starting server action call...");
        result = await addEvent(prevState, formData);
        console.log("📥 Server action result:", result);
        console.log("📥 Result status:", result?.status);
        console.log("📥 Result error:", result?.error);
      } catch (error) {
        console.error("💥 Server action error:", error);
        throw error;
      }
      
      if (result.status === "SUCCESS") {
        console.log("✅ Event added successfully");
        setIsAddEventOpen(false);
        
        // Reset form
        resetForm();
        
        // Refresh events
        fetchEvents(selectedCategory === "previous-events" ? "previous_events" : "upcoming_events");
      }
      
      return result;
    } catch (error) {
      console.error("💥 Error adding event:", error);
      
      // Handle validation errors
      if (error instanceof z.ZodError) {
        const validationErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            validationErrors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(validationErrors);
        
        return { status: "ERROR", error: "Validation failed" };
      }
      
      return { status: "ERROR", error: "Failed to add event. Please try again." };
    }
  };

  const [eventState, eventFormAction, isEventPending] = useActionState(handleEventSubmission, {
    status: "INITIAL",
    error: ""
  });

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    
    // Update preview URLs
    const newUrls = newImages.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(newUrls);
  };

  const handleEditImageUpload = (files: File[]) => {
    console.log("🖼️ Edit images selected:", files.length);
    setEditSelectedImages(files);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setEditImagePreviewUrls(urls);
  };

  const removeEditImage = (index: number) => {
    const newImages = editSelectedImages.filter((_, i) => i !== index);
    setEditSelectedImages(newImages);
    
    // Update preview URLs
    const newUrls = newImages.map(file => URL.createObjectURL(file));
    setEditImagePreviewUrls(newUrls);
  };

  const removeExistingImage = (key: string) => {
    console.log("🗑️ Removing existing image with key:", key);
    setEditExistingImages(prev => {
      const filtered = prev.filter(img => img._key !== key);
      console.log("🖼️ Remaining images after deletion:", filtered.length);
      return filtered;
    });
  };

  const setExistingImageAsHero = (key: string) => {
    console.log("👑 Setting image as hero with key:", key);
    setEditExistingImages(prev => {
      const updated = prev.map(img => ({
        ...img,
        isHero: img._key === key
      }));
      console.log("🖼️ Updated images with hero:", updated.map(img => ({ key: img._key, isHero: img.isHero })));
      return updated;
    });
  };

  const handleEditEventTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear images when switching event type
    setEditSelectedImages([]);
    setEditImagePreviewUrls([]);
    setEditSelectedHeroImage(0);
  };

  const handleDeleteClick = (eventId: string) => {
    setEventIdToDelete(eventId);
    setDeleteConfirmationOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventIdToDelete) return;
    
    setDeletingEventId(eventIdToDelete);
    
    const deletePromise = (async () => {
      try {
        const result = await deleteEvent(eventIdToDelete);
        if (result.status === "SUCCESS") {
          console.log("Event deleted successfully");
          await fetchEvents(selectedCategory);
          return { success: true };
        } else {
          throw new Error(result.error || "Failed to delete event");
        }
      } finally {
        setDeletingEventId(null);
        setDeleteConfirmationOpen(false);
        setEventIdToDelete(null);
      }
    })();

    showToastPromise({
      promise: deletePromise,
      loadingText: 'Deleting event...',
      successText: 'The event has been removed',
      successHeaderText: 'Event Deleted Successfully',
      errorText: 'We couldn\'t delete the event. Please try again or contact support.',
      errorHeaderText: 'Failed To Delete Event',
      direction: 'right'
    });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmationOpen(false);
    setEventIdToDelete(null);
  };

  const handleEditClick = (event: SanityEvent) => {
    console.log("🔧 ===== EDIT EVENT CLICKED =====");
    console.log("📋 Full Event Object:", event);
    console.log("🆔 Event ID:", event._id);
    console.log("📝 Event Type:", event.type);
    console.log("📅 Event Date:", event.date);
    console.log("📍 Event Location:", event.location);
    console.log("🏷️ Event Category:", event.category);
    console.log("📖 Event Title:", event.title);
    console.log("📄 Event Description:", event.description);
    console.log("👤 Event Organizer:", event.event_organizer);
    console.log("🖼️ Event Gallery:", event.gallery);
    console.log("📸 Gallery Length:", event.gallery?.length || 0);
    
    if (event.gallery && event.gallery.length > 0) {
      console.log("🖼️ Gallery Details:");
      event.gallery.forEach((img, index) => {
        console.log(`  Image ${index + 1}:`, {
          _key: img._key,
          _type: img._type,
          isHero: img.isHero,
          asset: img.asset
        });
      });
    }
    
    if (event.event_organizer) {
      console.log("👤 Organizer Details:", {
        name: event.event_organizer.name,
        role: event.event_organizer.role,
        image: event.event_organizer.image
      });
    }
    
    console.log("🔧 ===== SETTING EDIT FORM =====");
    // Use the actual event type from the database, fallback to determined type if not available
    const eventType = event.type || (selectedCategory === "previous-events" ? "previous_events" : "upcoming_events");
    console.log("🔧 Event type from database:", event.type);
    console.log("🔧 Using event type:", eventType);
    
    const editFormData = {
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      category: event.category,
      type: eventType, // Use actual type from database with fallback
      event_organizer_name: event.event_organizer?.name || "",
      event_organizer_role: event.event_organizer?.role || "",
      event_organizer_image: event.event_organizer?.image || "",
    };
    console.log("📝 Edit Form Data:", editFormData);
    
    setEventToEdit(event);
    setEditForm(editFormData);
    
    // Set existing images
    console.log("🖼️ Setting existing images:", event.gallery || []);
    setEditExistingImages(event.gallery || []);
    setEditSelectedImages([]);
    setEditImagePreviewUrls([]);
    setEditSelectedHeroImage(0);
    setEditCurrentStep(1);
    
    console.log("✅ Edit dialog opening...");
    setEditDialogOpen(true);
    console.log("🔧 ===== EDIT EVENT SETUP COMPLETE =====");
  };

  const handleEditSubmit = async () => {
    if (!eventToEdit) return;

    setIsUpdating(true);

    const updateEventPromise = (async () => {
      try {
        // Validate form data before submission
        const formValue = {
          title: editForm.title,
          description: editForm.description,
          date: editForm.date,
          location: editForm.location,
          category: editForm.category,
          type: editForm.type,
          event_organizer_name: editForm.event_organizer_name,
          event_organizer_role: editForm.event_organizer_role,
          event_organizer_image: editForm.event_organizer_image,
        };
        
        await eventSchema.parseAsync(formValue);
        
        // Create FormData for the update
        const formData = new FormData();
        
        // Add basic form fields
        formData.append('eventId', eventToEdit._id);
        formData.append('type', editForm.type);
        formData.append('category', editForm.category);
        formData.append('title', editForm.title);
        formData.append('description', editForm.description);
        formData.append('date', editForm.date);
        formData.append('location', editForm.location);
        formData.append('event_organizer_name', editForm.event_organizer_name);
        formData.append('event_organizer_role', editForm.event_organizer_role);
        formData.append('event_organizer_image', editForm.event_organizer_image);
        
        // Add existing images that weren't deleted
        // For upcoming events with new images, ignore existing images (replacement logic)
        if (editForm.type === "upcoming_events" && editSelectedImages.length > 0) {
          console.log("🔄 Upcoming event with new image: Implementing replacement logic");
          console.log("🗑️ Ignoring existing images - they will be replaced by new image");
          console.log("📤 Only new image will be sent to server");
        } else {
          // For previous events or when no new images, include existing images
          editExistingImages.forEach((img, index) => {
            formData.append('existingImages', JSON.stringify(img));
          });
        }
        
        // Add new images if any are selected
        if (editSelectedImages.length > 0) {
          editSelectedImages.forEach((file) => {
            formData.append('newImages', file);
          });
        }
        
        console.log("🔄 Update FormData created with:");
        console.log("📝 Basic fields:", {
          eventId: eventToEdit._id,
          type: editForm.type,
          category: editForm.category,
          title: editForm.title,
          description: editForm.description,
          date: editForm.date,
          location: editForm.location
        });
        console.log("🖼️ Existing images count:", editExistingImages.length);
        console.log("🖼️ New images count:", editSelectedImages.length);
        
        // Call the updateEvent server action with FormData
        const result = await updateEvent(formData);
        if (result.status === "SUCCESS") {
          setEditDialogOpen(false);
          setEventToEdit(null);
          fetchEvents(selectedCategory);
          return { success: true };
        } else {
          throw new Error(result.error || "Failed to update event");
        }
      } catch (error) {
        // Handle validation errors
        if (error instanceof z.ZodError) {
          const validationErrors: Record<string, string> = {};
          error.errors.forEach((err) => {
            if (err.path) {
              validationErrors[err.path[0] as string] = err.message;
            }
          });
          setEditValidationErrors(validationErrors);
          
          showToastError({
            headerText: "Validation Error",
            paragraphText: "Please check the form fields and try again.",
            direction: "right"
          });
          
          throw new Error("Validation failed");
        }
        
        throw error;
      } finally {
        setIsUpdating(false);
      }
    })();

    showToastPromise({
      promise: updateEventPromise,
      loadingText: 'Updating event...',
      successText: 'The event has been updated successfully',
      successHeaderText: 'Event Updated Successfully',
      errorText: 'We couldn\'t update the event. Please try again or contact support.',
      errorHeaderText: 'Failed To Update Event',
      direction: 'right'
    });
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEventToEdit(null);
    setEditCurrentStep(1);
    setEditValidationErrors({});
  };

  const handleEditNextStep = () => {
    if (editCurrentStep === 1) {
      // Validate step 1 fields
      if (!editForm.type || !editForm.category || !editForm.title || !editForm.description || !editForm.date || !editForm.location) {
        setFormError("Please fill in all required fields before proceeding.");
        return;
      }
      setFormError("");
      setEditCurrentStep(2);
    }
  };

  const handleEditPrevStep = () => {
    if (editCurrentStep === 2) {
      setEditCurrentStep(1);
    }
  };

  // Step navigation functions
  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate step 1 fields
      if (!formData.type || !formData.category || !formData.title || !form.description || !formData.date || !formData.location) {
        setFormError("Please fill in all required fields before proceeding.");
        return;
      }
      setFormError("");
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleFormDataChange = (field: string, value: string) => {
    // Update form data
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // If switching to upcoming events (single image), clear existing images
    if (field === 'type' && value === 'upcoming_events' && selectedImages.length > 1) {
      setSelectedImages(selectedImages.slice(0, 1));
      setImagePreviewUrls(imagePreviewUrls.slice(0, 1));
      setSelectedHeroImage(0);
    }
  };

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
    setForm({ description: "" });
    setSelectedImages([]);
    setImagePreviewUrls([]);
    setSelectedHeroImage(0);
    setFormError("");
    setValidationErrors({});
    setEditValidationErrors({});
  };

  const handleCreateEvent = () => {
    console.log("🚀 handleCreateEvent called");
    console.log("📝 Form data:", formData);
    console.log("📄 Form description:", form.description);
    console.log("🖼️ Selected images:", selectedImages.length);
    console.log("🎯 Selected hero image:", selectedHeroImage);
    
    // Create FormData with all the form values
    const formDataToSubmit = new FormData();
    formDataToSubmit.append('type', formData.type);
    formDataToSubmit.append('category', formData.category);
    formDataToSubmit.append('title', formData.title);
    formDataToSubmit.append('description', form.description);
    formDataToSubmit.append('date', formData.date);
    formDataToSubmit.append('location', formData.location);
    formDataToSubmit.append('event_organizer_name', formData.event_organizer_name);
    formDataToSubmit.append('event_organizer_role', formData.event_organizer_role);
    formDataToSubmit.append('event_organizer_image', formData.event_organizer_image);
    formDataToSubmit.append('heroImageIndex', selectedHeroImage.toString());
    
    // Add images if any are selected
    if (selectedImages.length > 0) {
      selectedImages.forEach((file) => {
        formDataToSubmit.append('images', file);
      });
    }
    
    console.log("📤 FormData created, calling addEvent directly...");
    
    // Set loading state
    setIsCreatingEvent(true);
    
    // Create a promise that calls the addEvent server action directly
    const createEventPromise = (async () => {
      try {
        // Validate form data before submission
        const formValue = {
          title: formDataToSubmit.get("title") as string,
          description: form.description,
          date: formDataToSubmit.get("date") as string,
          location: formDataToSubmit.get("location") as string,
          category: formDataToSubmit.get("category") as string,
          type: formDataToSubmit.get("type") as string,
          event_organizer_name: formDataToSubmit.get("event_organizer_name") as string,
          event_organizer_role: formDataToSubmit.get("event_organizer_role") as string,
          event_organizer_image: formDataToSubmit.get("event_organizer_image") as string,
        };
        
        console.log("🔍 Form values for validation:", formValue);
        
        await eventSchema.parseAsync(formValue);
        console.log("✅ Validation passed");
        
        // Add images if any are selected
        if (selectedImages.length > 0) {
          console.log("📤 Adding images to FormData...");
          selectedImages.forEach((file, index) => {
            console.log(`📤 Adding image ${index + 1}: ${file.name} (${file.size} bytes)`);
            formDataToSubmit.append('images', file);
          });
        }
        
        // Add hero image index
        console.log("🎯 Adding hero image index to FormData:", selectedHeroImage.toString());
        formDataToSubmit.append('heroImageIndex', selectedHeroImage.toString());
        
        console.log("📞 Calling addEvent server action...");
        const result = await addEvent({}, formDataToSubmit);
        console.log("📥 Server action result:", result);
        
        if (result.status === "SUCCESS") {
          console.log("✅ Event added successfully");
          setIsAddEventOpen(false);
          
          // Reset form
          resetForm();
          
          // Refresh events silently to avoid loading state flash
          fetchEvents(selectedCategory === "previous-events" ? "previous_events" : "upcoming_events", false);
          
          return { success: true };
        } else {
          throw new Error(result.error || "Failed to add event");
        }
      } catch (error) {
        console.error("💥 Error adding event:", error);
        
        // Handle validation errors
        if (error instanceof z.ZodError) {
          const validationErrors: Record<string, string> = {};
          error.errors.forEach((err) => {
            if (err.path) {
              validationErrors[err.path[0] as string] = err.message;
            }
          });
          setValidationErrors(validationErrors);
          throw new Error("Validation failed. Please check the form fields.");
        }
        
        throw error;
      }
    })();

    // Use showToastPromise to show loading, success, and error toasts
    showToastPromise({
      promise: createEventPromise
        .then((result) => {
          setIsCreatingEvent(false);
          return result;
        })
        .catch((error) => {
          setIsCreatingEvent(false);
          throw error;
        }),
      loadingText: 'Creating event...',
      successText: 'The event has been created successfully',
      successHeaderText: 'Event Created Successfully',
      errorText: 'We couldn\'t create the event. Please try again or contact support.',
      errorHeaderText: 'Failed To Create Event',
      direction: 'right'
    });
  };

  const fetchEvents = async (type: string, showLoadingState: boolean = true) => {
    if (showLoadingState) {
      setLoading(true);
    }
    try {
      // Convert category format to event type format
      const eventType = type === "previous-events" ? "previous_events" : "upcoming_events";
      
      console.log(`🔄 fetchEvents called with type: "${type}" at ${new Date().toISOString()}`);
      console.log(`🔄 Converted to eventType: "${eventType}"`);
      console.log(`🔄 Fetching ${eventType} using sanityFetch...`);
      const result = await fetchEventsByType(eventType);
      
      if (result.status === "SUCCESS") {
        console.log(`✅ Fetched ${eventType}:`, result.data);
        setEvents(result.data || []);
      } else {
        console.error(`❌ Error fetching ${eventType}:`, result.error);
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  };

  // Update URL when category changes
  const updateCategoryInUrl = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', category);
    router.push(`?${params.toString()}`);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateCategoryInUrl(category);
  };

  // Fetch data when category changes
  useEffect(() => {
    fetchEvents(selectedCategory);
  }, [selectedCategory]);

  // Force refresh data when component mounts or when add event dialog closes
  useEffect(() => {
    if (!isAddEventOpen) {
      // Small delay to ensure server action has completed
      const timer = setTimeout(() => {
        // Silent refresh to avoid loading state flash
        fetchEvents(selectedCategory, false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAddEventOpen, selectedCategory]);

  // Monitor eventState changes for form submission results
  useEffect(() => {
    console.log("🔄 eventState changed:", eventState);
    if (eventState.status === "SUCCESS") {
      console.log("✅ Event form submission successful:", eventState);
      // Toast is handled by showToastPromise
    } else if (eventState.status === "ERROR") {
      console.log("❌ Event form submission failed:", eventState.error);
      // Toast is handled by showToastPromise
    }
  }, [eventState]);

  // Debug editForm changes
  useEffect(() => {
    if (editDialogOpen) {
      console.log("🔍 ===== EDIT FORM STATE UPDATE =====");
      console.log("📝 Current Edit Form State:", editForm);
      console.log("🆔 Event Type:", editForm.type);
      console.log("🏷️ Category:", editForm.category);
      console.log("📖 Title:", editForm.title);
      console.log("📄 Description:", editForm.description);
      console.log("📅 Date:", editForm.date);
      console.log("📍 Location:", editForm.location);
      console.log("👤 Organizer Name:", editForm.event_organizer_name);
      console.log("👤 Organizer Role:", editForm.event_organizer_role);
      console.log("🖼️ Organizer Image:", editForm.event_organizer_image);
      console.log("🖼️ Existing Images Count:", editExistingImages.length);
      console.log("🖼️ Selected Images Count:", editSelectedImages.length);
      console.log("🎯 Selected Hero Image Index:", editSelectedHeroImage);
      console.log("🔧 ===== EDIT FORM STATE END =====");
    }
  }, [editForm, editDialogOpen, editExistingImages.length, editSelectedImages.length, editSelectedHeroImage]);

  const getCategoryColor = (category: string) => {
    const colors = {
      conference: "bg-blue-100 text-blue-800",
      seminar: "bg-green-100 text-green-800", 
      workshop: "bg-purple-100 text-purple-800",
      webinar: "bg-orange-100 text-orange-800",
      training: "bg-red-100 text-red-800",
      other: "bg-gray-100 text-gray-800"
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getEventImage = (event: SanityEvent) => {
    try {
      // Check for hero image first
      const heroImage = event.gallery?.find(img => img.isHero)?.asset;
      if (heroImage) {
        if (heroImage.url && heroImage.url.startsWith('http')) {
          return heroImage.url;
        }
        return urlFor(heroImage).url();
      }

      // Check for first gallery image
      const firstImage = event.gallery?.[0]?.asset;
      if (firstImage) {
        if (firstImage.url && firstImage.url.startsWith('http')) {
          return firstImage.url;
        }
        return urlFor(firstImage).url();
      }

      // Check for main event image
      if (event.event_organizer?.image) {
        return event.event_organizer.image;
      }

      return null;
    } catch (error) {
      console.error('Error processing event image:', error);
      return null;
    }
  };

  return (
    <div className="p-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold font-cal-sans text-gray-800 mb-3">Events Management</h1>
          <p className="text-md text-gray-600">
            Manage previous and upcoming events across the platform
          </p>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-5 gap-6">
          {/* Left Sidebar - Category Selector (20% width) */}
          <div className="col-span-1 space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Event Types</h3>
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 font-medium ${
                      selectedCategory === category.id
                        ? "bg-orange-100 text-orange-700 shadow-none"
                        : "text-gray-700 hover:bg-gray-100 "
                    }`}
                  >
                    <IconComponent className={`h-4 w-4 ${selectedCategory === category.id ? "text-orange-700" : "text-gray-500"}`} />
                    {category.label}
                   
                  </button>
                );
              })}
            </div>

            {/* Add Event Button */}
            <div className="space-y-2 pt-4">
              <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full bg-orange-500 hover:bg-orange-600 text-white hover:text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                    <DialogDescription>
                      Create a new event for the platform
                    </DialogDescription>
                  </DialogHeader>
                  
                  {/* Step Indicator */}
                  <div className="flex items-center justify-center ">
                    <div className="flex items-center space-x-4">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        currentStep >= 1 ? 'bg-orange-500 border-orange-500 text-white' : 'bg-gray-100 border-gray-300 text-gray-500'
                      }`}>
                        <span className="text-sm font-medium">1</span>
                      </div>
                      <div className={`w-16 h-0.5 ${
                        currentStep >= 2 ? 'bg-orange-500' : 'bg-gray-300'
                      }`}></div>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        currentStep >= 2 ? 'bg-orange-500 border-orange-500 text-white' : 'bg-gray-100 border-gray-300 text-gray-500'
                      }`}>
                        <span className="text-sm font-medium">2</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto px-2">
                    {formError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{formError}</p>
                      </div>
                    )}
                    
                    {currentStep === 1 ? (
                      /* Step 1: Basic Event Information */
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium mb-1 block">Event Type</Label>
                            <Select 
                              value={formData.type} 
                              onValueChange={(value) => handleFormDataChange('type', value)}
                            >
                              <SelectTrigger className={`w-full rounded-xl ${validationErrors.type ? 'border-red-300 focus:border-red-500' : ''}`}>
                                <SelectValue placeholder="Select event type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="previous_events">Previous Events</SelectItem>
                                <SelectItem value="upcoming_events">Upcoming Events</SelectItem>
                              </SelectContent>
                            </Select>
                            {validationErrors.type && (
                              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                {validationErrors.type}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium mb-1 block">Category</Label>
                            <Select 
                              value={formData.category} 
                              onValueChange={(value) => handleFormDataChange('category', value)}
                            >
                              <SelectTrigger className={`w-full rounded-xl ${validationErrors.category ? 'border-red-300 focus:border-red-500' : ''}`}>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {eventCategories.map(cat => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {validationErrors.category && (
                              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                {validationErrors.category}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium mb-1 block">Event Title</Label>
                          <Input
                            value={formData.title}
                            onChange={(e) => handleFormDataChange('title', e.target.value)}
                            placeholder="Enter event title"
                            className={`rounded-xl ${validationErrors.title ? 'border-red-300 focus:border-red-500' : ''}`}
                            maxLength={60}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {60 - formData.title.length} characters left
                          </p>
                          {validationErrors.title && (
                            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              {validationErrors.title}
                            </p>
                          )}
                        </div>
                        
                        <div data-color-mode="light">
                          <Label className="text-sm font-medium mb-1 block">Description</Label>
                          <MDEditor 
                            value={form.description} 
                            onChange={(value) => {
                              const newValue = value || "";
                              if (newValue.length <= 460) {
                                setForm(prev => ({ ...prev, description: newValue }));
                                
                                // Clear validation error for description when user starts typing
                                if (validationErrors.description) {
                                  setValidationErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors.description;
                                    return newErrors;
                                  });
                                }
                              }
                            }}
                            preview="live"
                            height={200}
                            textareaProps={{
                              placeholder: "Enter event description with markdown support...",
                              className: `rounded-xl ${validationErrors.description ? 'border-red-300 focus:border-red-500' : ''}`,
                              maxLength: 460
                            }}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {460 - form.description.length} characters left
                          </p>
                          {validationErrors.description && (
                            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              {validationErrors.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium mb-1 block">Date</Label>
                            <Input
                              value={formData.date}
                              onChange={(e) => handleFormDataChange('date', e.target.value)}
                              type="date"
                              className={`rounded-xl ${validationErrors.date ? 'border-red-300 focus:border-red-500' : ''}`}
                            />
                            {validationErrors.date && (
                              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                {validationErrors.date}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium mb-1 block">Location</Label>
                            <Input
                              value={formData.location}
                              onChange={(e) => handleFormDataChange('location', e.target.value)}
                              placeholder="Enter event location"
                              className={`rounded-xl ${validationErrors.location ? 'border-red-300 focus:border-red-500' : ''}`}
                            />
                            {validationErrors.location && (
                              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                {validationErrors.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Step 2: Event Organizer Information */
                      <div className="space-y-4">
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">Event Organizer Details</h3>
                          <p className="text-sm text-gray-600">Add information about the event organizer</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium mb-1 block">Organizer Name</Label>
                            <Input
                              value={formData.event_organizer_name}
                              onChange={(e) => handleFormDataChange('event_organizer_name', e.target.value)}
                              placeholder="Enter organizer name"
                              className="rounded-xl"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium mb-1 block">Organizer Role</Label>
                            <Input
                              value={formData.event_organizer_role}
                              onChange={(e) => handleFormDataChange('event_organizer_role', e.target.value)}
                              placeholder="Enter organizer role"
                              className="rounded-xl"
                            />
                          </div>
                        </div>
                        
                                                 <div>
                           <Label className="text-sm font-medium mb-1 block">Organizer Image</Label>
                           <Input
                             value={formData.event_organizer_image}
                             onChange={(e) => handleFormDataChange('event_organizer_image', e.target.value)}
                             placeholder="Enter image URL"
                             className={`rounded-xl ${validationErrors.event_organizer_image ? 'border-red-300 focus:border-red-500' : ''}`}
                           />
                           {validationErrors.event_organizer_image && (
                             <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                               <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                               </svg>
                               {validationErrors.event_organizer_image}
                             </p>
                           )}
                         </div>

                         {/* Event Images Section */}
                         <div className="space-y-4">
                           <div>
                             <Label className="text-sm font-medium mb-1 block">
                               Event Images
                             </Label>
                             <p className="text-xs text-gray-500 mb-3">
                               {formData.type === "upcoming_events" 
                                 ? "Upload one image for your upcoming event." 
                                 : "Upload images for your event. You can select one as the hero image."
                               }
                             </p>
                           </div>
                           
                           <FileUpload
                             multiple={formData.type === "previous_events"}
                             accept="image/*"
                             maxFiles={formData.type === "upcoming_events" ? 1 : 10}
                             value={selectedImages}
                             onChange={async (fileList) => {
                               console.log("🖼️ Images selected:", fileList?.length || 0);
                               
                               // For upcoming events, only allow one image
                               if (formData.type === "upcoming_events" && fileList && fileList.length > 1) {
                                 console.log("⚠️ Upcoming events only allow one image, limiting to first image");
                                 fileList = fileList.slice(0, 1);
                               }
                               
                               if (fileList && fileList.length > 0) {
                                 console.log("🔄 Starting image compression process...");
                                 const compressedFiles: File[] = [];
                                 
                                 for (let i = 0; i < fileList.length; i++) {
                                   const file = fileList[i];
                                   console.log(`📸 Processing image ${i + 1}/${fileList.length}:`, {
                                     name: file.name,
                                     size: file.size,
                                     type: file.type
                                   });
                                   
                                   try {
                                     const compressedFile = await compressImage(file);
                                     if (compressedFile) {
                                       compressedFiles.push(compressedFile);
                                       console.log(`✅ Image ${i + 1} compressed successfully`);
                                     } else {
                                       console.error(`❌ Failed to compress image: ${file.name}`);
                                       compressedFiles.push(file);
                                     }
                                   } catch (error) {
                                     console.error(`❌ Error compressing image ${i + 1}:`, error);
                                     compressedFiles.push(file);
                                   }
                                 }
                                 
                                 console.log("📦 Final compressed files count:", compressedFiles.length);
                                 setSelectedImages(compressedFiles);
                                 
                                 // Create preview URLs from compressed files
                                 const urls = compressedFiles.map(file => URL.createObjectURL(file));
                                 console.log("🖼️ Created preview URLs count:", urls.length);
                                 setImagePreviewUrls(urls);
                                 
                                 // Set first image as default hero
                                 if (compressedFiles.length > 0) {
                                   setSelectedHeroImage(0);
                                 }
                                 
                                 console.log("✅ All images compressed and ready for upload");
                               } else {
                                 console.log("📭 No files received, clearing images");
                                 setSelectedImages([]);
                                 setImagePreviewUrls([]);
                               }
                             }}
                             onRemove={removeImage}
                             placeholder={formData.type === "upcoming_events" ? "Drop one image here or click to upload" : "Drop multiple images here or click to upload"}
                             helperText={formData.type === "upcoming_events" ? "Only one image allowed for upcoming events" : "Upload up to 10 images for your event. You can select one as the hero image."}
                           />
                           
                           {/* Image Previews */}
                           {imagePreviewUrls.length > 0 && (
                             <div className="space-y-3">
                               <Label className="text-sm font-medium">Image Previews</Label>
                               <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
                                 {imagePreviewUrls.map((url, index) => (
                                   <div key={index} className="relative group">
                                     <div className="relative h-32 w-full rounded-lg overflow-hidden border">
                                       <Image
                                         src={url}
                                         alt={`Preview ${index + 1}`}
                                         fill
                                         className="object-cover"
                                       />
                                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                     </div>
                                     <div className="mt-2 flex items-center gap-2">
                                       <input
                                         type="radio"
                                         name="heroImage"
                                         id={`hero-${index}`}
                                         value={index}
                                         checked={selectedHeroImage === index}
                                         onChange={(e) => setSelectedHeroImage(Number(e.target.value))}
                                         className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                                       />
                                       <Label htmlFor={`hero-${index}`} className="text-xs text-gray-600 cursor-pointer">
                                         Set as hero image
                                       </Label>
                                     </div>
                                   </div>
                                 ))}
                               </div>
                             </div>
                           )}
                         </div>
                      </div>
                    )}
                    
                    {/* Step Navigation */}
                    <div className="flex justify-between pt-6">
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => setIsAddEventOpen(false)}
                        className="rounded-xl"
                      >
                        Cancel
                      </Button>
                      
                      <div className="flex space-x-2">
                        {currentStep === 2 && (
                          <Button 
                            type="button"
                            variant="outline" 
                            onClick={handlePrevStep}
                            className="rounded-xl"
                          >
                            Previous
                          </Button>
                        )}
                        
                        {currentStep === 1 ? (
                          <Button 
                            type="button"
                            onClick={handleNextStep}
                            className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200"
                          >
                            Next
                          </Button>
                                                 ) : (
                           <Button 
                             type="button"
                             onClick={() => {
                               console.log("🔘 Create Event button clicked");
                               handleCreateEvent();
                             }}
                             disabled={isCreatingEvent}
                             className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200"
                           >
                             {isCreatingEvent ? (
                               <>
                                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                 Creating Event...
                               </>
                             ) : (
                               'Create Event'
                             )}
                           </Button>
                         )}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Right Content Area (80% width) */}
          <div className="col-span-4">
            {loading ? (
              <div className="space-y-6">
             
                
                {/* Events Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full flex flex-col animate-pulse">
                      {/* Image Skeleton */}
                      <div className="h-48 bg-gray-200 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-300 via-transparent to-transparent"></div>
                      </div>
                      
                      {/* Content Skeleton */}
                      <div className="p-4 space-y-3 flex-1">
                        {/* Badge and Actions Skeleton */}
                        <div className="flex items-start justify-between">
                          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                          <div className="flex items-center gap-1">
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        
                        {/* Title Skeleton */}
                        <div className="space-y-2">
                          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        
                        {/* Description Skeleton */}
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                        </div>
                        
                        {/* Date and Location Skeleton */}
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Events Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {events.map((event) => {
                     const eventImage = getEventImage(event);
                     return (
                       <Card key={event._id} className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full flex flex-col">
                         {/* Event Image */}
                         {eventImage && (
                           <div className="relative h-48 w-full overflow-hidden">
                             <Image
                               src={eventImage}
                               alt={event.title}
                               fill
                               className="object-cover transition-transform duration-300 group-hover:scale-105"
                               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                           </div>
                         )}
                         
                         <CardHeader className="pb-3 flex-shrink-0">
                           <div className="flex items-start justify-between">
                             <Badge className={getCategoryColor(event.category)}>
                               {event.category}
                             </Badge>
                             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => handleEditClick(event)}
                                 className="h-8 w-8 p-0"
                               >
                                 <Edit className="h-4 w-4" />
                               </Button>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => handleDeleteClick(event._id)}
                                 className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             </div>
                           </div>
                           <CardTitle className="text-lg font-semibold line-clamp-2 min-h-[3.5rem]">
                             {event.title}
                           </CardTitle>
                         </CardHeader>
                         <CardContent className="space-y-3 flex-1 flex flex-col">
                           <p className="text-sm text-gray-600 line-clamp-3 flex-1">
                             {event.description}
                           </p>
                           <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mt-auto">
                             <div className="flex items-center gap-2">
                               <Calendar className="h-4 w-4" />
                               <span className="truncate">{format(new Date(event.date), "MMM d, yyyy")}</span>
                             </div>
                             <div className="flex items-center gap-2">
                               <MapPin className="h-4 w-4" />
                               <span className="truncate">{event.location}</span>
                             </div>
                             {event.event_organizer && (
                               <div className="flex items-center gap-2">
                                 <Users className="h-4 w-4" />
                                 <span className="truncate">{event.event_organizer.name}</span>
                               </div>
                             )}
                             {event.gallery && event.gallery.length > 0 && (
                               <div className="flex items-center gap-2">
                                 <ImageIcon className="h-4 w-4" />
                                 <span>{event.gallery.length} image{event.gallery.length !== 1 ? 's' : ''}</span>
                               </div>
                             )}
                           </div>
                         </CardContent>
                       </Card>
                     );
                   })}
                 </div>

                {events.length === 0 && (
                  <div className="text-center py-16">
                    {/* Stylish illustration */}
                    <div className="relative mb-8">
                      <div className="w-32 h-32 mx-auto relative">
                        {/* Background circle */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full opacity-60"></div>
                        
                        {/* Calendar icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Calendar className="h-16 w-16 text-orange-600" />
                        </div>
                        
                        {/* Decorative elements */}
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-300 rounded-full opacity-40"></div>
                        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-orange-400 rounded-full opacity-60"></div>
                        <div className="absolute top-1/2 -right-6 w-3 h-3 bg-orange-200 rounded-full opacity-80"></div>
                        <div className="absolute top-1/2 -left-6 w-2 h-2 bg-orange-300 rounded-full opacity-50"></div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="max-w-md mx-auto">
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        No {selectedCategory === "previous-events" ? "Previous" : "Upcoming"} Events
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {selectedCategory === "previous-events" 
                          ? "Your event history is waiting to be written. Start by adding your first past event to showcase CRC's journey."
                          : "The stage is set for your next great event. Create your first upcoming event and start building excitement."
                        }
                      </p>
                      
                      {/* Decorative line */}
                      
                      {/* Stats or tips */}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update event information
            </DialogDescription>
          </DialogHeader>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                editCurrentStep >= 1 ? 'bg-orange-500 border-orange-500 text-white' : 'bg-gray-100 border-gray-300 text-gray-500'
              }`}>
                <span className="text-sm font-medium">1</span>
              </div>
              <div className={`w-16 h-0.5 ${
                editCurrentStep >= 2 ? 'bg-orange-500' : 'bg-gray-300'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                editCurrentStep >= 2 ? 'bg-orange-500 border-orange-500 text-white' : 'bg-gray-100 border-gray-300 text-gray-500'
              }`}>
                <span className="text-sm font-medium">2</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-2">
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{formError}</p>
              </div>
            )}
            
            {editCurrentStep === 1 ? (
              /* Step 1: Basic Event Information */
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-1 block">Event Type</Label>
                    <Select 
                      value={editForm.type} 
                      onValueChange={(value) => {
                        console.log("🔄 Select value changed to:", value);
                        setEditForm(prev => ({ ...prev, type: value }));
                        
                        // Clear validation error for type when user selects
                        if (editValidationErrors.type) {
                          setEditValidationErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.type;
                            return newErrors;
                          });
                        }
                      }}
                    >
                      <SelectTrigger className={`w-full rounded-xl ${editValidationErrors.type ? 'border-red-300 focus:border-red-500' : ''}`}>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="previous_events">Previous Events</SelectItem>
                        <SelectItem value="upcoming_events">Upcoming Events</SelectItem>
                      </SelectContent>
                    </Select>
                    {editValidationErrors.type && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {editValidationErrors.type}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1 block">Category</Label>
                    <Select 
                      value={editForm.category} 
                      onValueChange={(value) => {
                        setEditForm(prev => ({ ...prev, category: value }));
                        
                        // Clear validation error for category when user selects
                        if (editValidationErrors.category) {
                          setEditValidationErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.category;
                            return newErrors;
                          });
                        }
                      }}
                    >
                      <SelectTrigger className={`w-full rounded-xl ${editValidationErrors.category ? 'border-red-300 focus:border-red-500' : ''}`}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {editValidationErrors.category && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {editValidationErrors.category}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-1 block">Event Title</Label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 60) {
                        setEditForm(prev => ({ ...prev, title: value }));
                        
                        // Clear validation error for title when user starts typing
                        if (editValidationErrors.title) {
                          setEditValidationErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.title;
                            return newErrors;
                          });
                        }
                      }
                    }}
                    placeholder="Enter event title"
                    className={`rounded-xl ${editValidationErrors.title ? 'border-red-300 focus:border-red-500' : ''}`}
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {60 - editForm.title.length} characters left
                  </p>
                  {editValidationErrors.title && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      {editValidationErrors.title}
                    </p>
                  )}
                </div>
                
                <div data-color-mode="light">
                  <Label className="text-sm font-medium mb-1 block">Description</Label>
                  <MDEditor 
                    value={editForm.description} 
                    onChange={(value) => {
                      const newValue = value || "";
                      if (newValue.length <= 460) {
                        setEditForm(prev => ({ ...prev, description: newValue }));
                        
                        // Clear validation error for description when user starts typing
                        if (editValidationErrors.description) {
                          setEditValidationErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.description;
                            return newErrors;
                          });
                        }
                      }
                    }}
                    preview="live"
                    height={200}
                    textareaProps={{
                      placeholder: "Enter event description with markdown support...",
                      className: `rounded-xl ${editValidationErrors.description ? 'border-red-300 focus:border-red-500' : ''}`,
                      maxLength: 460
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {460 - editForm.description.length} characters left
                  </p>
                  {editValidationErrors.description && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      {editValidationErrors.description}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-1 block">Date</Label>
                    <Input
                      value={editForm.date}
                      onChange={(e) => {
                        setEditForm(prev => ({ ...prev, date: e.target.value }));
                        
                        // Clear validation error for date when user starts typing
                        if (editValidationErrors.date) {
                          setEditValidationErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.date;
                            return newErrors;
                          });
                        }
                      }}
                      type="date"
                      className={`rounded-xl ${editValidationErrors.date ? 'border-red-300 focus:border-red-500' : ''}`}
                    />
                    {editValidationErrors.date && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {editValidationErrors.date}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1 block">Location</Label>
                    <Input
                      value={editForm.location}
                      onChange={(e) => {
                        setEditForm(prev => ({ ...prev, location: e.target.value }));
                        
                        // Clear validation error for location when user starts typing
                        if (editValidationErrors.location) {
                          setEditValidationErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.location;
                            return newErrors;
                          });
                        }
                      }}
                      placeholder="Enter event location"
                      className={`rounded-xl ${editValidationErrors.location ? 'border-red-300 focus:border-red-500' : ''}`}
                    />
                    {editValidationErrors.location && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {editValidationErrors.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Step 2: Event Organizer Information and Images */
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Event Organizer Details</h3>
                  <p className="text-sm text-gray-600">Update information about the event organizer</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-1 block">Organizer Name</Label>
                    <Input
                      value={editForm.event_organizer_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, event_organizer_name: e.target.value }))}
                      placeholder="Enter organizer name"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1 block">Organizer Role</Label>
                    <Input
                      value={editForm.event_organizer_role}
                      onChange={(e) => setEditForm(prev => ({ ...prev, event_organizer_role: e.target.value }))}
                      placeholder="Enter organizer role"
                      className="rounded-xl"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-1 block">Organizer Image</Label>
                  <Input
                    value={editForm.event_organizer_image}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditForm(prev => ({ ...prev, event_organizer_image: value }));
                      
                      // If the input is a URL, clear validation errors
                      setEditValidationErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.event_organizer_image;
                        return newErrors;
                      });
                    }}
                    placeholder="Enter image URL or upload image"
                    className={`rounded-xl ${editValidationErrors.event_organizer_image ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                  {editValidationErrors.event_organizer_image && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      {editValidationErrors.event_organizer_image}
                    </p>
                  )}
                </div>

                {/* Existing Images Section */}
                {editExistingImages.length > 0 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-1 block">
                        Existing Event Images
                      </Label>
                      <p className="text-xs text-gray-500 mb-3">
                        {editForm.type === "upcoming_events" 
                          ? "These images will be replaced when you upload a new one. Only one image is allowed for upcoming events."
                          : "Manage existing images. You can delete them or set one as the hero image."
                        }
                      </p>
                      
                      {/* Warning for upcoming events */}
                      
                    </div>
                    
                    <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
                      {editExistingImages.map((img, index) => (
                        <div key={img._key} className="relative group">
                          <div className="relative h-32 w-full rounded-lg overflow-hidden border">
                            <Image
                              src={
                                img.asset?.url 
                                  ? (img.asset.url.startsWith('http') ? img.asset.url : urlFor(img.asset).url())
                                  : urlFor(img.asset).url()
                              }
                              alt={`Event image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            
                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => removeExistingImage(img._key)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                          
                          <div className="mt-2 flex items-center gap-2">
                            {/* Only show hero image selection for previous events (multiple images) */}
                            {editForm.type === "previous_events" && (
                              <>
                                <input
                                  type="radio"
                                  name="existingHeroImage"
                                  id={`existing-hero-${img._key}`}
                                  checked={img.isHero}
                                  onChange={() => setExistingImageAsHero(img._key)}
                                  className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                                />
                                <Label htmlFor={`existing-hero-${img._key}`} className="text-xs text-gray-600 cursor-pointer">
                                  Set as hero image
                                </Label>
                              </>
                            )}
                            
                            {/* For upcoming events, show a simple label indicating this is the main image */}
                            {editForm.type === "upcoming_events" && (
                              <span className="text-xs text-gray-500 font-medium">
                                Main event image
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images Section */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-1 block">
                      Add New Event Images
                    </Label>
                    <p className="text-xs text-gray-500 mb-3">
                      {editForm.type === "upcoming_events" 
                        ? "Upload a new image to replace the current one. You can see both images until you click Update Event to commit the change." 
                        : "Upload additional images for your event. You can select one as the hero image."
                      }
                    </p>
                  </div>
                  
                  <FileUpload
                    multiple={editForm.type === "previous_events"}
                    accept="image/*"
                    maxFiles={editForm.type === "upcoming_events" ? 1 : 10}
                    value={editSelectedImages}
                    onChange={async (fileList) => {
                      console.log("🖼️ Edit new images selected:", fileList?.length || 0);
                      
                      // For upcoming events, only allow one image and clear existing ones
                      if (editForm.type === "upcoming_events") {
                        if (fileList && fileList.length > 1) {
                          console.log("⚠️ Upcoming events only allow one image, limiting to first image");
                          fileList = fileList.slice(0, 1);
                        }
                        
                        // Don't clear existing images yet - let user see both old and new
                        // Replacement will happen when they click Update Event
                        if (fileList && fileList.length > 0) {
                          console.log("🔄 Upcoming event: New image uploaded, keeping existing images visible");
                          console.log("ℹ️ User can now see both old and new images");
                          console.log("ℹ️ Replacement will happen when Update Event is clicked");
                        }
                      }
                      
                      if (fileList && fileList.length > 0) {
                        console.log("🔄 Starting image compression process...");
                        const compressedFiles: File[] = [];
                        
                        for (let i = 0; i < fileList.length; i++) {
                          const file = fileList[i];
                          console.log(`📸 Processing edit image ${i + 1}/${fileList.length}:`, {
                            name: file.name,
                            size: file.size,
                            type: file.type
                          });
                          
                          try {
                            const compressedFile = await compressImage(file);
                            if (compressedFile) {
                              compressedFiles.push(compressedFile);
                              console.log(`✅ Edit image ${i + 1} compressed successfully`);
                            } else {
                              console.error(`❌ Failed to compress edit image: ${file.name}`);
                              compressedFiles.push(file);
                            }
                          } catch (error) {
                            console.error(`❌ Error compressing edit image ${i + 1}:`, error);
                            compressedFiles.push(file);
                          }
                        }
                        
                        console.log("📦 Final compressed edit files count:", compressedFiles.length);
                        setEditSelectedImages(compressedFiles);
                        
                        // Create preview URLs from compressed files
                        const urls = compressedFiles.map(file => URL.createObjectURL(file));
                        console.log("🖼️ Created edit preview URLs count:", urls.length);
                        setEditImagePreviewUrls(urls);
                        
                        // Remove hero image selection for new images
                        setEditSelectedHeroImage(-1);
                        
                        console.log("✅ All edit images compressed and ready for upload");
                      } else {
                        console.log("📭 No edit files received, clearing images");
                        setEditSelectedImages([]);
                        setEditImagePreviewUrls([]);
                      }
                    }}
                    onRemove={removeEditImage}
                    placeholder={editForm.type === "upcoming_events" ? "Drop a new image here to replace the current one" : "Drop additional images here or click to upload"}
                    helperText={editForm.type === "upcoming_events" ? "Only one image allowed for upcoming events." : "Upload up to 10 additional images for your event."}
                  />
                  
                  {/* New Image Previews */}
                  {editImagePreviewUrls.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">New Image Previews</Label>
                      <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
                        {editImagePreviewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <div className="relative h-32 w-full rounded-lg overflow-hidden border">
                              <Image
                                src={url}
                                alt={`New preview ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Step Navigation */}
            <div className="flex justify-between pt-6">
              <Button 
                type="button"
                variant="outline" 
                onClick={handleEditCancel}
                className="rounded-xl"
              >
                Cancel
              </Button>
              
              <div className="flex space-x-2">
                {editCurrentStep === 2 && (
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={handleEditPrevStep}
                    className="rounded-xl"
                  >
                    Previous
                  </Button>
                )}
                
                {editCurrentStep === 1 ? (
                  <Button 
                    type="button"
                    onClick={handleEditNextStep}
                    className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200"
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="button"
                    onClick={handleEditSubmit}
                    disabled={isUpdating}
                    className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Event'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deletingEventId === eventIdToDelete}
            >
              {deletingEventId === eventIdToDelete ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Event'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 