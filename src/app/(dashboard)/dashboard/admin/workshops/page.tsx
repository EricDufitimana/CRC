"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "../../../../../../zenith/src/components/ui/button";
import { Input } from "../../../../../../zenith/src/components/ui/input";
import { Label } from "../../../../../../zenith/src/components/ui/label";
import { Textarea } from "../../../../../../zenith/src/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../../../zenith/src/components/ui/card";
import { Badge } from "../../../../../../zenith/src/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../zenith/src/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../../zenith/src/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../../../zenith/src/components/ui/dialog";
import { Plus, Edit, Trash2, Calendar, Users, BookOpen, GraduationCap, ChevronDown, Loader2, FileText, Upload, Clock, X } from "lucide-react";
import { useActionState } from "react";
import { createWorkshopAction, updateWorkshopAction, deleteWorkshopAction, createAssignmentAction, deleteAssignmentAction, updateAssignmentAction } from "../../../../../actions/workshops/createWorkshop";
import { showToastSuccess, showToastError, showToastPromise } from "@/components/toasts";
import { DateTimePicker } from "@/components/ui/datetime-picker";

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
  created_at: string;
  has_assignment: boolean;
  crc_classes: {
    id: string;
    name: string;
  }[];
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
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get group from URL params or default to ey
  const [selectedGroup, setSelectedGroup] = useState(() => {
    const groupFromUrl = searchParams?.get('group');
    return groupFromUrl || "ey";
  });
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [workshops, setWorkshops] = useState<SupabaseWorkshop[]>([]);
  const [allWorkshops, setAllWorkshops] = useState<SupabaseWorkshop[]>([]);
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
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const [isEditUploading, setIsEditUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFetchingWorkshops, setIsFetchingWorkshops] = useState(false);
  const [deletingWorkshopId, setDeletingWorkshopId] = useState<string | null>(null);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [selectedWorkshopForAssignment, setSelectedWorkshopForAssignment] = useState<SupabaseWorkshop | null>(null);
  const [editAssignmentDialogOpen, setEditAssignmentDialogOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState<any>(null);
  const [editAssignmentForm, setEditAssignmentForm] = useState({
    title: "",
    description: "",
    submission_deadline: "",
    submission_style: "google_link",
  });
  const [isUpdatingAssignment, setIsUpdatingAssignment] = useState(false);
  const [deletingAssignmentId, setDeletingAssignmentId] = useState<string | null>(null);
  const [isFetchingAssignment, setIsFetchingAssignment] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  // Filter workshops based on search term and filters
  const [searchTerm, setSearchTerm] = useState("");

  const filteredWorkshops = workshops.filter(workshop => {
    // Search term filtering (case-insensitive)
    const searchMatch = searchTerm === "" || 
      workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workshop.description.toLowerCase().includes(searchTerm.toLowerCase());

    return searchMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredWorkshops.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedWorkshops = filteredWorkshops.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Update URL when group changes
  const updateGroupInUrl = (group: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('group', group);
    router.push(`?${params.toString()}`);
  };

  // Handle group change
  const handleGroupChange = (group: string) => {
    setSelectedGroup(group);
    updateGroupInUrl(group);
  };



  const handleDeleteWorkshop = async(id: string) => {
    setDeletingWorkshopId(id);
    
    const deletePromise = (async () => {
      try {
        const result = await deleteWorkshopAction(id);
        if (result.success) {
          console.log("Workshop deleted successfully");
          await fetchDataForGroup(selectedGroup);
          return { success: true };
        } else {
          throw new Error(result.error || "Failed to delete workshop");
        }
      } finally {
        setDeletingWorkshopId(null);
      }
    })();

    showToastPromise({
      promise: deletePromise,
      loadingText: 'Deleting workshop...',
      successText: 'The workshop has been removed',
      successHeaderText: 'Workshop Deleted Successfully',
      errorText: 'We couldn\'t delete the workshop. Please try again or contact support.',
      errorHeaderText: 'Failed To Delete Workshop',
      direction: 'right'
    });
  }

  const handleAddWorkshop = async (prevstate: any | undefined, formDataParam: FormData) => {
    console.log("🔧 handleAddWorkshop called");
    
    const addPromise = (async () => {
      try {
        const result = await createWorkshopAction(prevstate, formDataParam);
        
        if (result.status === "SUCCESS") {
          await fetchDataForGroup(selectedGroup);
          return { success: true };
        } else {
          throw new Error(result.error || "Failed to add workshop");
        }
      } catch (error) {
        console.error("Error in handleAddWorkshop:", error);
        throw new Error("Failed to add workshop. Please try again.");
      }
    })();

    // Call showToastPromise and return the promise result for useActionState
    showToastPromise({
      promise: addPromise,
      loadingText: 'Creating workshop...',
      successText: 'The workshop has been added to the system',
      successHeaderText: 'Workshop Created Successfully',
      errorText: 'We couldn\'t create the workshop. Please try again or contact support.',
      errorHeaderText: 'Failed To Create Workshop',
      direction: 'right'
    });

    // Return the promise result for useActionState
    try {
      const result = await addPromise;
      return { ...prevstate, error: "", status: "SUCCESS" };
    } catch (error) {
      return { ...prevstate, error: error instanceof Error ? error.message : "Failed to add workshop", status: "ERROR" };
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState({
    workshop_id: "",
    crc_class: "",
    title: "",
    description: "",
    submission_deadline: null as Date | null,
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
      setSelectedFile(null);
      setIsUploading(false);
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
        submission_deadline: null,
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
          // For Senior 5 and Senior 6, show the full name without indentation
          if (group.id === 'senior_5' || group.id === 'senior_6') {
            flattened.push({ id: subItem.id, label: `${group.label} ${subItem.label}` });
          } else {
            flattened.push({ id: subItem.id, label: `  ${subItem.label}` });
          }
        });
      } else {
        flattened.push({ id: group.id, label: group.label });
      }
    });
    
    return flattened;
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    
    if (name === "presentation_file" && files && files[0]) {
      const file = files[0];
      if (file.type !== 'application/pdf') {
        setFormError("Only PDF files are allowed for presentations");
        return;
      }
      setSelectedFile(file);
      setFormError("");
      
      // Simulate upload progress
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
      }, 2000); // 2 second simulation
      return;
    }
    
    if (name === "title" && value.length > TITLE_MAX) return;
    if (name === "description" && value.length > DESC_MAX) return;
    setForm(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: [] }));
  };

  const handleCreateWorkshopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("presentation_pdf_url", form.presentation_pdf_url);
    formData.append("workshop_date", form.workshop_date);
    formData.append("workshop_group", form.workshop_group);
    
    // Add file if selected
    if (selectedFile) {
      formData.append("presentation_file", selectedFile);
    }
    
    await formAction(formData);
  };

  const handleAssignmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAssignmentForm(prev => {
      const newForm = { ...prev, [name]: value };
      
      // Reset workshop selection when CRC class changes
      if (name === 'crc_class') {
        newForm.workshop_id = '';
        // Trigger workshop fetching for the selected class
        if (value) {
          setIsFetchingWorkshops(true);
          // Simulate a small delay to show the spinner
          setTimeout(() => {
            setIsFetchingWorkshops(false);
          }, 500);
        }
      }
      
      return newForm;
    });
  };

  const handleAddAssignment = async (prevstate: any | undefined, formDataParam: FormData) => {
    console.log("🔧 handleAddAssignment called");
    console.log("Form data entries:");
    console.log("workshop_id:", formDataParam.get("workshop_id"));
    console.log("crc_class:", formDataParam.get("crc_class"));
    console.log("title:", formDataParam.get("title"));
    console.log("description:", formDataParam.get("description"));
    console.log("submission_deadline:", formDataParam.get("submission_deadline"));
    console.log("submission_style:", formDataParam.get("submission_style"));
    
    const addAssignmentPromise = (async () => {
      try {
        const result = await createAssignmentAction(prevstate, formDataParam);
        console.log("Assignment action result:", result);
        
        if (result.status === "SUCCESS") {
          await fetchDataForGroup(selectedGroup);
          return { success: true };
        } else {
          throw new Error(result.error || "Failed to add assignment");
        }
      } catch (error) {
        console.error("Error in handleAddAssignment:", error);
        throw new Error("Failed to add assignment. Please try again.");
      }
    })();

    // Call showToastPromise and return the promise result for useActionState
    showToastPromise({
      promise: addAssignmentPromise,
      loadingText: 'Creating assignment...',
      successText: 'The assignment has been added to the system',
      successHeaderText: 'Assignment Created Successfully',
      errorText: 'We couldn\'t create the assignment. Please try again or contact support.',
      errorHeaderText: 'Failed To Create Assignment',
      direction: 'right'
    });

    // Return the promise result for useActionState
    try {
      const result = await addAssignmentPromise;
      return { ...prevstate, error: "", status: "SUCCESS" };
    } catch (error) {
      return { ...prevstate, error: error instanceof Error ? error.message : "Failed to add assignment", status: "ERROR" };
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
    
    // Determine the workshop group based on CRC classes
    let workshopGroup = '';
    if (workshop.crc_classes && workshop.crc_classes.length > 0) {
      const crcClassNames = workshop.crc_classes.map(c => c.name);
      
      // Check for EY groups
      if (crcClassNames.some(name => name.startsWith('EY'))) {
        workshopGroup = 'ey';
      }
      // Check for Senior 4 groups
      else if (crcClassNames.some(name => name.startsWith('S4'))) {
        workshopGroup = 'senior_4';
      }
      // Check for Senior 5 groups
      else if (crcClassNames.some(name => name.includes('S5 Group A+B'))) {
        workshopGroup = 'senior_5_group_a_b';
      }
      else if (crcClassNames.some(name => name.includes('S5 Customer Care'))) {
        workshopGroup = 'senior_5_customer_care';
      }
      // Check for Senior 6 groups
      else if (crcClassNames.some(name => name.includes('S6 Group A+B'))) {
        workshopGroup = 'senior_6_group_a_b';
      }
      else if (crcClassNames.some(name => name.includes('S6 Group C'))) {
        workshopGroup = 'senior_6_group_c';
      }
      else if (crcClassNames.some(name => name.includes('S6 Group D'))) {
        workshopGroup = 'senior_6_group_d';
      }
    }
    
    setEditForm({
      title: workshop.title,
      description: workshop.description,
      presentation_pdf_url: workshop.presentation_url || "",
      workshop_date: workshop.date,
      workshop_group: workshopGroup,
    });
    setEditDialogOpen(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    
    if (name === "presentation_file" && files && files[0]) {
      const file = files[0];
      if (file.type !== 'application/pdf') {
        // You could add error handling here if needed
        return;
      }
      setEditSelectedFile(file);
      
      // Simulate upload progress
      setIsEditUploading(true);
      setTimeout(() => {
        setIsEditUploading(false);
      }, 2000); // 2 second simulation
      return;
    }
    
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    if (!workshopToEdit) return;
    
    setIsUpdating(true);
    
    const updatePromise = (async () => {
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
        
        // Add file if selected
        if (editSelectedFile) {
          formData.append("presentation_file", editSelectedFile);
        }
        
        const result = await updateWorkshopAction({}, formData);
        if (result.status === 'SUCCESS'){
          console.log("Workshop updated successfully");
          setEditDialogOpen(false);
          setWorkshopToEdit(null);
          await fetchDataForGroup(selectedGroup);
          return { success: true };
        } else {
          throw new Error(result.error || "Failed to update workshop");
        }
      } catch (error) {
        console.error("Error updating workshop:", error);
        throw new Error("Failed to update workshop. Please try again.");
      }
    })();

    showToastPromise({
      promise: updatePromise,
      loadingText: 'Updating workshop...',
      successText: 'The workshop has been updated successfully',
      successHeaderText: 'Workshop Updated Successfully',
      errorText: 'We couldn\'t update the workshop. Please try again or contact support.',
      errorHeaderText: 'Failed To Update Workshop',
      direction: 'right'
    });

    try {
      await updatePromise;
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

  const handleAssignmentClick = async (workshop: SupabaseWorkshop) => {
    console.log("🔍 Assignment click for workshop:", workshop.id, workshop.title);
    
    // Set loading state and open dialog immediately
    setIsFetchingAssignment(true);
    setAssignmentDialogOpen(true);
    setSelectedWorkshopForAssignment(workshop);
    
    // Use the existing for-management endpoint to fetch assignment data
    try {
      console.log("🔄 Fetching assignment data for workshop ID:", workshop.id);
      
      // First, get all assignments to find the one for this workshop
      const response = await fetch('/api/admin/assignments/for-management');
      
      if (response.ok) {
        const data = await response.json();
        console.log("🔄 API response:", data);
        
        if (data.assignments && data.assignments.length > 0) {
          // Find the assignment for this specific workshop
          const assignmentForWorkshop = data.assignments.find((assignment: any) => {
            // Check if the assignment belongs to this workshop
            return assignment.workshop_id === workshop.id || 
                   assignment.workshop_title === workshop.title;
          });
          
          if (assignmentForWorkshop) {
            console.log("✅ Assignment found for workshop:", assignmentForWorkshop);
            setSelectedAssignment(assignmentForWorkshop);
          } else {
            console.log("⚠️ No assignment found for this workshop");
            showToastError({
              headerText: 'No Assignment Found',
              paragraphText: 'This workshop does not have any assignments yet.'
            });
            setAssignmentDialogOpen(false);
          }
        } else {
          console.log("⚠️ No assignments found in API response");
          showToastError({
            headerText: 'No Assignment Found',
            paragraphText: 'This workshop does not have any assignments yet.'
          });
          setAssignmentDialogOpen(false);
        }
      } else {
        console.error("❌ API request failed:", response.status, response.statusText);
        showToastError({
          headerText: 'Error',
          paragraphText: 'Failed to fetch assignment data.'
        });
        setAssignmentDialogOpen(false);
      }
    } catch (error) {
      console.error("❌ Error fetching assignment:", error);
      showToastError({
        headerText: 'Error',
        paragraphText: 'Failed to fetch assignment data.'
      });
      setAssignmentDialogOpen(false);
    } finally {
      setIsFetchingAssignment(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    setDeletingAssignmentId(assignmentId);
    
    const deletePromise = (async () => {
      try {
        const result = await deleteAssignmentAction(assignmentId);
        if (result.success) {
          console.log("Assignment deleted successfully");
          setAssignmentDialogOpen(false);
          await fetchDataForGroup(selectedGroup);
          return { success: true };
        } else {
          throw new Error(result.error || "Failed to delete assignment");
        }
      } finally {
        setDeletingAssignmentId(null);
      }
    })();

    showToastPromise({
      promise: deletePromise,
      loadingText: 'Deleting assignment...',
      successText: 'The assignment has been removed',
      successHeaderText: 'Assignment Deleted Successfully',
      errorText: 'We couldn\'t delete the assignment. Please try again or contact support.',
      errorHeaderText: 'Failed To Delete Assignment',
      direction: 'right'
    });
  };

  const handleEditAssignment = (assignment: any) => {
    setAssignmentToEdit(assignment);
    setEditAssignmentForm({
      title: assignment.title,
      description: assignment.description,
      submission_deadline: new Date(assignment.submission_idate).toISOString().split('T')[0],
      submission_style: assignment.submission_style,
    });
    setAssignmentDialogOpen(false);
    setEditAssignmentDialogOpen(true);
  };

  const handleEditAssignmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditAssignmentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditAssignmentSubmit = async () => {
    if (!assignmentToEdit) return;
    
    setIsUpdatingAssignment(true);
    
    const updatePromise = (async () => {
      try {
        // Create FormData for the action
        const formData = new FormData();
        formData.append("assignment_id", assignmentToEdit.id);
        formData.append("title", editAssignmentForm.title);
        formData.append("description", editAssignmentForm.description);
        formData.append("submission_deadline", editAssignmentForm.submission_deadline);
        formData.append("submission_style", editAssignmentForm.submission_style);
        
        const result = await updateAssignmentAction({}, formData);
        if (result.status === 'SUCCESS'){
          console.log("Assignment updated successfully");
          setEditAssignmentDialogOpen(false);
          setAssignmentToEdit(null);
          setSelectedAssignment(null); // Clear selected assignment
          setSelectedWorkshopForAssignment(null); // Clear selected workshop
          
          // Force a complete data refresh
          console.log("🔄 Forcing complete data refresh...");
          await fetchDataForGroup(selectedGroup);
          
          // Also refresh all workshops data to ensure consistency
          try {
            const allWorkshopsData = await fetchWorkshopsFromAPI();
            setAllWorkshops(allWorkshopsData);
            console.log("🔄 All workshops data refreshed");
          } catch (error) {
            console.error("Error refreshing all workshops:", error);
          }
          
          console.log("🔄 Data refresh completed after assignment update");
          return { success: true };
        } else {
          throw new Error(result.error || "Failed to update assignment");
        }
      } catch (error) {
        console.error("Error updating assignment:", error);
        throw new Error("Failed to update assignment. Please try again.");
      } finally {
        setIsUpdatingAssignment(false);
      }
    })();

    showToastPromise({
      promise: updatePromise,
      loadingText: 'Updating assignment...',
      successText: 'The assignment has been updated successfully',
      successHeaderText: 'Assignment Updated Successfully',
      errorText: 'We couldn\'t update the assignment. Please try again or contact support.',
      errorHeaderText: 'Failed To Update Assignment',
      direction: 'right'
    });
  };

  const handleEditAssignmentCancel = () => {
    setEditAssignmentDialogOpen(false);
    setAssignmentToEdit(null);
  };

  const fetchDataForGroup = async (group: string) => {
    setLoading(true);
    try {
      console.log("Fetching data for group:", group);
      
      const allWorkshopsData = await fetchWorkshopsFromAPI();
      setAllWorkshops(allWorkshopsData); // Store all workshops
      
      // Define the CRC class names for each group
      const groupMappings: Record<string, string[]> = {
        'ey': ['EY A', 'EY B', 'EY C', 'EY D'],
        'senior_4': ['S4MPC + S4MEG', 'S4MCE', 'S4HGL + S4PCB'],
        'senior_5_group_a_b': ['S5 Group A+B'],
        'senior_5_customer_care': ['S5 Customer Care'],
        'senior_6_group_a_b': ['S6 Group A+B'],
        'senior_6_group_c': ['S6 Group C'],
        'senior_6_group_d': ['S6 Group D']
      };
      
      const targetClassNames = groupMappings[group] || [];
      
      // Filter workshops by the selected group using the new crc_classes structure
      const filteredWorkshops = allWorkshopsData.filter((workshop: any) => {
        if (!workshop.crc_classes || workshop.crc_classes.length === 0) {
          return false;
        }
        
        // Check if any of the workshop's CRC classes match the target group
        return workshop.crc_classes.some((crcClass: any) => 
          targetClassNames.includes(crcClass.name)
        );
      });
      
      console.log("Filtered workshops for group:", group, filteredWorkshops);
      
      // Debug: Check assignments for each workshop
      console.log("🔄 === WORKSHOP DATA REFRESH ===");
      filteredWorkshops.forEach((workshop: any) => {
        console.log(`🔍 Workshop ${workshop.id} (${workshop.title}):`, {
          hasAssignment: workshop.has_assignment,
          assignmentsCount: workshop.assignments?.length || 0,
          assignments: workshop.assignments
        });
      });
      console.log("🔄 === END WORKSHOP DATA REFRESH ===");
      
      setWorkshops(filteredWorkshops);
    } catch (error) {
      console.error("Error fetching workshops:", error);
      setWorkshops([]);
      setAllWorkshops([]);
    } finally {
      setLoading(false);
    }
  };

  // Sync URL with selectedGroup when component mounts or URL changes
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!searchParams) return;
    
    const groupFromUrl = searchParams.get('group');
    if (!hasInitialized.current && groupFromUrl) {
      setSelectedGroup(groupFromUrl);
      hasInitialized.current = true;
    }
  }, [searchParams]);

  // Load all workshops on component mount
  useEffect(() => {
    const loadAllWorkshops = async () => {
      try {
        const allWorkshopsData = await fetchWorkshopsFromAPI();
        setAllWorkshops(allWorkshopsData);
      } catch (error) {
        console.error("Error loading all workshops:", error);
        setAllWorkshops([]);
      }
    };
    loadAllWorkshops();
  }, []);

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
                          handleGroupChange(group.id);
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
                            onClick={() => handleGroupChange(subItem.id)}
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
                  <Button variant="outline" className="w-full bg-green-600 hover:bg-green-600/80 text-white hover:text-white  shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.1)]  transition duration-200">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Workshop
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Workshop</DialogTitle>
                  </DialogHeader>
                  <form className="space-y-4" onSubmit={handleCreateWorkshopSubmit}>
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
                        <Label className="text-sm font-medium mb-1 block">Workshop Group</Label>
                        <Select 
                          value={form.workshop_group} 
                          onValueChange={(value) => {
                            const event = { target: { name: 'workshop_group', value } } as any;
                            handleFormChange(event);
                          }}
                        >
                          <SelectTrigger className="w-full rounded-xl">
                            <SelectValue placeholder="Select a group" />
                          </SelectTrigger>
                          <SelectContent>
                            {getFlattenedWorkshopGroups().map((group) => (
                              <SelectItem 
                                key={group.id} 
                                value={group.id}
                                disabled={group.label.includes("(Select subgroup)")}
                              >
                                {group.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-1 block">Workshop Date</Label>
                        <Input 
                          name="workshop_date" 
                          type="date" 
                          value={form.workshop_date} 
                          onChange={handleFormChange} 
                          required 
                          className="rounded-xl"
                        />
                        {fieldErrors.workshop_date && fieldErrors.workshop_date.length > 0 && (
                          <div className="text-red-500 text-xs mt-1">{fieldErrors.workshop_date[0]}</div>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-1 block">Presentation PDF</Label>
                        <div className="relative">
                          <input
                            type="file"
                            name="presentation_file"
                            accept=".pdf"
                            onChange={handleFormChange}
                            className="hidden"
                            id="presentation-file-input"
                          />
                          <label
                            htmlFor="presentation-file-input"
                            className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition-colors bg-white"
                          >
                            <span className="text-sm text-gray-600 truncate">
                              {selectedFile ? selectedFile.name : "Choose PDF file..."}
                            </span>
                            {isUploading ? (
                              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4 text-gray-400" />
                            )}
                          </label>
                        </div>
                        {fieldErrors.presentation_pdf_url && fieldErrors.presentation_pdf_url.length > 0 && (
                          <div className="text-red-500 text-xs mt-1">{fieldErrors.presentation_pdf_url[0]}</div>
                        )}
                      </div>
                    </div>



                    {formError && <div className="text-red-500 text-sm">{formError}</div>}
                    
                    {/* Hidden inputs for Select components */}
                    <input type="hidden" name="workshop_group" value={form.workshop_group} />
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" type="button" className="rounded-xl" onClick={() => setIsAddWorkshopOpen(false)} disabled={submitting || isUploading}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isPending || isUploading} className="bg-green-600 hover:bg-green-600/80 rounded-xl text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200">
                        {isPending || isUploading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {isUploading ? "Uploading..." : "Creating..."}
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
                  <Button variant="outline" className="w-full  bg-white hover:bg-gray-50 text-black border-blackshadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] transition duration-200">
                    <Plus className="h-4 w-4 mr-2 ml-2" />
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
                        <Select 
                          value={assignmentForm.crc_class} 
                          onValueChange={(value) => {
                            const event = { target: { name: 'crc_class', value } } as any;
                            handleAssignmentFormChange(event);
                          }}
                        >
                          <SelectTrigger className="w-full rounded-xl">
                            <SelectValue placeholder="Select a class" />
                          </SelectTrigger>
                          <SelectContent>
                            {getFlattenedWorkshopGroups().map((group) => (
                              <SelectItem 
                                key={group.id} 
                                value={group.id}
                                disabled={group.label.includes("(Select subgroup)")}
                              >
                                {group.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-1 block">Workshop</Label>
                        <Select 
                          value={assignmentForm.workshop_id} 
                          onValueChange={(value) => {
                            const event = { target: { name: 'workshop_id', value } } as any;
                            handleAssignmentFormChange(event);
                          }}
                          disabled={!assignmentForm.crc_class || isFetchingWorkshops}
                        >
                          <SelectTrigger className="w-full rounded-xl">
                            <SelectValue placeholder={isFetchingWorkshops ? "Loading workshops..." : "Select a workshop"} />
                          </SelectTrigger>
                          <SelectContent>
                            {!isFetchingWorkshops && allWorkshops
                              .filter(workshop => {
                                // First filter: only show workshops without assignments
                                if (workshop.has_assignment) return false;
                                
                                if (!assignmentForm.crc_class) return true;
                                
                                // Define the CRC class names for each group
                                const groupMappings: Record<string, string[]> = {
                                  'ey': ['EY A', 'EY B', 'EY C', 'EY D'],
                                  'senior_4': ['S4MPC + S4MEG', 'S4MCE', 'S4HGL + S4PCB'],
                                  'senior_5_group_a_b': ['S5 Group A+B'],
                                  'senior_5_customer_care': ['S5 Customer Care'],
                                  'senior_6_group_a_b': ['S6 Group A+B'],
                                  'senior_6_group_c': ['S6 Group C'],
                                  'senior_6_group_d': ['S6 Group D']
                                };
                                
                                const targetClassNames = groupMappings[assignmentForm.crc_class] || [];
                                
                                // Check if the workshop has CRC classes that match the selected group
                                return workshop.crc_classes && workshop.crc_classes.some(crcClass => 
                                  targetClassNames.includes(crcClass.name)
                                );
                              })
                              .map((workshop) => (
                                <SelectItem key={workshop.id} value={workshop.id}>
                                  {workshop.title}
                                </SelectItem>
                              ))}
                            {!isFetchingWorkshops && assignmentForm.crc_class && (() => {
                              const filteredWorkshops = allWorkshops.filter(workshop => {
                                // First filter: only show workshops without assignments
                                if (workshop.has_assignment) return false;
                                
                                // Define the CRC class names for each group
                                const groupMappings: Record<string, string[]> = {
                                  'ey': ['EY A', 'EY B', 'EY C', 'EY D'],
                                  'senior_4': ['S4MPC + S4MEG', 'S4MCE', 'S4HGL + S4PCB'],
                                  'senior_5_group_a_b': ['S5 Group A+B'],
                                  'senior_5_customer_care': ['S5 Customer Care'],
                                  'senior_6_group_a_b': ['S6 Group A+B'],
                                  'senior_6_group_c': ['S6 Group C'],
                                  'senior_6_group_d': ['S6 Group D']
                                };
                                
                                const targetClassNames = groupMappings[assignmentForm.crc_class] || [];
                                
                                // Check if the workshop has CRC classes that match the selected group
                                return workshop.crc_classes && workshop.crc_classes.some(crcClass => 
                                  targetClassNames.includes(crcClass.name)
                                );
                              });
                              
                              return filteredWorkshops.length === 0 && (
                                <SelectItem value="no-workshops" disabled>
                                  No workshops found for this class
                                </SelectItem>
                              );
                            })()}
                          </SelectContent>
                        </Select>
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
                          className="rounded-xl"
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
                        className="rounded-xl"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-1 block">Submission Deadline</Label>
                        <DateTimePicker
                          value={assignmentForm.submission_deadline || undefined}
                          onChange={(date) => {
                            setAssignmentForm(prev => ({
                              ...prev,
                              submission_deadline: date || null
                            }));
                          }}
                          placeholder="Pick deadline date & time"
                          granularity="minute"
                          hourCycle={24}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Select both date and time for when the assignment is due
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-1 block">Submission Style</Label>
                        <Select 
                          value={assignmentForm.submission_style} 
                          onValueChange={(value) => {
                            const event = { target: { name: 'submission_style', value } } as any;
                            handleAssignmentFormChange(event);
                          }}
                        >
                          <SelectTrigger className="w-full rounded-xl">
                            <SelectValue placeholder="Select submission style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="google_link">Google Link</SelectItem>
                            <SelectItem value="file_upload">File Upload</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Hidden inputs to submit the form data */}
                    <input type="hidden" name="workshop_id" value={assignmentForm.workshop_id} />
                    <input type="hidden" name="crc_class" value={assignmentForm.crc_class} />
                    <input type="hidden" name="submission_style" value={assignmentForm.submission_style} />
                    <input type="hidden" name="submission_deadline" value={assignmentForm.submission_deadline ? assignmentForm.submission_deadline.toISOString() : ''} />
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" type="button" className="rounded-xl" onClick={() => setIsAddAssignmentOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-green-600 hover:bg-green-700 rounded-xl text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200" disabled={isAssignmentPending || !assignmentForm.submission_deadline}>
                        {isAssignmentPending ? (
                          <div className="flex items-center justify-center">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          </div>
                        ) : (
                          "Add Assignment"
                        )}
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
                        {Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="h-5 bg-gray-200 rounded w-36 animate-pulse"></div>
                            </TableCell>
                            <TableCell>
                              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                            </TableCell>
                            <TableCell>
                              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                            </TableCell>
                            <TableCell>
                              <div className="h-6 bg-gray-200 rounded-full w-12 animate-pulse"></div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
                        {paginatedWorkshops.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              No workshops found for {groupLabelFor(selectedGroup).toLowerCase()}
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedWorkshops.map((workshop) => (
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
                                <Badge 
                                  className={`cursor-pointer transition-all ${
                                    workshop.has_assignment 
                                      ? "bg-blue-100 text-blue-700 border-blue-600 hover:bg-blue-200 hover:scale-105" 
                                      : "bg-green-100 text-green-700 border-green-600 hover:bg-green-200 hover:scale-105"
                                  }`}
                                  onClick={() => workshop.has_assignment && handleAssignmentClick(workshop)}
                                >
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
                                    disabled={deletingWorkshopId === workshop.id}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    {deletingWorkshopId === workshop.id ? (
                                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                    ) : (
                                      <Trash2 className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Pagination Controls */}
              {!loading && filteredWorkshops.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white/80 border border-gray-300/80 rounded-lg mt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Rows per page:</span>
                      <Select value={rowsPerPage.toString()} onValueChange={(value) => {
                        setRowsPerPage(parseInt(value));
                        setCurrentPage(1);
                      }}>
                        <SelectTrigger className="w-20 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <span className="text-sm text-gray-600">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredWorkshops.length)} of {filteredWorkshops.length} results
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronDown className="h-4 w-4 rotate-90" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`h-8 w-8 p-0 ${currentPage === pageNum ? 'bg-black text-white border-black hover:bg-black hover:text-white' : 'bg-white text-black border-gray-300 hover:bg-gray-100 hover:text-black border border-black/20'}`}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronDown className="h-4 w-4 -rotate-90" />
                    </Button>
                  </div>
                </div>
              )}
              
              {!loading && filteredWorkshops.length === 0 && (
                <div className="text-center py-8 text-gray-600">
                  {workshops.length === 0 ? "No workshops found." : "No workshops found matching your search criteria."}
                </div>
              )}
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
                <Label htmlFor="edit-pdf-url">Presentation PDF</Label>
                <div className="relative">
                  <input
                    type="file"
                    name="presentation_file"
                    accept=".pdf"
                    onChange={handleEditFormChange}
                    className="hidden"
                    id="edit-presentation-file-input"
                  />
                  <label
                    htmlFor="edit-presentation-file-input"
                    className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <span className="text-sm text-gray-600 truncate">
                      {editSelectedFile ? editSelectedFile.name : "Choose PDF file..."}
                    </span>
                    {isEditUploading ? (
                      <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 text-gray-400" />
                    )}
                  </label>
                </div>
              </div>
            </div>


          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={handleEditCancel}
              disabled={isUpdating || isEditUploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditSubmit} 
              disabled={isUpdating || isEditUploading}
              className="bg-green-600 hover:bg-green-700 text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200"
            >
              {isUpdating || isEditUploading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditUploading ? "Uploading..." : "Updating..."}
                </div>
              ) : (
                "Update Workshop"
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
              className="bg-red-600 hover:bg-red-700 text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(220,38,38,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(220,38,38,0.1)] transition duration-200"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assignment Details Dialog */}
      <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-sky-600 flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl font-bold text-gray-900">Assignment Details</DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  {selectedWorkshopForAssignment?.title}
                </DialogDescription>
              </div>
              {selectedAssignment && !isFetchingAssignment && (
                <Badge className="bg-purple-100 text-purple-600 text-xs font-normal border-purple-600 hover:text-purple-600 hover:border-purple-600 px-2 py-1">
                  Created {new Date(selectedAssignment.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Badge>
              )}
            </div>
          </DialogHeader>
          
          {isFetchingAssignment ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-2 border-sky-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading assignment details...</p>
              </div>
            </div>
          ) : selectedAssignment ? (
            <div className="space-y-4">
              {/* Assignment Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Title</Label>
                </div>
                <p className="text-gray-800 ml-6 ">{selectedAssignment.title}</p>
              </div>


              {/* Description */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Description</Label>
                </div>
                <p className="text-gray-800 ml-6 leading-relaxed">{selectedAssignment.description}</p>
              </div>
              <div className="flex justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-green-600" />
                    <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Submission Style</Label>
                  </div>
                  <p className="text-gray-800 ml-6 capitalize">{selectedAssignment.submission_style.replace('_', ' ')}</p>
                </div>

                {/* Submission Date */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    <Label className="text-sm font-medium text-gray-600 uppercase tracking-wide">Submission Deadline</Label>
                  </div>
                  <p className="text-gray-800 ml-6">{new Date(selectedAssignment.submission_idate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}</p>
                </div>
                 
               </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  onClick={() => setAssignmentDialogOpen(false)}
                  className="px-4 py-2"
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleEditAssignment(selectedAssignment)}
                  className="px-4 py-2 text-blue-700 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Assignment
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleDeleteAssignment(selectedAssignment.id)}
                  disabled={deletingAssignmentId === selectedAssignment.id}
                  className="px-4 py-2"
                >
                  {deletingAssignmentId === selectedAssignment.id ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Assignment
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog open={editAssignmentDialogOpen} onOpenChange={setEditAssignmentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <DialogDescription>
              Update assignment details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-assignment-title">Title</Label><kbd></kbd>
              <Input
                id="edit-assignment-title"
                name="title"
                value={editAssignmentForm.title}
                onChange={handleEditAssignmentFormChange}
                placeholder="Enter assignment title"
                required
                className="rounded-xl"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-assignment-description">Description</Label>
              <Textarea
                id="edit-assignment-description"
                name="description"
                value={editAssignmentForm.description}
                onChange={handleEditAssignmentFormChange}
                placeholder="Enter assignment description"
                required
                rows={3}
                className="rounded-xl"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-assignment-deadline">Submission Deadline</Label>
                <Input
                  id="edit-assignment-deadline"
                  name="submission_deadline"
                  type="date"
                  value={editAssignmentForm.submission_deadline}
                  onChange={handleEditAssignmentFormChange}
                  required
                  className="rounded-xl"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-assignment-style">Submission Style</Label>
                <Select 
                  value={editAssignmentForm.submission_style} 
                  onValueChange={(value) => {
                    const event = { target: { name: 'submission_style', value } } as any;
                    handleEditAssignmentFormChange(event);
                  }}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select submission style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google_link">Google Link</SelectItem>
                    <SelectItem value="file_upload">File Upload</SelectItem>
                    <SelectItem value="text">Text Input</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={handleEditAssignmentCancel}
              disabled={isUpdatingAssignment}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditAssignmentSubmit} 
              disabled={isUpdatingAssignment}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200"
            >
              {isUpdatingAssignment ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </div>
              ) : (
                "Update Assignment"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 