"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Plus, Edit, Trash2, Bell, X, Loader2, Calendar, Clock } from "lucide-react";
import { Button } from "../../../../../../zenith/src/components/ui/button";
import { Input } from "../../../../../../zenith/src/components/ui/input";
import { Badge } from "../../../../../../zenith/src/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../zenith/src/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../../../../zenith/src/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../../../zenith/src/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../../zenith/src/components/ui/select";
import { Label } from "../../../../../../zenith/src/components/ui/label";
import { Textarea } from "../../../../../../zenith/src/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../../../../../zenith/src/components/ui/alert-dialog";
import { ChevronDown } from "lucide-react";

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
    if (page === 'senior_6_group_a_b_workshops') return 'Senior 6 Group A&B Workshops';
    if (page === 'senior_6_group_c_workshops') return 'Senior 6 Group C Workshops';
    if (page === 'senior_6_group_d') return 'Senior 6 Group D';
    if (page === 'job_readiness_course') return 'Job Readiness Course';
    if (page === 'student_dashboard') return 'Student Dashboard';
    if (page === 'admin_dashboard') return 'Admin Dashboard';
    return page.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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
      try {
        const response = await fetch('/api/announcements/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingAnnouncement.id,
            message: formData.message,
            page: formData.page,
            end_time: formData.end_time || null,
            is_active: formData.is_active,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update announcement');
        }

        const { announcement: updatedAnnouncement } = await response.json();
        
        // Update the local state with the updated announcement
        setAnnouncements(prev => 
          prev.map(announcement => 
            announcement.id === editingAnnouncement.id 
              ? updatedAnnouncement
              : announcement
          )
        );
        
        setIsEditDialogOpen(false);
        setEditingAnnouncement(null);
      } catch (error) {
        console.error('Error updating announcement:', error);
        // You could add error state handling here
        alert('Failed to update announcement. Please try again.');
      } finally {
        setIsUpdating(false);
      }
    } else {
      // Create new announcement
      setIsCreating(true);
      try {
        // Simulate API delay for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newAnnouncement: Announcement = {
          id: Date.now().toString(),
          ...formData,
          end_time: formData.end_time || null,
          created_at: new Date().toISOString()
        };
        setAnnouncements(prev => [newAnnouncement, ...prev]);
        setIsCreateDialogOpen(false);
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
    setDeletingAnnouncement(announcement);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (deletingAnnouncement) {
      setAnnouncements(prev => prev.filter(n => n.id !== deletingAnnouncement.id));
      setDeletingAnnouncement(null);
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

  return (
    <div className="p-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold font-cal-sans text-gray-800 mb-3">Announcements</h1>
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
                <Button className="bg-black hover:bg-gray-800 text-white shadow-lg whitespace-nowrap">
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
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message" 
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Enter announcement message" 
                        required
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="page">Target Page</Label>
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
                        disabled={isCreating}
                        className="bg-black hover:bg-gray-800 text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200"
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
              <PopoverContent className="w-80 p-4">
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
                  
                  <div className="grid grid-cols-2 gap-2">
                    {availablePages.map(page => (
                      <Button
                        key={page}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageToggle(page)}
                        className={`justify-start cursor-pointer ${filters.page.includes(page) ? 'bg-black text-white border-black hover:bg-black hover:text-white' : 'hover:bg-transparent'}`}
                      >
                        {page.charAt(0).toUpperCase() + page.slice(1).replace('-', ' ')}
                      </Button>
                    ))}
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
                        className={`justify-start cursor-pointer ${filters.status.includes(status) ? 'bg-black text-white border-black hover:bg-black hover:text-white' : 'hover:bg-transparent'}`}
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
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Bell className="h-4 w-4" />
                          </div>
                          <div className="text-sm text-gray-700 max-w-xs">
                            {announcement.message}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="bg-white/80">
                        <Badge variant="outline">
                          {formatPageLabel(announcement.page)}
                        </Badge>
                      </TableCell>
                      <TableCell className="bg-white/80">
                        <Badge 
                          className={status === "active" 
                            ? "bg-blue-100 text-blue-600 border-blue-600" 
                            : "bg-red-100 text-red-600 border-red-600"
                          }
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
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-1 text-red-600 hover:text-red-700"
                                onClick={() => handleDelete(announcement)}
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this announcement? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="h-8 w-8 p-0"
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
                <Textarea 
                  id="edit-message" 
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter announcement message" 
                  required
                  rows={4}
                />
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
                  className="bg-black hover:bg-gray-800 text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200"
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