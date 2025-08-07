"use client";

import { useState, useEffect } from "react";
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
import { sendBulkEmails } from "@/actions/sendBulkEmails";
import { Plus, Edit, Trash2, ExternalLink, Calendar, FileText, Briefcase, BookOpen } from "lucide-react";
import { useActionState } from "react";
import { z } from "zod";
import { Checkbox } from "../../../../../../zenith/src/components/ui/checkbox";
import { deleteResource, updateResource, addResource, fetchResourcesByCategory } from "@/lib/action";
type SanityResource = {
  _id: string;
  title: string;
  description: string;
  url?: string;
  image_address?: string;
  __createdAt?: string;
  opportunity_deadline?: string;
};

const categories = [
  { id: "new-opportunities", label: "New Opportunities", icon: Briefcase },
  { id: "recurring-opportunities", label: "Recurring Opportunities", icon: Calendar },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "english-learning", label: "English Learning", icon: BookOpen },
];

export default function ContentManagement() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("new-opportunities");
  const [resources, setResources] = useState<SanityResource[]>([]);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [expandedWorkshops, setExpandedWorkshops] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [resourceIdToDelete, setResourceIdToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<SanityResource | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    url: "",
    image_address: "",
    opportunity_deadline: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Only allow resource creation for these categories
  const validResourceCategories = [
    "new-opportunities",
    "recurring-opportunities",
    "templates",
    "english-learning",
  ];
  const canAddResource = validResourceCategories.includes(selectedCategory);

  // Helper to get type based on selectedCategory
  const resourceType = "resource";

  // Simple validation schema
  const resourceSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    url: z.string().url("Must be a valid URL"),
    image_address: z.string().optional(),
    opportunity_deadline: z.string().optional(),
    type: z.string(),
    category: z.string(),
  });

  // Mock addResource function


  const handleDeleteResource = async(id:string) => {
    try{
      const result = await deleteResource(id);
      if (result.status === 'SUCCESS') {
        console.log("Resource deleted successfully");
        // Refresh the data after successful deletion
        fetchDataForCategory(selectedCategory);
      } else {
        console.error("Error deleting resource:", result.error);
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  }


  const handleAddResource = async (prevstate: any | undefined, formDataParam: FormData ) => {
    console.log("🔧 handleAddResource called");
    console.log("📋 Form data entries:");
    Array.from(formDataParam.entries()).forEach(([key, value]) => {
      console.log(`  ${key}:`, value);
    });
    try {
      // Map dashboard category to Sanity category value
      let category = selectedCategory;
      if (category === "new-opportunities") category = "new_opportunities";
      if (category === "recurring-opportunities") category = "recurring_opportunities";
      if (category === "english-learning") category = "english_language_learning";
      // For workshops, use the selected subcategory as the category (already handled by selectedCategory)
      const formValue = {
        title: formDataParam.get("title"),
        description: formDataParam.get("description"),
        url: formDataParam.get("url"),
        image_address: formDataParam.get("image_address"),
        opportunity_deadline: formDataParam.get("opportunity_deadline"),
        type: resourceType,
        category: category,
      };
      await resourceSchema.parseAsync(formValue);
      console.log(formValue);
      
      // Add category and type to FormData
      formDataParam.append("category", category);
      formDataParam.append("type", resourceType);
      
      const result = await addResource(prevstate, formDataParam);

      if(result.status === "SUCCESS"){
        setIsAddResourceOpen(false);
        fetchDataForCategory(selectedCategory);
        return { ...prevstate, error: "", status: "SUCCESS" }
      }
      return { ...prevstate, error: result.error, status: "ERROR" };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        setFieldErrors(fieldErrors as unknown as Record<string, string[]>);
        return { ...prevstate, error: "Validation error. Please check your input.", status: "ERROR" };
      }
      setFormError("Failed to add resource. Please try again.");
      return { ...prevstate, error: "Failed to add resource. Please try again.", status: "ERROR" };
    }
  };

  const[state,formAction, isPending] = useActionState(handleAddResource, {error:"", status: "INITIAL"})
  // Add form state for resource creation
  const [form, setForm] = useState({
    title: "",
    description: "",
    url: "",
    image_address: "",
    opportunity_deadline: "",
  });
  const [isFeatured, setIsFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  // Add this state for field errors and character counts
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const TITLE_MAX = 40;
  const DESC_MAX = 200;

  // Reset form when dialog opens
  useEffect(() => {
    if (isAddResourceOpen) {
      setForm({ title: "", description: "", url: "", image_address: "", opportunity_deadline: "" });
      setFormError("");
    }
  }, [isAddResourceOpen]);

  function categoryLabelFor(cat: string) {
    const category = categories.find(c => c.id === cat);
    return category ? category.label : cat;
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "title" && value.length > TITLE_MAX) return;
    if (name === "description" && value.length > DESC_MAX) return;
    setForm(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: [] })); // clear error for this field on change
  };

  const handleCheckboxChange = (checked: boolean) => {
    console.log("Checkbox changed:", checked);
  };

  const handleDeleteClick = (resourceId: string) => {
    setResourceIdToDelete(resourceId);
    setDeleteConfirmationOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (resourceIdToDelete) {
      console.log("Deleting resource ID:", resourceIdToDelete);
      handleDeleteResource(resourceIdToDelete!);
    }
    setDeleteConfirmationOpen(false);
    setResourceIdToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmationOpen(false);
    setResourceIdToDelete(null);
  };

  const handleEditClick = (resource: SanityResource) => {
    setResourceToEdit(resource);
    setEditForm({
      title: resource.title,
      description: resource.description,
      url: resource.url || "",
      image_address: resource.image_address || "",
      opportunity_deadline: resource.opportunity_deadline || "",
    });
    setEditDialogOpen(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

 const handleEditSubmit = async () => {
    if (!resourceToEdit) return;
    
    setIsUpdating(true);
    try {
      console.log("Updating resource:", resourceToEdit._id, editForm);
      
      const result = await updateResource(resourceToEdit._id, editForm);
      if (result.status === 'SUCCESS'){
        console.log("Resource updated successfully");
        setEditDialogOpen(false);
        setResourceToEdit(null);
        fetchDataForCategory(selectedCategory);
      }
    } catch (error) {
      console.error("Error updating resource:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setResourceToEdit(null);
  };

  const fetchDataForCategory = async (category: string) => {
    setLoading(true);
    try {
      console.log("Fetching data for category:", category);
      
      const result = await fetchResourcesByCategory(category);
      
      if (result.status === 'ERROR') {
        console.error("Error from server action:", result.error);
        setResources([]);
      } else {
        console.log("Data received from server action:", result.data);
        setResources(result.data);
      }
    } catch (error) {
      console.error("Error calling server action:", error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when category changes
  useEffect(() => {
    fetchDataForCategory(selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="p-8">
      <div className="space-y-8">
          {/* Header */}
        <div>
          <h1 className="text-4xl font-bold font-cal-sans text-gray-800 mb-3">Content Management</h1>
          <p className="text-md text-gray-600">
            Add/edit resources across all student-facing pages
          </p>
          </div>

          {/* Two-Column Grid */}
          <div className="grid grid-cols-5 gap-6">
            {/* Left Sidebar - Category Selector (20% width) */}
          <div className="col-span-1 space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                      selectedCategory === category.id
                        ? "bg-green-100 text-green-900 border border-green-200"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    {category.label}
                  </button>
                );
              })}
            </div>

            {/* Add Resource Buttons */}
            <div className="space-y-2 pt-4">
            <Dialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full bg-green-600 hover:bg-green-700 text-white hover:text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Resource
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Add New Resource</DialogTitle>
                      </DialogHeader>
                      {canAddResource ? (
                        <form className="space-y-3" action={formAction}>
                          <div>
                            <Label className="text-sm font-medium mb-1 block">Title</Label>
                            <Input
                              name="title"
                              value={form.title}
                              onChange={handleFormChange}
                              placeholder="Resource title"
                              required
                              maxLength={TITLE_MAX}
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
                          <div>
                            <Label className="text-sm font-medium mb-1 block">URL</Label>
                            <Input name="url" value={form.url} onChange={handleFormChange} placeholder="https://example.com/resource" required />
                            {fieldErrors.url && fieldErrors.url.length > 0 && (
                              <div className="text-red-500 text-xs mt-1">{fieldErrors.url[0]}</div>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium mb-1 block">Image Address (Optional)</Label>
                            <Input name="image_address" value={form.image_address} onChange={handleFormChange} placeholder="https://example.com/image.png" />
                            {fieldErrors.image_address && fieldErrors.image_address.length > 0 && (
                              <div className="text-red-500 text-xs mt-1">{fieldErrors.image_address[0]}</div>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium mb-1 block">Expiry Date</Label>
                            <Input name="opportunity_deadline" type="date" value={form.opportunity_deadline} onChange={handleFormChange} placeholder="Expiry date (optional)" />
                            {fieldErrors.opportunity_deadline && fieldErrors.opportunity_deadline.length > 0 && (
                              <div className="text-red-500 text-xs mt-1">{fieldErrors.opportunity_deadline[0]}</div>
                            )}
                          </div>
                          {formError && <div className="text-red-500 text-sm">{formError}</div>}
                          
                                                     <div className="flex items-center space-x-2 ">
                             <Checkbox id="is_featured" checked={isFeatured} onCheckedChange={handleCheckboxChange} className="text-white"/>
                             <Label htmlFor="is_featured">Notify every student</Label>
                             <input type="hidden" name="is_featured" value={isFeatured.toString()} />
                           </div>
                          
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" type="button" onClick={() => setIsAddResourceOpen(false)} disabled={submitting}>
                              Cancel
                            </Button>
                                            <Button type="submit" disabled={isPending} className="text-white">
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Adding...
                    </div>
                  ) : (
                    "Add Resource"
                  )}
                </Button>
                          </div>
                         
                        </form>
                      ) : (
                        <div className="text-dashboard-muted-foreground text-center py-4">
                          You can only add resources in valid resource categories.
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
            </div>
                  </div>

          {/* Right Content Area (80% width) */}
          <div className="col-span-4">
            <div className="space-y-6">
              {/* Category Header */}

              {/* Resources Table */}
              <Card>
                <CardHeader>
                  <CardTitle>{categoryLabelFor(selectedCategory)}</CardTitle>
                  <CardDescription>
                    Manage resources for {categoryLabelFor(selectedCategory).toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      <div className="animate-pulse">
                        {/* Table Header Skeleton */}
                        <div className="flex items-center gap-4 py-3 border-b border-gray-200">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                        {/* Table Rows Skeleton */}
                        {Array.from({ length: 5 }).map((_, index) => (
                          <div key={index} className="flex items-center gap-4 py-4 border-b border-gray-100">
                            <div className="h-5 bg-gray-200 rounded w-48"></div>
                            <div className="h-5 bg-gray-200 rounded w-64"></div>
                            <div className="h-5 bg-gray-200 rounded w-24"></div>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 bg-gray-200 rounded"></div>
                              <div className="h-8 w-8 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                          <TableHead>Deadline</TableHead>
                          <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {resources.map((resource) => (
                          <TableRow key={resource._id}>
                            <TableCell className="font-medium">
                              <div className="flex text-md items-center gap-2">
                                {resource.title}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate text-gray-600">
                              {resource.description}
                            </TableCell>
                           <TableCell>
                              {resource.opportunity_deadline?  (
                                <div className="flex items-center gap-1 text-gray-600">
                                  {new Date(resource.opportunity_deadline).toLocaleDateString()}
                                </div>
                              ): (
                                <div className="flex items-center gap-1 text-gray-600">
                                  No deadline
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditClick(resource)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteClick(resource._id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Resource Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                name="title"
                value={editForm.title}
                onChange={handleEditFormChange}
                placeholder="Enter resource title"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={editForm.description}
                onChange={handleEditFormChange}
                placeholder="Enter resource description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-url">URL</Label>
              <Input
                id="edit-url"
                name="url"
                type="url"
                value={editForm.url}
                onChange={handleEditFormChange}
                placeholder="Enter resource URL"
              />
            </div>
            <div>
              <Label htmlFor="edit-image-address">Image Address</Label>
              <Input
                id="edit-image-address"
                name="image_address"
                type="url"
                value={editForm.image_address}
                onChange={handleEditFormChange}
                placeholder="Enter image URL"
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
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={handleEditCancel}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditSubmit} 
              disabled={isUpdating}
              className="text-white"
            >
              {isUpdating ? "Updating..." : "Update Resource"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-900">
              Are you sure you want to delete this content?
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 