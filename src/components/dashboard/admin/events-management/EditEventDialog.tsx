"use client";

import { useState, useEffect } from "react";
import { Button } from "@/zenith/components/ui/button";
import { Input } from "@/zenith/components/ui/input";
import { Label } from "@/zenith/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/zenith/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/zenith/components/ui/select";
import { Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { FileUpload } from "@/zenith/components/ui/file-upload";
import MDEditor from '@uiw/react-md-editor';
import { z } from "zod";
import { updateEvent } from "@/lib/action";
import { showToastPromise } from "@/components/toasts";
import { useQueryClient } from "@tanstack/react-query";

const eventCategories = ["conference", "seminar", "workshop", "webinar", "training", "other"];

const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(60, "Title must be 60 characters or less"),
  description: z.string().min(1, "Description is required").max(460, "Description must be 460 characters or less"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Category is required"),
  type: z.string().min(1, "Event type is required"),
});

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
}

export function EditEventDialog({ open, onOpenChange, event }: EditEventDialogProps) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
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

  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (event) {
      setEditForm({
        title: event.title || "",
        description: event.description || "",
        date: event.date || "",
        location: event.location || "",
        category: event.category || "",
        type: event.type || "previous_events",
        event_organizer_name: event.event_organizer_name || "",
        event_organizer_role: event.event_organizer_role || "",
        event_organizer_image: event.event_organizer_image || "",
      });
      setExistingImages(event.gallery || []);
      setNewImages([]);
      setImagePreviewUrls([]);
      setCurrentStep(1);
    }
  }, [event]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    const updatePromise = (async () => {
      try {
        await eventSchema.parseAsync(editForm);
        const formData = new FormData();
        formData.append('eventId', event.id.toString());
        Object.entries(editForm).forEach(([key, value]) => formData.append(key, value));
        
        existingImages.forEach(img => formData.append('existingImages', JSON.stringify(img)));
        newImages.forEach(file => formData.append('newImages', file));

        const result = await updateEvent(formData);
        if (result.status === "SUCCESS") {
          onOpenChange(false);
          queryClient.invalidateQueries({ queryKey: [["eventsManagement", "getEvents"]] });
          return { success: true };
        } else {
          throw new Error(result.error);
        }
      } finally {
        setIsUpdating(false);
      }
    })();

    showToastPromise({
      promise: updatePromise,
      loadingText: 'Updating event...',
      successText: 'Event updated successfully',
      successHeaderText: 'Success',
      errorText: 'Failed to update event',
      errorHeaderText: 'Error',
      direction: 'right'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>Update event information</DialogDescription>
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
          {currentStep === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select value={editForm.type} onValueChange={(val) => setEditForm(prev => ({ ...prev, type: val }))}>
                    <SelectTrigger className="rounded-xl focus:ring-0 focus:ring-offset-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="previous_events">Previous Events</SelectItem>
                      <SelectItem value="upcoming_events">Upcoming Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={editForm.category} onValueChange={(val) => setEditForm(prev => ({ ...prev, category: val }))}>
                    <SelectTrigger className="rounded-xl focus:ring-0 focus:ring-offset-0">
                      <SelectValue />
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
                <Input value={editForm.title} onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))} className="rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0" />
              </div>

              <div className="space-y-2" data-color-mode="light">
                <Label>Description</Label>
                <MDEditor value={editForm.description} onChange={(val) => setEditForm(prev => ({ ...prev, description: val || '' }))} height={200} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={editForm.date} onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))} className="rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0" />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={editForm.location} onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))} className="rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>New Images</Label>
                <FileUpload
                  multiple={editForm.type === "previous_events"}
                  value={newImages}
                  onChange={(files) => {
                    if (!files) return;
                    setNewImages(files);
                    setImagePreviewUrls(files.map(f => URL.createObjectURL(f)));
                  }}
                  onRemove={(idx) => {
                    const next = newImages.filter((_, i) => i !== idx);
                    setNewImages(next);
                    setImagePreviewUrls(next.map(f => URL.createObjectURL(f)));
                  }}
                />
              </div>

              {existingImages.length > 0 && (
                <div className="space-y-4">
                  <Label>Existing Images</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {existingImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border">
                        <Image src={img.asset.url} alt="Gallery" fill className="object-cover" />
                        <button 
                          onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between pt-6 border-t mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <div className="flex gap-2">
            {currentStep === 2 && <Button variant="outline" onClick={() => setCurrentStep(1)} className="rounded-xl">Back</Button>}
            {currentStep === 1 ? (
              <Button onClick={() => setCurrentStep(2)} className="rounded-xl bg-black text-white px-8">Next</Button>
            ) : (
              <Button 
                onClick={handleUpdate} 
                className="rounded-xl bg-primary text-white px-8" 
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Event
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
