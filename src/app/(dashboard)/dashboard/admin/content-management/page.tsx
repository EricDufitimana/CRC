"use client";

import { addResource, deleteResource, updateResource } from "@/lib/action";
import { useState, useEffect, useActionState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { client } from "@/sanity/lib/client";
import { 
  getNewOpportunities, 
  getTemplates, 
  getEnglishLanguageLearning, 
  getRecurringOpportunities,
  getPreviousEvents,
  getUpcomingEvents,
  getWorkshopByCategory
} from "@/sanity/lib/queries";
import { Button } from "../../../../../../zenith/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../zenith/src/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../../../../../zenith/src/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../zenith/src/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../../../zenith/src/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../../../../zenith/src/components/ui/dialog";
import { Input } from "../../../../../../zenith/src/components/ui/input";
import { Textarea } from "../../../../../../zenith/src/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../../../zenith/src/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Edit, Trash2, Upload, FileText, Briefcase, Calendar, GraduationCap, Building, Users, BookOpen, ChevronDown } from "lucide-react";
import { Label } from "../../../../../../zenith/src/components/ui/label";
import { Checkbox } from "../../../../../../zenith/src/components/ui/checkbox";
import { resourceSchema } from "@/lib/validation";
import { z } from "zod";

const categories = [
  { id: "new-opportunities", label: "New Opportunities", icon: Briefcase },
  { id: "recurring-opportunities", label: "Recurring Opportunities", icon: Calendar },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "english-learning", label: "English Learning", icon: BookOpen },
];

const eventCategories = [
  { id: "previous-events", label: "Previous", icon: Calendar },
  { id: "upcoming-events", label: "Upcoming", icon: Calendar },
];

const workshopCategories = [
  { id: "ey", label: "EY", icon: GraduationCap },
  { id: "s4", label: "S4", icon: GraduationCap },
  { id: "s5", label: "S5", icon: GraduationCap, hasSubcategories: true },
  { id: "s6", label: "S6", icon: GraduationCap, hasSubcategories: true },
];

const s5Subcategories = [
  { id: "s5-groups-ab", label: "Groups A+B" },
  { id: "s5-customer-care", label: "Customer Care" },
];

