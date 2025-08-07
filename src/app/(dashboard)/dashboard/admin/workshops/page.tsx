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
import { Plus, Edit, Trash2, Calendar, Users, BookOpen, GraduationCap, ChevronDown } from "lucide-react";
import { useActionState } from "react";
import { createWorkshopAction, updateWorkshopAction, deleteWorkshopAction, createAssignmentAction } from "../../../../../actions/createWorkshop";

// API functions for Supabase workshops
const fetchWorkshopsFromAPI = async () => {
  try {
    const response = await fetch('/api/workshops/fetch');
    if (!response.ok) {
      throw new Error('Failed to fetch workshops');
    }
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching workshops:', error);
    return [];
  }
};





type SupabaseWorkshop = {
  id: string;
  title: string;
  description: string;
  presentation_url?: string;
  date: string;
  crc_class: string;
  created_at: string;
  has_assignment: boolean;
  assignments?: {
    id: string;
    title: string;
    description: string;
    submission_idate: string;
    submission_style: string;
    created_at: string;
  }[];
};

const workshopGroups = [
  { id: "ey", label: "EY", icon: GraduationCap },
  { id: "senior_4", label: "Senior 4", icon: Users },
  { 
    id: "senior_5", 
    label: "Senior 5", 
    icon: Users,
    submenu: [
      { id: "senior_5_group_a_b", label: "Group A+B" },
      { id: "senior_5_customer_care", label: "Customer Care" },
    ]
  },
  { 
    id: "senior_6", 
    label: "Senior 6", 
    icon: Users,
    submenu: [
      { id: "senior_6_group_a_b", label: "Group A+B" },
      { id: "senior_6_group_c", label: "Group C" },
      { id: "senior_6_group_d", label: "Group D" },
      { id: "senior_6_job_readiness_course", label: "Job Readiness Course" },
    ]
  },
];

