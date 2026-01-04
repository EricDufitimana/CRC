"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/zenith/components/ui/button";
import { Input } from "@/zenith/components/ui/input";
import { Label } from "@/zenith/components/ui/label";
import { Textarea } from "@/zenith/components/ui/textarea";
import {
  DialogHeader,
  DialogTitle,
} from "@/zenith/components/ui/dialog";
import { showToastPromise } from "@/components/toasts";
import { Resource } from "./types";

const EDIT_TITLE_MAX = 40;
const EDIT_DESC_MAX = 420;

interface EditResourceDialogProps {
  resource: Resource | null;
  onClose: () => void;
}

export function EditResourceDialog({
  resource,
  onClose,
}: EditResourceDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    url: "",
    secondary_url: "",
    image_address: "",
    opportunity_deadline: "",
  });
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string[]>>({});

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
      setEditForm({
        title: resource.title,
        description: resource.description,
        url: resource.url || "",
        secondary_url: resource.secondary_url || "",
        image_address: resource.image_address || "",
        opportunity_deadline: resource.opportunity_deadline || "",
      });
      setEditFieldErrors({});
    }
  }, [resource]);

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "title" && value.length > EDIT_TITLE_MAX) return;
    if (name === "description" && value.length > EDIT_DESC_MAX) return;
    
    setEditForm(prev => ({ ...prev, [name]: value }));
    setEditFieldErrors(prev => ({ ...prev, [name]: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resource) return;
    
    // Clear previous errors
    setEditFieldErrors({});
    
    // Client-side validation
    const errors: Record<string, string[]> = {};
    
    if (!editForm.title.trim()) {
      errors.title = ["Title is required"];
    }
    
    if (!editForm.description.trim()) {
      errors.description = ["Description is required"];
    }
    
    if (!editForm.url.trim()) {
      errors.url = ["URL is required"];
    } else {
      try {
        new URL(editForm.url);
      } catch {
        errors.url = ["Must be a valid URL"];
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setEditFieldErrors(errors);
      return;
    }
    
    const promise = updateResourceMutation.mutateAsync({
      id: resource.id,
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      url: editForm.url.trim(),
      secondary_url: editForm.secondary_url?.trim() || undefined,
      image_address: editForm.image_address?.trim() || undefined,
      opportunity_deadline: editForm.opportunity_deadline?.trim() || undefined,
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

  if (!resource) return null;

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Edit Resource</DialogTitle>
      </DialogHeader>
      
      <div>
        <Label htmlFor="edit-title">Title</Label>
        <Input
          id="edit-title"
          name="title"
          value={editForm.title}
          onChange={handleEditFormChange}
          placeholder="Enter resource title"
          required
          maxLength={EDIT_TITLE_MAX}
          className="rounded-xl"
        />
        <div className="flex justify-between text-xs mt-1">
          <span className={editForm.title.length === EDIT_TITLE_MAX ? "text-red-500" : "text-gray-400"}>
            {EDIT_TITLE_MAX - editForm.title.length} characters left
          </span>
          {editFieldErrors.title && editFieldErrors.title.length > 0 && (
            <span className="text-red-500">{editFieldErrors.title[0]}</span>
          )}
        </div>
      </div>
      
      <div>
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          name="description"
          value={editForm.description}
          onChange={handleEditFormChange}
          placeholder="Enter resource description"
          required
          maxLength={EDIT_DESC_MAX}
          rows={3}
          className="rounded-xl"
        />
        <div className="flex justify-between text-xs mt-1">
          <span className={editForm.description.length === EDIT_DESC_MAX ? "text-red-500" : "text-gray-400"}>
            {EDIT_DESC_MAX - editForm.description.length} characters left
          </span>
          {editFieldErrors.description && editFieldErrors.description.length > 0 && (
            <span className="text-red-500">{editFieldErrors.description[0]}</span>
          )}
        </div>
      </div>
      
      {resource.category === "templates" ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-url">Blank Template URL</Label>
            <Input
              id="edit-url"
              name="url"
              type="url"
              value={editForm.url}
              onChange={handleEditFormChange}
              placeholder="Enter blank template URL"
              required
              className="rounded-xl"
            />
            {editFieldErrors.url && editFieldErrors.url.length > 0 && (
              <div className="text-red-500 text-xs mt-1">{editFieldErrors.url[0]}</div>
            )}
          </div>
          <div>
            <Label htmlFor="edit-secondary-url">Sample Template URL</Label>
            <Input
              id="edit-secondary-url"
              name="secondary_url"
              type="url"
              value={editForm.secondary_url}
              onChange={handleEditFormChange}
              placeholder="Enter sample template URL"
              className="rounded-xl"
            />
            {editFieldErrors.secondary_url && editFieldErrors.secondary_url.length > 0 && (
              <div className="text-red-500 text-xs mt-1">{editFieldErrors.secondary_url[0]}</div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <Label htmlFor="edit-url">URL</Label>
          <Input
            id="edit-url"
            name="url"
            type="url"
            value={editForm.url}
            onChange={handleEditFormChange}
            placeholder="Enter resource URL"
            required
            className="rounded-xl"
          />
          {editFieldErrors.url && editFieldErrors.url.length > 0 && (
            <div className="text-red-500 text-xs mt-1">{editFieldErrors.url[0]}</div>
          )}
        </div>
      )}
      
      <div>
        <Label htmlFor="edit-image-address">Image Address</Label>
        <Input
          id="edit-image-address"
          name="image_address"
          type="url"
          value={editForm.image_address}
          onChange={handleEditFormChange}
          placeholder="Enter image URL"
          className="rounded-xl"
        />
      </div>
      
      <div>
        <Label htmlFor="edit-deadline">Opportunity Deadline</Label>
        <Input
          id="edit-deadline"
          name="opportunity_deadline"
          type="date"
          value={editForm.opportunity_deadline}
          onChange={handleEditFormChange}
          className="rounded-xl"
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button
          variant="outline"
          type="button"
          onClick={onClose}
          disabled={updateResourceMutation.isPending}
          className="rounded-xl"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={updateResourceMutation.isPending}
          className="text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] rounded-xl transition duration-200"
        >
          {updateResourceMutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            </div>
          ) : (
            "Update Resource"
          )}
        </Button>
      </div>
    </form>
  );
}

