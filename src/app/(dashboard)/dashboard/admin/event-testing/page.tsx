"use client";

import { useState, useEffect, useActionState, useTransition } from "react";
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
import { Plus, Edit, Trash2, Calendar, MapPin, Users, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
// import { FileUpload } from "../../../../../../zenith/src/components/ui/file-upload";
import MDEditor from '@uiw/react-md-editor';
import { addEvent, updateEvent, deleteEvent } from "@/lib/action";
import { uploadImages, uploadImagesToSanity } from "@/actions/gallery";
import { Loader2 } from "lucide-react";

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
  { id: "previous-events", label: "Previous Events", icon: Calendar, color: "bg-green-100 text-green-900 border-green-200" },
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

export default function EventsManagement() {
  const [selectedCategory, setSelectedCategory] = useState("previous-events");
  const [events, setEvents] = useState<SanityEvent[]>([]);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [eventIdToDelete, setEventIdToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<SanityEvent | null>(null);
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

  // Form state for adding new events
  const [form, setForm] = useState({
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

  // Image upload states
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  // Form error states
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [isPending, setIsPending] = useState(false);
  const [isUploading, startUploadTransition] = useTransition();
  const [uploadedAssets, setUploadedAssets] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [imageProcessingStatus, setImageProcessingStatus] = useState<Record<number, 'processing' | 'ready' | 'error'>>({});

  // Image upload handler using Cloudinary - FIXED
  const handleImageUploadAction = async (formData: FormData) => {
    setUploadStatus('uploading');
    setUploadProgress(0);
    
    startUploadTransition(async () => {
      try {
        console.log("🚀 Starting image upload...");
        
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 200);
        
        // Create event first using the original formData
        const eventResult = await addEvent(null, formData);
        
        if (eventResult.status === "SUCCESS" && eventResult._id) {
          console.log("✅ Event created successfully:", eventResult._id);
          
          // Wait for Sanity document to be ready
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Now upload images to the event
          const result = await uploadImagesToSanity(formData, eventResult._id);
          
          clearInterval(progressInterval);
          setUploadProgress(100);
          
          if (result.success) {
            console.log("✅ Images uploaded successfully:", result.images);
            setUploadedAssets(result.images || []);
            setUploadStatus('success');
            
            // Reset progress after showing success
            setTimeout(() => {
              setUploadProgress(0);
            }, 2000);
            
            // Close dialog and refresh events
            setIsAddEventOpen(false);
            fetchEvents(selectedCategory === "previous-events" ? "previous_events" : "upcoming_events");
          } else {
            console.error("❌ Image upload failed:", result.message);
            setFormError(result.message || "Failed to upload images");
            setUploadStatus('error');
            setUploadProgress(0);
          }
        } else {
          console.error("❌ Event creation failed:", eventResult.error);
          setFormError(eventResult.error || "Failed to create event");
          setUploadStatus('error');
          setUploadProgress(0);
        }
      } catch (error) {
        console.error("💥 Upload error:", error);
        setFormError("Upload failed. Please try again.");
        setUploadStatus('error');
        setUploadProgress(0);
      }
    });
  };

  // Form submission handler - FIXED
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      if (selectedImages.length > 0) {
        // Append images to formData
        selectedImages.forEach(file => {
          formData.append('images', file);
        });
        
        // Handle both event creation and image upload
        await handleImageUploadAction(formData);
      } else {
        // Only create event
        const result = await addEvent(null, formData);
        
        if (result.status === "SUCCESS") {
          console.log("✅ Event added successfully");
          setIsAddEventOpen(false);
          // Clear form
          setForm({
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
          fetchEvents(selectedCategory === "previous-events" ? "previous_events" : "upcoming_events");
        } else {
          console.log("❌ Event addition failed:", result.error);
          setFormError(result.error || "Failed to add event");
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };



  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (files: File[]) => {
    console.log("🖼️ Images selected:", files.length);
    
    // Set processing status for each image
    const processingStatus: Record<number, 'processing' | 'ready' | 'error'> = {};
    files.forEach((_, index) => {
      processingStatus[index] = 'processing';
    });
    setImageProcessingStatus(processingStatus);
    
    // Simulate image processing
    setTimeout(() => {
      setSelectedImages(files);
      
      // Create preview URLs
      const urls = files.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(urls);
      
      // Mark images as ready
      const readyStatus: Record<number, 'processing' | 'ready' | 'error'> = {};
      files.forEach((_, index) => {
        readyStatus[index] = 'ready';
      });
      setImageProcessingStatus(readyStatus);
      
      console.log("✅ Images processed and ready for upload");
    }, 1000); // Simulate 1 second processing time
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    
    // Update preview URLs
    const newUrls = newImages.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(newUrls);
  };

  const handleEventTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear images when switching event type
    setSelectedImages([]);
    setImagePreviewUrls([]);
  };

  const handleEditImageUpload = (files: File[]) => {
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

  const handleEditEventTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear images when switching event type
    setEditSelectedImages([]);
    setEditImagePreviewUrls([]);
  };

  const handleDeleteClick = (eventId: string) => {
    setEventIdToDelete(eventId);
    setDeleteConfirmationOpen(true);
  };

  const handleDeleteConfirm = () => {
    // TODO: Implement delete functionality
    console.log("Deleting event:", eventIdToDelete);
    setDeleteConfirmationOpen(false);
    setEventIdToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmationOpen(false);
    setEventIdToDelete(null);
  };

  const handleEditClick = (event: SanityEvent) => {
    setEventToEdit(event);
    setEditForm({
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location,
      category: event.category,
      type: event.type,
      event_organizer_name: event.event_organizer?.name || "",
      event_organizer_role: event.event_organizer?.role || "",
      event_organizer_image: event.event_organizer?.image || "",
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    // TODO: Implement edit functionality
    console.log("Updating event:", eventToEdit?._id, editForm);
    setEditDialogOpen(false);
    setEventToEdit(null);
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEventToEdit(null);
  };

  const fetchEvents = async (type: string) => {
    setLoading(true);
    try {
      let apiUrl = '';
      if (type === "previous-events") {
        apiUrl = '/api/events/previous';
      } else if (type === "upcoming-events") {
        apiUrl = '/api/events/upcoming';
      } else {
        return;
      }

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Fetched ${type}:`, data.events);
      
      setEvents(data.events || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(selectedCategory);
  }, [selectedCategory]);

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
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                      selectedCategory === category.id
                        ? category.color
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    {category.label}
                  </button>
                );
              })}
            </div>

            {/* Add Event Button */}
            <div className="space-y-2 pt-4">
              <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full bg-green-600 hover:bg-green-700 text-white hover:text-white">
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
                  <div className="flex-1 overflow-y-auto px-2">
                    <form 
                      className="space-y-4" 
                      onSubmit={handleSubmit}
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium mb-1 block">Event Type</Label>
                                                  <select
                            name="type"
                            value={form.type}
                            onChange={handleEventTypeChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-dark"
                          >
                            <option value="previous_events">Previous Events</option>
                            <option value="upcoming_events">Upcoming Events</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium mb-1 block">Category</Label>
                          <select
                            name="category"
                            value={form.category}
                            onChange={handleFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-dark"
                          >
                            <option value="">Select Category</option>
                            {eventCategories.map(cat => (
                              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium mb-1 block">Event Title</Label>
                        <Input
                          name="title"
                          value={form.title}
                          onChange={handleFormChange}
                          placeholder="Enter event title"
                          required
                        />
                      </div>
                      
                      <div data-color-mode="light">
                         <Label className="text-sm font-medium mb-1 block">Description</Label>
                         <MDEditor 
                           value={form.description} 
                           onChange={(value) => setForm(prev => ({ ...prev, description: value || "" }))}
                           preview="edit"
                           height={200}
                           textareaProps={{
                             placeholder: "Enter event description with markdown support...",
                           }}
                         />
                         {/* Hidden input to include description in form submission */}
                         <input 
                           type="hidden" 
                           name="description" 
                           value={form.description} 
                         />
                       </div>
                      
                                          <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium mb-1 block">Date</Label>
                          <Input
                            name="date"
                            type="date"
                            value={form.date}
                            onChange={handleFormChange}
                            required
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium mb-1 block">Location</Label>
                          <Input
                            name="location"
                            value={form.location}
                            onChange={handleFormChange}
                            placeholder="Enter event location"
                            required
                          />
                        </div>
                      </div>

                      {/* Event Organizer Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Event Organizer</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium mb-1 block">Organizer Name</Label>
                            <Input
                              name="event_organizer_name"
                              value={form.event_organizer_name}
                              onChange={handleFormChange}
                              placeholder="Enter organizer name"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium mb-1 block">Organizer Role</Label>
                            <Input
                              name="event_organizer_role"
                              value={form.event_organizer_role}
                              onChange={handleFormChange}
                              placeholder="Enter organizer role"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium mb-1 block">Organizer Image</Label>
                          <Input
                            name="event_organizer_image"
                            value={form.event_organizer_image}
                            onChange={handleFormChange}
                            placeholder="Enter image URL or upload image"
                          />
                        </div>
                      </div>

                      {/* Image Upload Section */}
                      <div>
                        <Label className="text-sm font-medium mb-1 block">
                          {form.type === "upcoming_events" ? "Event Image" : "Event Images"}
                        </Label>
                        
                       {/* Simple File Upload */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                          <input
                            type="file"
                            multiple={form.type === "previous_events"}
                            accept="image/*"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              handleImageUpload(files);
                            }}
                            className="w-full"
                          />
                          <p className="text-sm text-gray-500 mt-2">
                            {form.type === "upcoming_events"
                              ? "Select a single image"
                              : "Select multiple images (max 10)"}
                          </p>
                        </div>
                        

                        

                        

                      </div>
                      
                      {/* Form Actions */}
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          type="button"
                          variant="outline" 
                          onClick={() => setIsAddEventOpen(false)}
                        >
                          Cancel
                        </Button>
                        

                        
                        <Button 
                          type="submit"
                          disabled={isPending || (selectedImages.length > 0 && uploadStatus === 'uploading')}
                          className="bg-dark text-white hover:bg-dark/80"
                          onClick={() => {
                            console.log("🔘 Add Event button clicked");
                            console.log("📝 Current form state:", form);
                            console.log("🖼️ Selected images:", selectedImages);
                            console.log("📤 Upload status:", uploadStatus);
                            
                            // Test if form is valid
                            const formElement = document.querySelector('form');
                            if (formElement) {
                              console.log("🔍 Form element found:", formElement);
                              console.log("🔍 Form validity:", formElement.checkValidity());
                              console.log("🔍 Form elements:", formElement.elements);
                            }
                          }}
                        >
                          {isPending || uploadStatus === 'uploading' ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {selectedImages.length > 0 ? 'Creating Event & Uploading Images...' : 'Creating Event...'}
                            </>
                          ) : (
                            'Add Event'
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Right Content Area (80% width) */}
          <div className="col-span-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Calendar className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No {selectedCategory === "previous-events" ? "Previous" : "Upcoming"} Events
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {selectedCategory === "previous-events" 
                        ? "No previous events have been added yet." 
                        : "No upcoming events have been added yet."
                      }
                    </p>
                    <Button onClick={() => setIsAddEventOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Event
                    </Button>
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
                  <div className="flex-1 overflow-y-auto px-2">
                    <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-1 block">Event Type</Label>
                                 <select
                   name="type"
                   value={editForm.type}
                   onChange={handleEditEventTypeChange}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                 >
                   <option value="previous_events">Previous Events</option>
                   <option value="upcoming_events">Upcoming Events</option>
                 </select>
              </div>
              <div>
                <Label className="text-sm font-medium mb-1 block">Category</Label>
                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {eventCategories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-1 block">Event Title</Label>
              <Input
                name="title"
                value={editForm.title}
                onChange={handleEditFormChange}
                placeholder="Enter event title"
                required
              />
            </div>
            
              <div data-color-mode="light">
                <Label className="text-sm font-medium mb-1 block">Description</Label>
                <MDEditor 
                  value={editForm.description} 
                  onChange={(value) => setEditForm(prev => ({ ...prev, description: value || "" }))}
                  preview="edit"
                  height={200}
                  textareaProps={{
                    placeholder: "Enter event description with markdown support...",
                  }}
                />
              </div>
            
                         <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label className="text-sm font-medium mb-1 block">Date</Label>
                 <Input
                   name="date"
                   type="date"
                   value={editForm.date}
                   onChange={handleEditFormChange}
                   required
                 />
               </div>
               <div>
                 <Label className="text-sm font-medium mb-1 block">Location</Label>
                 <Input
                   name="location"
                   value={editForm.location}
                   onChange={handleEditFormChange}
                   placeholder="Enter event location"
                   required
                 />
               </div>
             </div>

             {/* Event Organizer Section for Edit */}
             <div className="space-y-4">
               <h3 className="text-lg font-semibold">Event Organizer</h3>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label className="text-sm font-medium mb-1 block">Organizer Name</Label>
                   <Input
                     name="event_organizer_name"
                     value={editForm.event_organizer_name}
                     onChange={handleEditFormChange}
                     placeholder="Enter organizer name"
                   />
                 </div>
                 <div>
                   <Label className="text-sm font-medium mb-1 block">Organizer Role</Label>
                   <Input
                     name="event_organizer_role"
                     value={editForm.event_organizer_role}
                     onChange={handleEditFormChange}
                     placeholder="Enter organizer role"
                   />
                 </div>
               </div>
               <div>
                 <Label className="text-sm font-medium mb-1 block">Organizer Image</Label>
                 <Input
                   name="event_organizer_image"
                   value={editForm.event_organizer_image}
                   onChange={handleEditFormChange}
                   placeholder="Enter image URL or upload image"
                 />
               </div>
             </div>

             {/* Image Upload Section for Edit */}
             <div>
               <Label className="text-sm font-medium mb-1 block">
                 {editForm.type === "upcoming_events" ? "Event Image" : "Event Images"}
               </Label>
               <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                 <input
                   type="file"
                   multiple={editForm.type === "previous_events"}
                   accept="image/*"
                   onChange={(e) => {
                     const files = Array.from(e.target.files || []);
                     handleEditImageUpload(files);
                   }}
                   className="w-full"
                 />
                 <p className="text-sm text-gray-500 mt-2">
                   {editForm.type === "upcoming_events"
                     ? "Select a single image"
                     : "Select multiple images (max 10)"}
                 </p>
               </div>
               

             </div>
          </form>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleEditCancel}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>
              Update Event
            </Button>
          </DialogFooter>
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
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 