export default function WorkshopsManagement() {
  const [selectedGroup, setSelectedGroup] = useState("ey");
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [workshops, setWorkshops] = useState<SupabaseWorkshop[]>([]);
  const [isAddWorkshopOpen, setIsAddWorkshopOpen] = useState(false);
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [workshopIdToDelete, setWorkshopIdToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [workshopToEdit, setWorkshopToEdit] = useState<SupabaseWorkshop | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    presentation_pdf_url: "",
    workshop_date: "",
    workshop_group: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);



  const handleDeleteWorkshop = async(id: string) => {
    try{
      const result = await deleteWorkshopAction(id);
      if (result.success) {
        console.log("Workshop deleted successfully");
        fetchDataForGroup(selectedGroup);
      } else {
        console.error("Error deleting workshop:", result.error);
      }
    } catch (error) {
      console.error("Error deleting workshop:", error);
    }
  }

  const handleAddWorkshop = async (prevstate: any | undefined, formDataParam: FormData) => {
    console.log("🔧 handleAddWorkshop called");
    
    try {
      const result = await createWorkshopAction(prevstate, formDataParam);
      
      if (result.status === "SUCCESS") {
        setIsAddWorkshopOpen(false);
        fetchDataForGroup(selectedGroup);
      }
      
      return result;
    } catch (error) {
      console.error("Error in handleAddWorkshop:", error);
      return { ...prevstate, error: "Failed to add workshop. Please try again.", status: "ERROR" };
    }
  };

  const[state,formAction, isPending] = useActionState(handleAddWorkshop, {error:"", status: "INITIAL", message: ""})

  // Add form state for workshop creation
  const [form, setForm] = useState({
    title: "",
    description: "",
    presentation_pdf_url: "",
    workshop_date: "",
    workshop_group: "",
  });
  
  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState({
    workshop_id: "",
    crc_class: "",
    title: "",
    description: "",
    submission_deadline: "",
    submission_style: "google_link",
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const TITLE_MAX = 60;
  const DESC_MAX= 500;

  // Reset form when dialog opens
  useEffect(() => {
    if (isAddWorkshopOpen) {
      setForm({ 
        title: "", 
        description: "", 
        presentation_pdf_url: "", 
        workshop_date: "", 
        workshop_group: "",
      });
      setFormError("");
    }
  }, [isAddWorkshopOpen]);

  // Reset assignment form when dialog opens
  useEffect(() => {
    if (isAddAssignmentOpen) {
      setAssignmentForm({
        workshop_id: "",
        crc_class: "",
        title: "",
        description: "",
        submission_deadline: "",
        submission_style: "google_link",
      });
    }
  }, [isAddAssignmentOpen]);

  function groupLabelFor(group: string) {
    // Handle enum values from Supabase
    const enumMappings: { [key: string]: string } = {
      'ey': 'EY',
      'senior_4': 'Senior 4',
      'senior_5_group_a_b': 'Senior 5 Group A+B',
      'senior_5_customer_care': 'Senior 5 Customer Care',
      'senior_6_group_a_b': 'Senior 6 Group A+B',
      'senior_6_group_c': 'Senior 6 Group C',
      'senior_6_group_d': 'Senior 6 Group D',
      'senior_6_job_readiness_course': 'Senior 6 Job Readiness Course'
    };
    
    // First check if it's a known enum value
    if (enumMappings[group]) {
      return enumMappings[group];
    }
    
    // Fallback to workshop groups for backward compatibility
    const workshopGroup = workshopGroups.find(g => g.id === group);
    return workshopGroup ? workshopGroup.label : group;
  }

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const isGroupExpanded = (groupId: string) => {
    return expandedGroups.includes(groupId);
  };

  // Helper function to flatten workshop groups for the form dropdown
  const getFlattenedWorkshopGroups = () => {
    const flattened: { id: string; label: string }[] = [];
    
    workshopGroups.forEach(group => {
      if (group.submenu) {
        // Add parent group as a disabled option
        flattened.push({ id: group.id, label: `${group.label} (Select subgroup)` });
        // Add submenu items
        group.submenu.forEach(subItem => {
          flattened.push({ id: subItem.id, label: `  ${subItem.label}` });
        });
      } else {
        flattened.push({ id: group.id, label: group.label });
      }
    });
    
    return flattened;
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "title" && value.length > TITLE_MAX) return;
    if (name === "description" && value.length > DESC_MAX) return;
    setForm(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: [] }));
  };

  const handleAssignmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAssignmentForm(prev => {
      const newForm = { ...prev, [name]: value };
      
      // Reset workshop selection when CRC class changes
      if (name === 'crc_class') {
        newForm.workshop_id = '';
      }
      
      return newForm;
    });
  };

  const handleAddAssignment = async (prevstate: any | undefined, formDataParam: FormData) => {
    console.log("🔧 handleAddAssignment called");
    
    try {
      const result = await createAssignmentAction(prevstate, formDataParam);
      
      if (result.status === "SUCCESS") {
        setIsAddAssignmentOpen(false);
        fetchDataForGroup(selectedGroup);
      }
      
      return result;
    } catch (error) {
      console.error("Error in handleAddAssignment:", error);
      return { ...prevstate, error: "Failed to add assignment. Please try again.", status: "ERROR" };
    }
  };

  const [assignmentState, assignmentFormAction, isAssignmentPending] = useActionState(handleAddAssignment, {error:"", status: "INITIAL", message: ""});

  const handleDeleteClick = (workshopId: string) => {
    setWorkshopIdToDelete(workshopId);
    setDeleteConfirmationOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (workshopIdToDelete) {
      console.log("Deleting workshop ID:", workshopIdToDelete);
      handleDeleteWorkshop(workshopIdToDelete!);
    }
    setDeleteConfirmationOpen(false);
    setWorkshopIdToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmationOpen(false);
    setWorkshopIdToDelete(null);
  };

  const handleEditClick = (workshop: SupabaseWorkshop) => {
    setWorkshopToEdit(workshop);
    setEditForm({
      title: workshop.title,
      description: workshop.description,
      presentation_pdf_url: workshop.presentation_url || "",
      workshop_date: workshop.date,
      workshop_group: workshop.crc_class,
    });
    setEditDialogOpen(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    if (!workshopToEdit) return;
    
    setIsUpdating(true);
    try {
      console.log("Updating workshop:", workshopToEdit.id, editForm);
      
      // Create FormData for the action
      const formData = new FormData();
      formData.append("workshop_id", workshopToEdit.id);
      formData.append("title", editForm.title);
      formData.append("description", editForm.description);
      formData.append("presentation_pdf_url", editForm.presentation_pdf_url);
      formData.append("workshop_date", editForm.workshop_date);
      formData.append("workshop_group", editForm.workshop_group);
      
      const result = await updateWorkshopAction({}, formData);
      if (result.status === 'SUCCESS'){
        console.log("Workshop updated successfully");
        setEditDialogOpen(false);
        setWorkshopToEdit(null);
        fetchDataForGroup(selectedGroup);
      }
    } catch (error) {
      console.error("Error updating workshop:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setWorkshopToEdit(null);
  };

  const fetchDataForGroup = async (group: string) => {
    setLoading(true);
    try {
      console.log("Fetching data for group:", group);
      
      const allWorkshops = await fetchWorkshopsFromAPI();
      
      // Filter workshops by the selected group
      const filteredWorkshops = allWorkshops.filter((workshop: SupabaseWorkshop) => 
        workshop.crc_class === group
      );
      
      console.log("Filtered workshops for group:", group, filteredWorkshops);
      setWorkshops(filteredWorkshops);
    } catch (error) {
      console.error("Error fetching workshops:", error);
      setWorkshops([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when group changes
  useEffect(() => {
    fetchDataForGroup(selectedGroup);
  }, [selectedGroup]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="p-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold font-cal-sans text-gray-800 mb-3">Workshops Management</h1>
          <p className="text-md text-gray-600">
            Add/edit workshops across all student groups
          </p>
        </div>

        {/* Success/Error Notifications */}
        {state.status === "SUCCESS" && state.message && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{state.message}</p>
              </div>
            </div>
          </div>
        )}

        {state.status === "ERROR" && state.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{state.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Assignment Success/Error Notifications */}
        {assignmentState.status === "SUCCESS" && assignmentState.message && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{assignmentState.message}</p>
              </div>
            </div>
          </div>
        )}

        {assignmentState.status === "ERROR" && assignmentState.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{assignmentState.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Two-Column Grid */}
        <div className="grid grid-cols-5 gap-6">
          {/* Left Sidebar - Group Selector (20% width) */}
          <div className="col-span-1 space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Workshop Groups</h3>
              {workshopGroups.map((group) => {
                const IconComponent = group.icon;
                const hasSubmenu = group.submenu && group.submenu.length > 0;
                const isExpanded = isGroupExpanded(group.id);
                
                return (
                  <div key={group.id} className="space-y-1">
                    <button
                      onClick={() => {
                        if (hasSubmenu) {
                          toggleGroupExpansion(group.id);
                        } else {
                          setSelectedGroup(group.id);
                        }
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                        selectedGroup === group.id
                          ? "bg-green-100 text-green-900 border border-green-200"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-4 w-4" />
                        {group.label}
                      </div>
                      {hasSubmenu && (
                        <ChevronDown 
                          className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        />
                      )}
                    </button>
                    
                    {/* Submenu */}
                    {hasSubmenu && isExpanded && (
                      <div className="ml-4 space-y-1">
                        {group.submenu.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => setSelectedGroup(subItem.id)}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${
                              selectedGroup === subItem.id
                                ? "bg-green-50 text-green-800 border border-green-200"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {subItem.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Workshop Button */}
            <div className="space-y-2 pt-4">
              <Dialog open={isAddWorkshopOpen} onOpenChange={setIsAddWorkshopOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full bg-green-600 hover:bg-green-700 text-white hover:text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Workshop
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Workshop</DialogTitle>
                  </DialogHeader>
                  <form className="space-y-4" action={formAction}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-1 block">Title</Label>
                        <Input
                          name="title"
                          value={form.title}
                          onChange={handleFormChange}
                          placeholder="Workshop title"
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
                        <Label className="text-sm font-medium mb-1 block">Workshop Group</Label>
                        <select
                          name="workshop_group"
                          value={form.workshop_group}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        >
                          <option value="">Select a group</option>
                          {getFlattenedWorkshopGroups().map((group) => (
                            <option 
                              key={group.id} 
                              value={group.id}
                              disabled={group.label.includes("(Select subgroup)")}
                            >
                              {group.label}
                            </option>
                          ))}
                        </select>
                        {fieldErrors.workshop_group && fieldErrors.workshop_group.length > 0 && (
                          <div className="text-red-500 text-xs mt-1">{fieldErrors.workshop_group[0]}</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-1 block">Description</Label>
                      <Textarea
                        name="description"
                        value={form.description}
                        onChange={handleFormChange}
                        placeholder="Workshop description..."
                        required
                        maxLength={DESC_MAX}
                        rows={3}
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-1 block">Workshop Date</Label>
                        <Input 
                          name="workshop_date" 
                          type="date" 
                          value={form.workshop_date} 
                          onChange={handleFormChange} 
                          required 
                        />
                        {fieldErrors.workshop_date && fieldErrors.workshop_date.length > 0 && (
                          <div className="text-red-500 text-xs mt-1">{fieldErrors.workshop_date[0]}</div>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-1 block">Presentation PDF URL (Optional)</Label>
                        <Input 
                          name="presentation_pdf_url" 
                          type="url" 
                          value={form.presentation_pdf_url} 
                          onChange={handleFormChange} 
                          placeholder="https://example.com/presentation.pdf" 
                        />
                        {fieldErrors.presentation_pdf_url && fieldErrors.presentation_pdf_url.length > 0 && (
                          <div className="text-red-500 text-xs mt-1">{fieldErrors.presentation_pdf_url[0]}</div>
                        )}
                      </div>
                    </div>



                    {formError && <div className="text-red-500 text-sm">{formError}</div>}
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" type="button" onClick={() => setIsAddWorkshopOpen(false)} disabled={submitting}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isPending} className="text-white">
                        {isPending ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Creating...
                          </div>
                        ) : (
                          "Add Workshop"
                        )}
                      </Button>
                    </div>

                    
                  </form>
                </DialogContent>
              </Dialog>

              {/* Add Assignment Button */}
              <Dialog open={isAddAssignmentOpen} onOpenChange={setIsAddAssignmentOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full bg-white hover:bg-gray-50 text-black border-black">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Assignment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Assignment</DialogTitle>
                    <DialogDescription>
                      Create an assignment for an existing workshop
                    </DialogDescription>
                  </DialogHeader>
                  <form className="space-y-4" action={assignmentFormAction}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-1 block">CRC Class</Label>
                        <select
                          name="crc_class"
                          value={assignmentForm.crc_class}
                          onChange={handleAssignmentFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        >
                          <option value="">Select a class</option>
                          {getFlattenedWorkshopGroups().map((group) => (
                            <option 
                              key={group.id} 
                              value={group.id}
                              disabled={group.label.includes("(Select subgroup)")}
                            >
                              {group.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-1 block">Workshop</Label>
                        <select
                          name="workshop_id"
                          value={assignmentForm.workshop_id}
                          onChange={handleAssignmentFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                          disabled={!assignmentForm.crc_class}
                        >
                          <option value="">Select a workshop</option>
                          {workshops
                            .filter(workshop => !assignmentForm.crc_class || workshop.crc_class === assignmentForm.crc_class)
                            .map((workshop) => (
                              <option key={workshop.id} value={workshop.id}>
                                {workshop.title}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-1 block">Assignment Title</Label>
                      <Input
                        name="title"
                        value={assignmentForm.title}
                        onChange={handleAssignmentFormChange}
                        placeholder="Assignment title"
                        required
                        maxLength={100}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-1 block">Assignment Description</Label>
                      <Textarea
                        name="description"
                        value={assignmentForm.description}
                        onChange={handleAssignmentFormChange}
                        placeholder="Assignment description..."
                        required
                        rows={4}
                        maxLength={500}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-1 block">Submission Deadline</Label>
                        <Input
                          name="submission_deadline"
                          type="date"
                          value={assignmentForm.submission_deadline}
                          onChange={handleAssignmentFormChange}
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-1 block">Submission Style</Label>
                        <select
                          name="submission_style"
                          value={assignmentForm.submission_style}
                          onChange={handleAssignmentFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        >
                          <option value="google_link">Google Link</option>
                          <option value="pdf_upload">PDF Upload</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" type="button" onClick={() => setIsAddAssignmentOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="text-white">
                        Add Assignment
                      </Button>
                    </div>
                    
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Right Content Area (80% width) */}
          <div className="col-span-4">
            <div className="space-y-6">
              {/* Workshops Table */}
              <Card>
                <CardHeader>
                  <CardTitle>{groupLabelFor(selectedGroup)}</CardTitle>
                  <CardDescription>
                    Manage workshops for {groupLabelFor(selectedGroup).toLowerCase()}
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
                          <TableHead>Date</TableHead>
                          <TableHead>Assignment</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {workshops.map((workshop) => (
                          <TableRow key={workshop.id}>
                            <TableCell className="font-medium">
                              <div className="flex text-md items-center gap-2">
                                {workshop.title}
                                
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate text-gray-600">
                              {workshop.description}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-gray-600">
                                <Calendar className="h-3 w-3" />
                                {formatDate(workshop.date)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={workshop.has_assignment 
                                ? "bg-blue-100 text-blue-700 border-blue-600  text-blue-700" 
                                : "bg-green-100 text-green-700 border-green-600  text-green-700"
                              }>
                                {workshop.has_assignment ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditClick(workshop)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteClick(workshop.id)}
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

      {/* Edit Workshop Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Workshop</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditFormChange}
                  placeholder="Enter workshop title"
                />
              </div>
              <div>
                <Label htmlFor="edit-group">Workshop Group</Label>
                <select
                  id="edit-group"
                  name="workshop_group"
                  value={editForm.workshop_group}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {getFlattenedWorkshopGroups().map((group) => (
                    <option 
                      key={group.id} 
                      value={group.id}
                      disabled={group.label.includes("(Select subgroup)")}
                    >
                      {group.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={editForm.description}
                onChange={handleEditFormChange}
                placeholder="Enter workshop description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-date">Workshop Date</Label>
                <Input
                  id="edit-date"
                  name="workshop_date"
                  type="date"
                  value={editForm.workshop_date}
                  onChange={handleEditFormChange}
                />
              </div>
              <div>
                <Label htmlFor="edit-pdf-url">Presentation PDF URL</Label>
                <Input
                  id="edit-pdf-url"
                  name="presentation_pdf_url"
                  type="url"
                  value={editForm.presentation_pdf_url}
                  onChange={handleEditFormChange}
                  placeholder="https://example.com/presentation.pdf"
                />
              </div>
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
              {isUpdating ? "Updating..." : "Update Workshop"}
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
              Are you sure you want to delete this workshop?
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