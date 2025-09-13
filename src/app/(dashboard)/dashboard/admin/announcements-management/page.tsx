"use client";

import { useState, useEffect } from "react";
import '@uiw/react-md-editor/markdown-editor.css';
import { Search, Filter, Plus, Edit, Trash2, Bell, X, Loader2, Calendar, Clock } from "lucide-react";
import { Button } from "../../../../../../zenith/src/components/ui/button";
import { Input } from "../../../../../../zenith/src/components/ui/input";
import { Badge } from "../../../../../../zenith/src/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../zenith/src/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../../../../../../zenith/src/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../../../zenith/src/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../../zenith/src/components/ui/select";
import { Label } from "../../../../../../zenith/src/components/ui/label";
import { Textarea } from "../../../../../../zenith/src/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../../../../../zenith/src/components/ui/alert-dialog";
import { ChevronDown } from "lucide-react";
import { showToastSuccess, showToastError, showToastPromise } from "@/components/toasts";
import MDEditor from '@uiw/react-md-editor';
import MarkdownIt from 'markdown-it';

// Types
interface Announcement {
  id: string;
  message: string;
  page: string;
  end_time: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AnnouncementsManagement() {
  // Initialize MarkdownIt instance with link handling
  const md = new MarkdownIt({
    linkify: true,
    breaks: true
  });
  
  // Configure link rendering to open external links in new tab
  const defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };
  
  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const hrefIndex = token.attrIndex('href');
    
    if (hrefIndex >= 0 && token.attrs) {
      const href = token.attrs[hrefIndex][1];
      
      if (href) {
        // Check if it's an external link (starts with http:// or https://)
        if (href.startsWith('http://') || href.startsWith('https://')) {
          // Add target="_blank" and rel="noopener noreferrer" for external links
          token.attrPush(['target', '_blank']);
          token.attrPush(['rel', 'noopener noreferrer']);
        }
        // For relative links (internal navigation), ensure they work properly
        else if (href.startsWith('/')) {
          // Internal links - no target="_blank" needed
          // They will navigate within your app
        }
        // For anchor links (#section), no special handling needed
        else if (href.startsWith('#')) {
          // Anchor links - no target="_blank" needed
        }
        // For other relative links, ensure they work properly
        else {
          // Other relative links - no target="_blank" needed
        }
      }
    }
    
