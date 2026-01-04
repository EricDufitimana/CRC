"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/zenith/components/ui/button";
import { Input } from "@/zenith/components/ui/input";
import { Label } from "@/zenith/components/ui/label";
import { Textarea } from "@/zenith/components/ui/textarea";
import { Checkbox } from "@/zenith/components/ui/checkbox";
import {
  DialogHeader,
  DialogTitle,
} from "@/zenith/components/ui/dialog";
import { showToastSuccess, showToastError, showToastPromise } from "@/components/toasts";

const TITLE_MAX = 40;
const DESC_MAX = 420;

interface AddResourceDialogProps {
  selectedCategory: string;
  canAddResource: boolean;
  onClose: () => void;
}

export function AddResourceDialog({
  selectedCategory,
  canAddResource,
  onClose,
}: AddResourceDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    url: "",
    secondary_url: "",
    image_address: "",
    opportunity_deadline: "",
  });
  const [isFeatured, setIsFeatured] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const createResourceMutation = useMutation({
    ...trpc.resources.create.mutationOptions(),
    onSuccess: () => {
      setForm({
        title: "",
        description: "",
        url: "",
        secondary_url: "",
        image_address: "",
        opportunity_deadline: "",
      });
      setIsFeatured(false);
      setFieldErrors({});
      queryClient.invalidateQueries({
        queryKey: [['contentManagement', 'getResourcesByCategory']],
      });
      queryClient.invalidateQueries({
        queryKey: [['resources', 'getByCategory']],
      });
      onClose();
    },
    onError: (error) => {
      showToastError({
        headerText: 'Failed To Add Resource',
        paragraphText: error.message || 'We couldn\'t add the resource. Please try again or contact support.',
        direction: 'right'
      });
    },
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "title" && value.length > TITLE_MAX) return;
    if (name === "description" && value.length > DESC_MAX) return;
    setForm(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const errors: Record<string, string[]> = {};
    
    if (!form.title.trim()) {
      errors.title = ["Title is required"];
    }
    
    if (!form.description.trim()) {
      errors.description = ["Description is required"];
    }
    
    if (!form.url.trim()) {
      errors.url = ["URL is required"];
    } else {
      try {
        new URL(form.url);
      } catch {
        errors.url = ["Must be a valid URL"];
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const promise = createResourceMutation.mutateAsync({
      title: form.title.trim(),
      description: form.description.trim(),
      url: form.url.trim(),
      secondary_url: form.secondary_url?.trim() || undefined,
      image_address: form.image_address?.trim() || undefined,
      opportunity_deadline: form.opportunity_deadline?.trim() || undefined,
      category: selectedCategory,
      notifyAllStudents: isFeatured,
    });

    showToastPromise({
      promise,
      loadingText: 'Adding resource...',
      successText: 'The resource is now visible on the website',
      successHeaderText: 'Resource Added Successfully',
      errorText: 'We couldn\'t add the resource. Please try again or contact support.',
      errorHeaderText: 'Failed To Add Resource',
      direction: 'right'
    });
  };

  if (!canAddResource) {
    return (
      <div className="text-dashboard-muted-foreground text-center py-4">
        You can only add resources in valid resource categories.
      </div>
    );
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Add New Resource</DialogTitle>
      </DialogHeader>
      
      <div>
        <Label className="text-sm font-medium mb-1 block">Title</Label>
        <Input
          name="title"
          value={form.title}
          onChange={handleFormChange}
          placeholder="Resource title"
          required
          maxLength={TITLE_MAX}
          className="rounded-xl"
        />
        <div className="flex justify-between text-xs mt-1">
          <span className={form.title.length === TITLE_MAX ? "text-red-500" : "text-gray-400"}>
            {TITLE_MAX - form.title.length} characters left
          </span>
          {fieldErrors.title && fieldErrors.title.length > 0 && (
            <span className="text-red-500">{fieldErrors.title[0]}</span>
          )}
        </div>
      </div>
      
      <div>
        <Label className="text-sm font-medium mb-1 block">Description</Label>
        <Textarea
          name="description"
          value={form.description}
          onChange={handleFormChange}
          placeholder="Resource description..."
          required
          maxLength={DESC_MAX}
          className="rounded-xl"
        />
        <div className="flex justify-between text-xs mt-1">
          <span className={form.description.length === DESC_MAX ? "text-red-500" : "text-gray-400"}>
            {DESC_MAX - form.description.length} characters left
          </span>
          {fieldErrors.description && fieldErrors.description.length > 0 && (
            <span className="text-red-500">{fieldErrors.description[0]}</span>
          )}
        </div>
      </div>
      
      {selectedCategory === "templates" ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-1 block">Blank Template URL</Label>
            <Input
              name="url"
              value={form.url}
              onChange={handleFormChange}
              placeholder="https://example.com/blank-template"
              required
              className="rounded-xl"
            />
            {fieldErrors.url && fieldErrors.url.length > 0 && (
              <div className="text-red-500 text-xs mt-1">{fieldErrors.url[0]}</div>
            )}
          </div>
          <div>
            <Label className="text-sm font-medium mb-1 block">Sample Template URL</Label>
            <Input
              name="secondary_url"
              value={form.secondary_url}
              onChange={handleFormChange}
              placeholder="https://example.com/sample-template"
              className="rounded-xl"
            />
            {fieldErrors.secondary_url && fieldErrors.secondary_url.length > 0 && (
              <div className="text-red-500 text-xs mt-1">{fieldErrors.secondary_url[0]}</div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <Label className="text-sm font-medium mb-1 block">URL</Label>
          <Input
            name="url"
            value={form.url}
            onChange={handleFormChange}
            placeholder="https://example.com/resource"
            required
            className="rounded-xl"
          />
          {fieldErrors.url && fieldErrors.url.length > 0 && (
            <div className="text-red-500 text-xs mt-1">{fieldErrors.url[0]}</div>
          )}
        </div>
      )}
      
      <div>
        <Label className="text-sm font-medium mb-1 block">Image Address</Label>
        <Input
          name="image_address"
          value={form.image_address}
          onChange={handleFormChange}
          placeholder="https://example.com/image.png"
          className="rounded-xl"
        />
        {fieldErrors.image_address && fieldErrors.image_address.length > 0 && (
          <div className="text-red-500 text-xs mt-1">{fieldErrors.image_address[0]}</div>
        )}
      </div>
      
      <div>
        <Label className="text-sm font-medium mb-1 block">Deadline (Optional)</Label>
        <Input
          name="opportunity_deadline"
          type="date"
          value={form.opportunity_deadline}
          onChange={handleFormChange}
          placeholder="Expiry date (optional)"
          className="rounded-xl"
        />
        {fieldErrors.opportunity_deadline && fieldErrors.opportunity_deadline.length > 0 && (
          <div className="text-red-500 text-xs mt-1">{fieldErrors.opportunity_deadline[0]}</div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="notifyAllStudents"
          checked={isFeatured}
          onCheckedChange={(checked) => setIsFeatured(checked === true)}
          className={`${isFeatured ? 'text-white' : 'border-black'}`}
        />
        <Label htmlFor="notifyAllStudents">Notify all students</Label>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          type="button"
          onClick={onClose}
          disabled={createResourceMutation.isPending}
          className="rounded-xl"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createResourceMutation.isPending}
          className="rounded-xl bg-green-600 hover:bg-green-700 text-white hover:text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200"
        >
          {createResourceMutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            </div>
          ) : (
            "Add Resource"
          )}
        </Button>
      </div>
    </form>
  );
}