const s6Subcategories = [
  { id: "s6-groups-ab", label: "Groups A+B" },
  { id: "s6-group-c", label: "Group C" },
  { id: "s6-group-d", label: "Group D" },
  { id: "s6-job-readiness", label: "Job Readiness Course" },
];
// Type for Sanity resources
type SanityResource = {
  _id: string;
  title: string;
  description: string;
  url?: string;
  image_address?: string;
  __createdAt?: string;
  opportunity_deadline?: string;
};



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

  // Only allow resource creation for these categories
  const validResourceCategories = [
    "new-opportunities",
    "recurring-opportunities",
    "templates",
    "english-learning",
    "s5-groups-ab",
    "s5-customer-care",
    "s6-groups-ab",
    "s6-group-c",
    "s6-group-d", "s6-job-readiness", "ey", "s4"
  ];
  const canAddResource = validResourceCategories.includes(selectedCategory);

  // Helper to get type based on selectedCategory
  const workshopCategoriesSet = new Set([
    "ey", "s4", "s5-groups-ab", "s5-customer-care", "s6-groups-ab", "s6-group-c", "s6-group-d", "s6-job-readiness"
  ]);
  const resourceType = workshopCategoriesSet.has(selectedCategory) ? "workshop" : "resource";

  // Helper to get label for selectedCategory
  function categoryLabelFor(cat: string) {
    const all = [
      ...categories,
      ...eventCategories,
      ...workshopCategories,
      ...s5Subcategories,
      ...s6Subcategories
    ];
    const found = all.find(c => c.id === cat);
    return found ? found.label : cat;
  }

  // Handle form input
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "title" && value.length > TITLE_MAX) return;
    if (name === "description" && value.length > DESC_MAX) return;
    setForm(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: [] })); // clear error for this field on change
  };

  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
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

  // Handle form submit
  const fetchDataForCategory = async (category: string) => {
    setLoading(true);
    try {
      let data: SanityResource[] = [];
      
      switch (category) {
        case "new-opportunities":
          data = await client.fetch(getNewOpportunities);
          break;
        case "recurring-opportunities":
          data = await client.fetch(getRecurringOpportunities);
          break;
        case "templates":
          data = await client.fetch(getTemplates);
          break;
        case "english-learning":
          data = await client.fetch(getEnglishLanguageLearning);
          break;
        case "previous-events":
          data = await client.fetch(getPreviousEvents);
          break;
        case "upcoming-events":
          data = await client.fetch(getUpcomingEvents);
          break;
        case "ey":
        case "s4":
          data = await client.fetch(getWorkshopByCategory, { workshopCategory: category });
          break;
        case "s5-groups-ab":
        case "s5-customer-care":
        case "s6-groups-ab":
        case "s6-group-c":
        case "s6-group-d":
        case "s6-job-readiness":
          data = await client.fetch(getWorkshopByCategory, { workshopCategory: category });
          break;
        default:
          data = [];
      }
      
      setResources(data);
    } catch (error) {
      console.error("Error fetching data:", error);
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
    <div className="min-h-screen bg-slate-50 flex w-full">
      <DashboardSidebar 
        isDarkTheme={isDarkTheme} 
      />
      <div className="flex-1 flex flex-col">
        <DashboardHeader isDarkTheme={isDarkTheme} onThemeToggle={() => setIsDarkTheme(!isDarkTheme)} />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full bg-dashboard-card bg-slate-50">
          {/* Test div to check if rounded works */}
          
          
          {/* Header */}
          <div className="mb-6 p-4">
            <h1 className="text-2xl font-bold text-dashboard-foreground">Content Management</h1>
            <p className="text-dashboard-muted-foreground">Add/edit resources across all student-facing pages</p>
          </div>
          {/* Two-Column Grid */}
          <div className="grid grid-cols-5 gap-6">
            {/* Left Sidebar - Category Selector (20% width) */}
            <div className="col-span-1 p-4 border border-dashboard-border rounded-dashboard-lg bg-dashboard-card">
              <h3 className="text-sm font-medium text-dashboard-foreground mb-4">Categories</h3>
              <div className="space-y-6">
                {/* Main Categories */}
                <div>
                  <Tabs orientation="vertical" value={selectedCategory} onValueChange={setSelectedCategory} className="gap-1">
                    <TabsList className="h-auto p-0 bg-transparent flex-col">
                      {categories.map(category => {
                        const Icon = category.icon;
                        return (
                          <TabsTrigger
                            key={category.id}
                            value={category.id}
                            className="w-full justify-start text-left hover:bg-dashboard-muted data-[state=active]:bg-dashboard-muted data-[state=active]:text-dashboard-foreground"
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {category.label}
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </Tabs>
                </div>

                {/* Events Section */}
                <div>
                  <h4 className="text-xs font-semibold text-dashboard-muted-foreground uppercase tracking-wider mb-2">Events</h4>
                  <Tabs orientation="vertical" value={selectedCategory} onValueChange={setSelectedCategory} className="gap-1">
                    <TabsList className="h-auto p-0 bg-transparent flex-col">
                      {eventCategories.map(category => {
                        const Icon = category.icon;
                        return (
                          <TabsTrigger
                            key={category.id}
                            value={category.id}
                            className="w-full justify-start text-left hover:bg-dashboard-muted data-[state=active]:bg-dashboard-muted data-[state=active]:text-dashboard-foreground text-sm"
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {category.label}
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </Tabs>
                </div>

                {/* Workshops Section */}
                <div>
                  <h4 className="text-xs font-semibold text-dashboard-muted-foreground uppercase tracking-wider mb-2">Workshops</h4>
                  <div className="space-y-1">
                    {workshopCategories.map(category => {
                      const Icon = category.icon;
                      const isExpanded = expandedWorkshops.includes(category.id);
                      
                      return (
                        <div key={category.id}>
                          <button
                            onClick={() => {
                              if (category.hasSubcategories) {
                                setExpandedWorkshops(prev => 
                                  prev.includes(category.id) 
                                    ? prev.filter(id => id !== category.id)
                                    : [...prev, category.id]
                                );
                              } else {
                                setSelectedCategory(category.id);
                              }
                            }}
                            className={`w-full flex items-center justify-between text-left hover:bg-dashboard-muted data-[state=active]:bg-dashboard-muted data-[state=active]:text-dashboard-foreground text-sm p-2 rounded ${
                              selectedCategory === category.id ? 'bg-dashboard-muted text-dashboard-foreground' : ''
                            }`}
                          >
                            <div className="flex items-center">
                              <Icon className="h-4 w-4 mr-2" />
                              {category.label}
                            </div>
                            {category.hasSubcategories && (
                              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            )}
                          </button>
                          
                          {category.hasSubcategories && isExpanded && (
                            <div className="ml-6 mt-1 space-y-1">
                              {category.id === 's5' && s5Subcategories.map(sub => (
                                <button
                                  key={sub.id}
                                  onClick={() => setSelectedCategory(sub.id)}
                                  className={`w-full flex items-center text-left hover:bg-dashboard-muted data-[state=active]:bg-dashboard-muted data-[state=active]:text-dashboard-foreground text-xs p-2 rounded ${
                                    selectedCategory === sub.id ? 'bg-dashboard-muted text-dashboard-foreground' : ''
                                  }`}
                                >
                                  {sub.label}
                                </button>
                              ))}
                              {category.id === 's6' && s6Subcategories.map(sub => (
                                <button
                                  key={sub.id}
                                  onClick={() => setSelectedCategory(sub.id)}
                                  className={`w-full flex items-center text-left hover:bg-dashboard-muted data-[state=active]:bg-dashboard-muted data-[state=active]:text-dashboard-foreground text-xs p-2 rounded ${
                                    selectedCategory === sub.id ? 'bg-dashboard-muted text-dashboard-foreground' : ''
                                  }`}
                                >
                                  {sub.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            {/* Main Content - Resource Editor (80% width) */}
            <div className="col-span-4 space-y-6">
              {/* Resource Table */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Resources</CardTitle>
                  <Dialog open={isAddResourceOpen} onOpenChange={setIsAddResourceOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="text-white border-white bg-green-600 hover:bg-green-700 hover:text-white
                      ">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Resource
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
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
                              {isPending ? "Adding..." : "Add Resource"}
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
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Preview</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead className="w-[50px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                              <span className="ml-2 text-black">Loading...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : resources.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-dashboard-muted-foreground">
                            No resources found for this category
                          </TableCell>
                        </TableRow>
                      ) : (
                        resources.map(resource => (
                          <TableRow key={resource._id}>
                            <TableCell>
                              <Avatar>
                                <AvatarFallback className="bg-gray-300 text-black font-semibold">
                                  {resource.title.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-medium">
                              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-dashboard-foreground hover:underline">
                                {resource.title}
                              </a>
                            </TableCell>
                            <TableCell className="text-dashboard-muted-foreground">
                              {resource.description.length > 50 ? `${resource.description.substring(0, 50)}...` : resource.description}
                            </TableCell>
                                                        <TableCell className="text-dashboard-muted-foreground">
                              {resource.opportunity_deadline || "No expiry"}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditClick(resource)} className="cursor-pointer">
                                    <Edit className="h-4 w-4 mr-2 cursor-pointer" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-dashboard-destructive cursor-pointer"
                                    onClick={() => handleDeleteClick(resource._id)} >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                                    </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
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
            <p className="text-dashboard-foreground">
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