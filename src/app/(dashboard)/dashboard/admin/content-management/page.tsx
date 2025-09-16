"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { sendBulkEmails } from "@/actions/emails/sendBulkEmails";
import { Plus, Edit, Trash2, ExternalLink, Calendar, FileText, Briefcase, BookOpen } from "lucide-react";
import { showToastSuccess, showToastError, showToastPromise } from "@/components/toasts";
import { useActionState } from "react";
import { z } from "zod";
import { Checkbox } from "../../../../../../zenith/src/components/ui/checkbox";
import { deleteResource, updateResource, addResource, fetchResourcesByCategory } from "@/lib/action";
type SanityResource = {
  _id: string;
  title: string;
  description: string;
  url?: string;
  secondary_url?: string;
  image_address?: string;
  __createdAt?: string;
  opportunity_deadline?: string;
  category?: string;
};

const categories = [
  { id: "new-opportunities", label: "New Opportunities", icon: Briefcase },
  { id: "recurring-opportunities", label: "Recurring Opportunities", icon: Calendar },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "english-learning", label: "English Learning", icon: BookOpen },
];

export default function ContentManagement() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get category from URL params or default to new-opportunities
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const categoryFromUrl = searchParams?.get('category')	;
    return categoryFromUrl || "new-opportunities";
  });
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
    secondary_url: "",
    image_address: "",
    opportunity_deadline: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [editFormError, setEditFormError] = useState("");
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string[]>>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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
    secondary_url: z.string().optional(),
    image_address: z.string().optional(),
    opportunity_deadline: z.string().optional(),
    type: z.string(),
    category: z.string(),
  });

  // Mock addResource function


  const handleDeleteResource = async(id:string) => {
    const deletePromise = (async () => {
      const result = await deleteResource(id);
      if (result.status === 'SUCCESS') {
        console.log("Resource deleted successfully");
        // Refresh the data after successful deletion
        await fetchDataForCategory(selectedCategory);
        return { success: true };
      } else {
        throw new Error(result.error || "Failed to delete resource");
      }
    })();

    showToastPromise({
      promise: deletePromise,
      loadingText: 'Deleting resource...',
      successText: 'The resource has been removed from the website',
      successHeaderText: 'Resource Deleted Successfully',
      errorText: 'We couldn\'t delete the resource. Please try again or contact support.',
      errorHeaderText: 'Failed To Delete Resource',
      direction: 'right'
    });
  }


  const handleAddResource = async (prevstate: any | undefined, formDataParam: FormData ) => {
    
    const addPromise = (async () => {
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
          secondary_url: formDataParam.get("secondary_url"),
          image_address: formDataParam.get("image_address"),
          opportunity_deadline: formDataParam.get("opportunity_deadline"),
          type: resourceType,
          category: category,
        };
        await resourceSchema.parseAsync(formValue);
        
        // Add category and type to FormData
        formDataParam.append("category", category);
        formDataParam.append("type", resourceType);
        
        const result = await addResource(prevstate, formDataParam);

        if(result.status === "SUCCESS"){
          setIsAddResourceOpen(false);
          // Refresh the data after successful creation
          await fetchDataForCategory(selectedCategory);
          return { success: true };
        }
        throw new Error(result.error || "Failed to add resource");
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldErrors = error.flatten().fieldErrors;
          setFieldErrors(fieldErrors as unknown as Record<string, string[]>);
          throw new Error("Validation error. Please check your input.");
        }
        throw new Error("Failed to add resource. Please try again.");
      }
    })();

    showToastPromise({
      promise: addPromise,
      loadingText: 'Adding resource...',
      successText: 'The resource is now visible on the website',
      successHeaderText: 'Resource Added Successfully',
      errorText: 'We couldn\'t add the resource. Please try again or contact support.',
      errorHeaderText: 'Failed To Add Resource',
      direction: 'right'
    });

    try {
      await addPromise;
      return { ...prevstate, error: "", status: "SUCCESS" };
    } catch (error) {
      return { ...prevstate, error: error instanceof Error ? error.message : "Failed to add resource", status: "ERROR" };
    }
  };

  const[state,formAction, isPending] = useActionState(handleAddResource, {error:"", status: "INITIAL"})
  // Add form state for resource creation
  const [form, setForm] = useState({
    title: "",
    description: "",
    url: "",
    secondary_url: "",
    image_address: "",
    opportunity_deadline: "",
  });
  const [isFeatured, setIsFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  // Add this state for field errors and character counts
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const TITLE_MAX = 40;
  const DESC_MAX = 420;
  const EDIT_TITLE_MAX = 40;
  const EDIT_DESC_MAX = 420;

  // Reset form when dialog opens
  useEffect(() => {
    if (isAddResourceOpen) {
      setForm({ title: "", description: "", url: "", secondary_url: "", image_address: "", opportunity_deadline: "" });
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
    setIsFeatured(checked);
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
      secondary_url: resource.secondary_url || "",
      image_address: resource.image_address || "",
      opportunity_deadline: resource.opportunity_deadline || "",
    });
    setEditDialogOpen(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Character limit validation
    if (name === "title" && value.length > EDIT_TITLE_MAX) return;
    if (name === "description" && value.length > EDIT_DESC_MAX) return;
    
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

 const handleEditSubmit = async () => {
    if (!resourceToEdit) return;
    
    // Clear previous errors
    setEditFormError("");
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
    
    setIsUpdating(true);
    
    const updatePromise = (async () => {
      try {
        console.log("Updating resource:", resourceToEdit._id, editForm);
        
        const result = await updateResource(resourceToEdit._id, editForm);
        if (result.status === 'SUCCESS'){
          console.log("Resource updated successfully");
          setEditDialogOpen(false);
          setResourceToEdit(null);
          // Refresh the data after successful update
          await fetchDataForCategory(selectedCategory);
          return { success: true };
        } else {
          throw new Error(result.error || "Failed to update resource");
        }
      } catch (error) {
        console.error("Error updating resource:", error);
        throw new Error("Failed to update resource. Please try again.");
      }
    })();

    showToastPromise({
      promise: updatePromise,
      loadingText: 'Updating resource...',
      successText: 'The resource has been updated',
      successHeaderText: 'Resource Updated Successfully',
      errorText: 'We couldn\'t update the resource. Please try again or contact support.',
      errorHeaderText: 'Failed To Update Resource',
      direction: 'right'
    });

    try {
      await updatePromise;
    } catch (error) {
      console.error("Error updating resource:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setResourceToEdit(null);
    setEditFormError("");
    setEditFieldErrors({});
  };

  const fetchDataForCategory = async (category: string) => {
    setLoading(true);
    try {
      const result = await fetchResourcesByCategory(category);
      
      if (result.status === 'ERROR') {
        console.error("Error from server action:", result.error);
        setResources([]);
      } else {
        setResources(result.data);
      }
    } catch (error) {
      console.error("Error calling server action:", error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  // Update URL when category changes
  const updateCategoryInUrl = (category: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
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
    fetchDataForCategory(selectedCategory);
    setCurrentPage(1); // Reset to first page when category changes
  }, [selectedCategory]);

  // Calculate pagination
  const totalPages = Math.ceil(resources.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResources = resources.slice(startIndex, endIndex);

  return (
    <div className="p-8">
      <div className="space-y-8">
          {/* Header */}
        <div>
          <h1 className="text-4xl font-bold font-cal-sans text-gray-800 mb-1">Content Management</h1>
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
                    onClick={() => handleCategoryChange(category.id)}
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
                      <Button variant="outline" className="w-full bg-green-600 hover:bg-green-700 text-white hover:text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200">
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
                            <Input name="image_address" value={form.image_address} onChange={handleFormChange} placeholder="https://example.com/image.png" className="rounded-xl" />
                            {fieldErrors.image_address && fieldErrors.image_address.length > 0 && (
                              <div className="text-red-500 text-xs mt-1">{fieldErrors.image_address[0]}</div>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium mb-1 block">Deadline (Optional)</Label>
                            <Input name="opportunity_deadline" type="date" value={form.opportunity_deadline} onChange={handleFormChange} placeholder="Expiry date (optional)" className="rounded-xl" />
                            {fieldErrors.opportunity_deadline && fieldErrors.opportunity_deadline.length > 0 && (
                              <div className="text-red-500 text-xs mt-1">{fieldErrors.opportunity_deadline[0]}</div>
                            )}
                          </div>
                          {formError && <div className="text-red-500 text-sm">{formError}</div>}
                          
                           <div className="flex items-center space-x-2 ">
                             <Checkbox 
                               id="notifyAllStudents" 
                               checked={isFeatured} 
                               onCheckedChange={handleCheckboxChange} 
                               className={`${isFeatured ? 'text-white' : 'border-black'}`}
                             />
                             <Label htmlFor="notifyAllStudents">Notify all students</Label>
                             <input type="hidden" name="notifyAllStudents" value={isFeatured.toString()} />
                             <input type="hidden" name="secondary_url" value={form.secondary_url} />
                           </div>
                          
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" type="button" onClick={() => setIsAddResourceOpen(false)} disabled={submitting} className="rounded-xl">
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isPending} className="text-white rounded-xl bg-green-600 hover:bg-green-700 text-white hover:text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200">
                              {isPending ? (
                                <div className="flex items-center gap-2">
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                  
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
                      {loading ? (
                        // Loading skeleton rows
                        Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={`skeleton-${index}`}>
                            <TableCell>
                              <div className="animate-pulse">
                                <div className="h-5 bg-gray-200 rounded w-48 mb-1"></div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-64 mb-1"></div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="animate-pulse flex items-center gap-2">
                                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : resources.length === 0 ? (
                        // Empty state
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-12">
                            <div className="flex flex-col items-center space-y-3">
                              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                                <FileText className="h-8 w-8 text-gray-400" />
                              </div>
                              <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No resources found</h3>
                                <p className="text-gray-500 text-sm">
                                  Get started by adding your first resource to this category.
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        // Actual data rows
                        currentResources.map((resource) => (
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
                              {resource.opportunity_deadline ? (
                                <div className="flex items-center gap-1 text-gray-600">
                                  {new Date(resource.opportunity_deadline).toLocaleDateString()}
                                </div>
                              ) : (
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
                        ))
                      )}
                    </TableBody>
                  </Table>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t">
                      <div className="text-sm text-gray-700">
                        Showing {startIndex + 1} to {Math.min(endIndex, resources.length)} of {resources.length} resources
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="w-8 h-8 p-0"
                        >
                          ←
                        </Button>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 p-0 ${
                                currentPage === page 
                                  ? "bg-black text-white hover:bg-black/80 hover:text-white border-black" 
                                  : ""
                              }`}
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="w-8 h-8 p-0"
                        >
                          →
                        </Button>
                      </div>
                    </div>
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
            {resourceToEdit?.category === "templates" ? (
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
          </div>
          {editFormError && <div className="text-red-500 text-sm">{editFormError}</div>}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={handleEditCancel}
              disabled={isUpdating}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditSubmit} 
              disabled={isUpdating}
              className="text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] rounded-xl transition duration-200"
            >
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  
                </div>
              ) : (
                "Update Resource"
              )}
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