    return defaultRender(tokens, idx, options, env, self);
  };
  
  // Custom CSS for markdown content
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .announcement-markdown {
        background: transparent !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .announcement-markdown h1,
      .announcement-markdown h2,
      .announcement-markdown h3,
      .announcement-markdown h4,
      .announcement-markdown h5,
      .announcement-markdown h6 {
        margin: 0.5em 0 0.25em 0 !important;
        font-size: inherit !important;
        font-weight: 600 !important;
      }
      .announcement-markdown p {
        margin: 0.25em 0 !important;
      }
      .announcement-markdown ul,
      .announcement-markdown ol {
        margin: 0.25em 0 !important;
        padding-left: 1.5em !important;
      }
      .announcement-markdown li {
        margin: 0.1em 0 !important;
      }
      .announcement-markdown strong {
        font-weight: 600 !important;
      }
      .announcement-markdown em {
        font-style: italic !important;
      }
      .announcement-markdown code {
        background: rgba(0,0,0,0.1) !important;
        padding: 0.1em 0.3em !important;
        border-radius: 0.2em !important;
        font-size: 0.9em !important;
      }
      .announcement-markdown a {
        color: #3b82f6 !important;
        text-decoration: underline !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        border-radius: 2px !important;
        padding: 1px 2px !important;
      }
      .announcement-markdown a:hover {
        color: #1d4ed8 !important;
        text-decoration: underline !important;
        background-color: rgba(59, 130, 246, 0.1) !important;
        text-decoration-thickness: 2px !important;
      }
      .announcement-markdown a:focus {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px !important;
      }
      .announcement-markdown blockquote {
        border-left: 3px solid #e5e7eb !important;
        padding-left: 1em !important;
        margin: 0.5em 0 !important;
        font-style: italic !important;
        color: #6b7280 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Format page labels for better display
  const formatPageLabel = (page: string) => {
    if (page === 'english_language_learning') return 'English Learning';
    if (page === 'upcoming_events') return 'Upcoming Events';
    if (page === 'previous_events') return 'Previous Events';
    if (page === 'new_opportunities') return 'New Opportunities';
    if (page === 'recurring_opportunities') return 'Recurring Opportunities';
    if (page === 'approved_opportunities') return 'Approved Opportunities';
    if (page === 's4_workshops') return 'S4 Workshops';
    if (page === 'ey_workshops') return 'EY Workshops';
    if (page === 'senior_5_group_a_b_workshops') return 'Senior 5 Group A&B Workshops';
    if (page === 'senior_5_customer_care') return 'Senior 5 Customer Care';
    if (page === 'senior_6_group_c_workshops') return 'Senior 6 Group C Workshops';
    if (page === 'senior_6_group_d') return 'Senior 6 Group D';
    if (page === 'job_readiness_course') return 'Job Readiness Course';
    if (page === 'student_dashboard') return 'Student Dashboard';
    if (page === 'admin_dashboard') return 'Admin Dashboard';
    if (page ==='crp') return 'CRP';
    return page.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Get page-specific colors for badges using custom tailwind colors
  const getPageColor = (page: string) => {
    switch (page) {
      case 'home':
        return 'bg-statColors-1/40 text-complementary border-none';
      case 'new_opportunities':
        return 'bg-statColors-2/40 text-complementary border-none';
      case 'recurring_opportunities':
        return 'bg-statColors-3/40 text-complementary border-none';
      case 'templates':
        return 'bg-statColors-4/40 text-complementary border-none';
      case 'crp':
        return 'bg-statColors-5/40 text-complementary border-none';
      case 'internships':
        return 'bg-statColors-6/40 text-complementary border-none';
      case 'english_language_learning':
        return 'bg-statColors-7/40 text-complementary border-none';
      case 'approved_opportunities':
        return 'bg-statColors-8/40 text-complementary border-none';
      case 'previous_events':
        return 'bg-yearcolors-s4 text-complementary border-yearcolors-s4';
      case 'upcoming_events':
        return 'bg-yearcolors-ey text-complementary border-yearcolors-ey';
      case 's4_workshops':
        return 'bg-yearcolors-s4 text-complementary border-yearcolors-s4';
      case 'ey_workshops':
        return 'bg-yearcolors-ey text-complementary border-yearcolors-ey';
      case 'senior_5_group_a_b_workshops':
        return 'bg-yearcolors-s5 text-complementary border-yearcolors-s5';
      case 'senior_5_customer_care':
        return 'bg-yearcolors-s5 text-complementary border-yearcolors-s5';
      case 'senior_6_group_a_b_workshops':
        return 'bg-yearcolors-s6 text-complementary border-yearcolors-s6';
      case 'senior_6_group_c_workshops':
        return 'bg-yearcolors-s6 text-complementary border-yearcolors-s6';
      case 'senior_6_group_d':
        return 'bg-yearcolors-s6 text-complementary border-yearcolors-s6';
      case 'job_readiness_course':
        return 'bg-gradecolors-50 text-complementary border-gradecolors-50';
      case 'student_dashboard':
        return 'bg-primary/40 text-complementary border-none';
      case 'admin_dashboard':
        return 'bg-secondary/40 text-complementary border-none';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ 
    page: [] as string[], 
    status: [] as string[]
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    message: "",
    page: "",
    end_time: "",
    is_active: true
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Available pages for announcements (matching notification_page enum)
  const availablePages = [
    "home",
    "new_opportunities", 
    "recurring_opportunities",
    "templates",
    "crp",
    "internships",
    "english_language_learning",
    "approved_opportunities",
    "previous_events",
    "upcoming_events",
    "s4_workshops",
    "ey_workshops",
    "senior_5_group_a_b_workshops",
    "senior_5_customer_care",
    "senior_6_group_a_b_workshops",
    "senior_6_group_c_workshops",
    "senior_6_group_d",
    "job_readiness_course",
    "student_dashboard",
    "admin_dashboard"
  ];

  // Filter announcements based on search term and filters
  const filteredAnnouncements = announcements.filter(announcement => {
    // Search term filtering (case-insensitive)
    const searchMatch = searchTerm === "" || 
      announcement.message.toLowerCase().includes(searchTerm.toLowerCase());

    // Page filtering
    const pageMatch = filters.page.length === 0 || filters.page.includes(announcement.page);

    // Status filtering
    const statusMatch = filters.status.length === 0 || 
      filters.status.some(status => {
        if (status === "active") return announcement.is_active;
        if (status === "inactive") return !announcement.is_active;
        return false;
      });

    return searchMatch && pageMatch && statusMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAnnouncements.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedAnnouncements = filteredAnnouncements.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // Helper functions for multi-select
  const handlePageToggle = (page: string) => {
    setFilters(prev => ({
      ...prev,
      page: prev.page.includes(page) 
        ? prev.page.filter(p => p !== page)
        : [...prev.page, page]
    }));
  };

  const handleStatusToggle = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status) 
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  // Get announcement status
  const getAnnouncementStatus = (announcement: Announcement) => {
    return announcement.is_active ? "active" : "inactive";
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "inactive": return "destructive";
      default: return "outline";
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No end date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date for datetime-local input
  const formatDateTimeLocal = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Format to YYYY-MM-DDTHH:mm format required by datetime-local input
    return date.toISOString().slice(0, 16);
  };

  // Load announcements from Supabase
  useEffect(() => {
    const loadAnnouncements = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/announcements/fetch');
        if (!response.ok) {
          throw new Error('Failed to fetch announcements');
        }
        const data = await response.json();
        setAnnouncements(data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        // Fallback to empty array if fetch fails
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  // Handle form submission for create/edit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAnnouncement) {
      // Update existing announcement
      setIsUpdating(true);
      
      const updatePromise = fetch('/api/announcements/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingAnnouncement.id,
          message: formData.message,
          page: formData.page,
          end_time: formData.end_time && formData.end_time.trim() !== '' ? formData.end_time : null,
          is_active: formData.is_active,
        }),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to update announcement');
        }
        
        // Close the dialog
        setIsEditDialogOpen(false);
        setEditingAnnouncement(null);
        
        // Reload the page to show the updated announcement
        window.location.reload();
        
        return response.json();
      });

      showToastPromise({
        promise: updatePromise,
        loadingText: 'Updating announcement...',
        successText: 'Your announcement has been saved with the latest changes',
        errorText: 'Failed to update announcement. Please try again.',
        successHeaderText: 'Announcement Updated Successfully',
        errorHeaderText: 'Error Updating Announcement',
        direction: 'right'
      });
      
      try {
        await updatePromise;
      } catch (error) {
        console.error('Error updating announcement:', error);
      } finally {
        setIsUpdating(false);
      }
    } else {
      // Check if trying to create a home page announcement when one already exists
      if (formData.page === 'home') {
        const existingHomeAnnouncement = announcements.find(announcement => 
          announcement.page === 'home'
        );
        
        if (existingHomeAnnouncement) {
          showToastError({
            headerText: 'Home Page Announcement Exists',
            paragraphText: 'Only one announcement can exist for the home page. Please edit the existing one or choose a different page.',
            direction: 'right'
          });
          return; // Stop the function execution
        }
      }
      
      // Create new announcement
      setIsCreating(true);
      
      const createPromise = fetch('/api/announcements/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: formData.message,
          page: formData.page,
          end_time: formData.end_time && formData.end_time.trim() !== '' ? formData.end_time : null,
          is_active: formData.is_active,
        }),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to create announcement');
        }
        
        // Close the dialog
        setIsCreateDialogOpen(false);
        
        // Reload the page to show the new announcement
        window.location.reload();
        
        return response.json();
      });

      showToastPromise({
        promise: createPromise,
        loadingText: 'Creating announcement...',
        successText: 'Your announcement is now visible to everyone.',
        errorText: 'Failed to create announcement. Please try again.',
        successHeaderText: 'Announcement Created Successfully',
        errorHeaderText: 'Error Creating Announcement',
        direction: 'right'
      });
      
      try {
        await createPromise;
      } finally {
        setIsCreating(false);
      }
    }

    // Reset form
    setFormData({
      message: "",
      page: "",
      end_time: "",
      is_active: true
    });
  };

  // Handle edit
  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      message: announcement.message,
      page: announcement.page,
      end_time: formatDateTimeLocal(announcement.end_time),
      is_active: announcement.is_active
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete
  const handleDelete = (announcement: Announcement) => {
    console.log('🗑️ handleDelete called for announcement:', announcement);
    setDeletingAnnouncement(announcement);
    console.log('✅ deletingAnnouncement set to:', announcement);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (deletingAnnouncement) {
      setIsDeleting(true);
      
      const deletePromise = fetch('/api/announcements/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: deletingAnnouncement.id,
        }),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to delete announcement');
        }
        
        // Remove from local state
        setAnnouncements(prev => prev.filter(n => n.id !== deletingAnnouncement.id));
        setDeletingAnnouncement(null);
        
        // Refresh announcements from database to ensure consistency
        const refreshResponse = await fetch('/api/announcements/fetch');
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setAnnouncements(refreshData);
        }
        
        return response.json();
      });

      showToastPromise({
        promise: deletePromise,
        loadingText: 'Deleting announcement...',
        successText: 'Your announcement has been removed from the system.',
        errorText: 'Failed to delete announcement. Please try again.',
        successHeaderText: 'Announcement Deleted Successfully',
        errorHeaderText: 'Error Deleting Announcement',
        direction: 'right'
      });
      
      try {
        await deletePromise;
      } catch (error) {
        console.error('Error deleting announcement:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Reset form when dialogs close
  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setIsCreating(false);
    setFormData({
      message: "",
      page: "",
      end_time: "",
      is_active: true
    });
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingAnnouncement(null);
    setIsUpdating(false);
    setFormData({
      message: "",
      page: "",
      end_time: "",
      is_active: true
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeletingAnnouncement(null);
    setIsDeleting(false);
  };



  return (
    <div className="p-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold font-cal-sans text-gray-800 mb-1">Announcements</h1>
          <p className="text-md text-gray-600">
            Manage announcements across pages
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Search Bar and Create Button Row */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search announcements by message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 bg-white/80 border-gray-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200 whitespace-nowrap">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Announcement</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleFormSubmit}>
                  <div className="space-y-4">
                   
                    <div>
                      <Label htmlFor="message">Message <span className="text-red-500">*</span></Label>
                      <div data-color-mode="light">
                        <MDEditor 
                          value={formData.message} 
                          onChange={(value) => setFormData(prev => ({ ...prev, message: value || "" }))}
                          preview="live"
                          height={200}
                          textareaProps={{
                            placeholder: "Enter announcement message (supports markdown)...",
                            required: true
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Supports markdown formatting (bold, italic, lists, links, etc.)
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="page">Target Page <span className="text-red-500">*</span></Label>
                      <Select value={formData.page} onValueChange={(value) => setFormData(prev => ({ ...prev, page: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a page" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePages.map(page => (
                            <SelectItem key={page} value={page}>
                              {formatPageLabel(page)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="end_time">End Time <span className="text-xs text-gray-500">(optional)</span></Label>
                      <Input 
                        id="end_time" 
                        type="datetime-local"
                        value={formData.end_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                        placeholder="Leave empty for indefinite duration"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave empty if the announcement should remain active indefinitely</p>
                    </div>
                    
                  
                 
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        type="button" 
                        onClick={handleCloseCreateDialog}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isCreating || !formData.message.trim() || !formData.page}
                        className="bg-orange-500 hover:bg-orange-600 text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCreating ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : (
                          'Create Announcement'
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Filters Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full gap-2 justify-between bg-white/80 border-gray-300/80 hover:bg-white/90">
                  <span>Page</span>
                  {filters.page.length > 0 && (
                    <Badge variant="outline" className="ml-1">
                      {filters.page.length}
                    </Badge>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Select Pages</h4>
                  
                  {filters.page.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {filters.page.map(page => (
                        <Badge key={page} variant="outline" className="gap-1">
                          {page.charAt(0).toUpperCase() + page.slice(1).replace('-', ' ')}
                          <button
                            onClick={() => handlePageToggle(page)}
                            className="ml-1 hover:bg-gray-200 rounded-full w-4 h-4 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFilters(prev => ({ ...prev, page: [] }))}
                        className="h-6 px-2 text-xs"
                      >
                        Clear All
                      </Button>
                    </div>
                  )}
                  
                  <div className="max-h-64 overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 gap-3">
                      {availablePages.map(page => (
                        <Button
                          key={page}
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageToggle(page)}
                          className={`justify-start cursor-pointer h-auto py-4 px-4 text-left min-h-[60px] transition-none ${filters.page.includes(page) ? 'bg-black text-white border-black hover:bg-black hover:text-white' : 'hover:bg-transparent'}`}
                        >
                          <span className="whitespace-normal text-sm leading-relaxed">
                            {formatPageLabel(page)}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full gap-2 justify-between bg-white/80 border-gray-300/80">
                  <span>Status</span>
                  {filters.status.length > 0 && (
                    <Badge variant="outline" className="ml-1">
                      {filters.status.length}
                    </Badge>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Select Status</h4>
                  
                  {filters.status.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {filters.status.map(status => (
                        <Badge key={status} variant="outline" className="gap-1">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                          <button
                            onClick={() => handleStatusToggle(status)}
                            className="ml-1 hover:bg-gray-200 rounded-full w-4 h-4 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFilters(prev => ({ ...prev, status: [] }))}
                        className="h-6 px-2 text-xs"
                      >
                        Clear All
                      </Button>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2">
                    {["active", "inactive"].map(status => (
                      <Button
                        key={status}
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusToggle(status)}
                        className={`justify-start cursor-pointer ${filters.status.includes(status) ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600 hover:text-white' : 'hover:bg-transparent'}`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {/* Announcements Table */}
        <div className="border border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-white/80 first:rounded-tl-lg">Message</TableHead>
                <TableHead className="bg-white/80">Page</TableHead>
                <TableHead className="bg-white/80">Status</TableHead>
                <TableHead className="bg-white/80">End Time</TableHead>
                <TableHead className="bg-white/80 last:rounded-tr-lg">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="bg-white/80">
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </TableCell>
                    <TableCell className="bg-white/80">
                      <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </TableCell>
                    <TableCell className="bg-white/80">
                      <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </TableCell>
                    <TableCell className="bg-white/80">
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </TableCell>
                    <TableCell className="bg-white/80">
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                        <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                paginatedAnnouncements.map(announcement => {
                  const status = getAnnouncementStatus(announcement);
                  return (
                    <TableRow key={announcement.id}>
                      <TableCell className="bg-white/80">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bell className="h-4 w-4" />
                          </div>
                          <div className="text-sm text-gray-700 max-w-xs">
                            <div 
                              className="announcement-markdown"
                              dangerouslySetInnerHTML={{ 
                                __html: md.render(announcement.message) 
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="bg-white/80">
                        <Badge 
                          variant="outline" 
                          className={getPageColor(announcement.page)}
                        >
                          {formatPageLabel(announcement.page)}
                        </Badge>
                      </TableCell>
                      <TableCell className="bg-white/80">
                        <Badge 
                          className={`${status === "active" 
                            ? "bg-blue-100 text-blue-600 border-blue-600" 
                            : "bg-red-100 text-red-600 border-red-600"
                          } hover:no-underline hover:bg-opacity-100 hover:scale-100 transition-none`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="bg-white/80">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="h-3 w-3" />
                          {formatDate(announcement.end_time)}
                        </div>
                      </TableCell>
                      <TableCell className="bg-white/80">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleEdit(announcement)}
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-1 text-red-600 hover:text-red-700"
                                onClick={() => handleDelete(announcement)}
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Announcement</DialogTitle>
                                <p className="text-sm text-gray-600">
                                  Are you sure you want to delete this announcement? This action cannot be undone.
                                </p>
                              </DialogHeader>
                              <div className="flex justify-end gap-2 pt-4">
                                <Button 
                                  variant="outline" 
                                  disabled={isDeleting}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={confirmDelete} 
                                  disabled={isDeleting}
                                  className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isDeleting ? (
                                    <div className="flex items-center gap-2">
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Deleting...
                                    </div>
                                  ) : (
                                    'Delete'
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination Controls */}
        {!loading && filteredAnnouncements.length > 0 && (
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
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAnnouncements.length)} of {filteredAnnouncements.length} results
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
                      className={`h-8 w-8 p-0 ${currentPage === pageNum ? 'bg-black text-white border-black hover:bg-black hover:text-white' : ''}`}
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
        
        {!loading && filteredAnnouncements.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            {announcements.length === 0 ? "No announcements found." : "No announcements found matching your search criteria."}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-message">Message</Label>
                <div data-color-mode="light">
                  <MDEditor 
                    value={formData.message} 
                    onChange={(value) => setFormData(prev => ({ ...prev, message: value || "" }))}
                    preview="live"
                    height={200}
                    textareaProps={{
                      placeholder: "Enter announcement message (supports markdown)...",
                      required: true
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Supports markdown formatting (bold, italic, lists, links, etc.)
                </p>
              </div>
              <div>
                <Label htmlFor="edit-page">Target Page</Label>
                <Select value={formData.page} onValueChange={(value) => setFormData(prev => ({ ...prev, page: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a page" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePages.map(page => (
                      <SelectItem key={page} value={page}>
                        {formatPageLabel(page)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-end-time">End Time <span className="text-xs text-gray-500">(optional)</span></Label>
                <Input 
                  id="edit-end-time" 
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  placeholder="Leave empty for indefinite duration"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty if the announcement should remain active indefinitely</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-is-active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="edit-is-active">Active</Label>
              </div>
             
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={handleCloseEditDialog}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isUpdating}
                  className="bg-orange-500 hover:bg-orange-600 text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200"
                >
                  {isUpdating ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    'Update Announcement'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 