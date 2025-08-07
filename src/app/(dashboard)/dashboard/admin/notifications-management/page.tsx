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
interface Notification {
  id: string;
  message: string;
  page: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export default function NotificationsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ 
    page: [] as string[], 
    status: [] as string[]
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [deletingNotification, setDeletingNotification] = useState<Notification | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    message: "",
    page: "",
    start_time: "",
    end_time: "",
    is_active: true
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Available pages for notifications
  const availablePages = [
    "home", "assignments", "resources", "events", "workshops", 
    "student-dashboard", "admin-dashboard", "profile", "settings"
  ];

  // Filter notifications based on search term and filters
  const filteredNotifications = notifications.filter(notification => {
    // Search term filtering (case-insensitive)
    const searchMatch = searchTerm === "" || 
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    // Page filtering
    const pageMatch = filters.page.length === 0 || filters.page.includes(notification.page);

    // Status filtering
    const statusMatch = filters.status.length === 0 || 
      filters.status.some(status => {
        if (status === "active") return notification.is_active;
        if (status === "inactive") return !notification.is_active;
        return false;
      });

    return searchMatch && pageMatch && statusMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredNotifications.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

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

  // Get notification status
  const getNotificationStatus = (notification: Notification) => {
    return notification.is_active ? "active" : "inactive";
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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Load notifications from Supabase
  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/notifications/fetch');
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Fallback to empty array if fetch fails
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Handle form submission for create/edit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingNotification) {
      // Update existing notification
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === editingNotification.id 
            ? { ...notification, ...formData }
            : notification
        )
      );
      setIsEditDialogOpen(false);
      setEditingNotification(null);
    } else {
      // Create new notification
      const newNotification: Notification = {
        id: Date.now().toString(),
        ...formData,
        created_at: new Date().toISOString()
      };
      setNotifications(prev => [newNotification, ...prev]);
      setIsCreateDialogOpen(false);
    }

    // Reset form
    setFormData({
      message: "",
      page: "",
      start_time: "",
      end_time: "",
      is_active: true
    });
  };

  // Handle edit
  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      message: notification.message,
      page: notification.page,
      start_time: notification.start_time,
      end_time: notification.end_time,
      is_active: notification.is_active
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete
  const handleDelete = (notification: Notification) => {
    setDeletingNotification(notification);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (deletingNotification) {
      setNotifications(prev => prev.filter(n => n.id !== deletingNotification.id));
      setDeletingNotification(null);
    }
  };

  // Reset form when dialogs close
  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setFormData({
      message: "",
      page: "",
      start_time: "",
      end_time: "",
      is_active: true
    });
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingNotification(null);
    setFormData({
      message: "",
      page: "",
      start_time: "",
      end_time: "",
      is_active: true
    });
  };

  return (
    <div className="p-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold font-cal-sans text-gray-800 mb-3">Notifications</h1>
          <p className="text-md text-gray-600">
            Manage in-app alerts across pages
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Search Bar and Create Button Row */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notifications by message..."
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
                  Add Notification
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Notification</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleFormSubmit}>
                  <div className="space-y-4">
                   
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message" 
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Enter notification message" 
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
                              {page.charAt(0).toUpperCase() + page.slice(1).replace('-', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start_time">Start Time</Label>
                        <Input 
                          id="start_time" 
                          type="datetime-local"
                          value={formData.start_time}
                          onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_time">End Time</Label>
                        <Input 
                          id="end_time" 
                          type="datetime-local"
                          value={formData.end_time}
                          onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        type="button" 
                        onClick={handleCloseCreateDialog}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        Create Notification
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
        
        {/* Notifications Table */}
        <div className="border border-gray-300/80 rounded-lg bg-white/80 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-white/80">Message</TableHead>
                <TableHead className="bg-white/80">Page</TableHead>
                <TableHead className="bg-white/80">Status</TableHead>
                <TableHead className="bg-white/80">End Time</TableHead>
                <TableHead className="bg-white/80 rounded-2xl">Actions</TableHead>
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
                    <TableCell className="bg-white/80 rounded-2xl">
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                        <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                paginatedNotifications.map(notification => {
                  const status = getNotificationStatus(notification);
                  return (
                    <TableRow key={notification.id}>
                      <TableCell className="bg-white/80">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <Bell className="h-4 w-4" />
                          </div>
                          <div className="text-sm text-gray-700 max-w-xs">
                            {notification.message}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="bg-white/80">
                        <Badge variant="outline">
                          {notification.page.charAt(0).toUpperCase() + notification.page.slice(1).replace('-', ' ')}
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
                          {formatDate(notification.end_time)}
                        </div>
                      </TableCell>
                      <TableCell className="bg-white/80 rounded-2xl">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleEdit(notification)}
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
                                onClick={() => handleDelete(notification)}
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Notification</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this notification? This action cannot be undone.
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
        {!loading && filteredNotifications.length > 0 && (
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
                Showing {startIndex + 1} to {Math.min(endIndex, filteredNotifications.length)} of {filteredNotifications.length} results
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
        
        {!loading && filteredNotifications.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            {notifications.length === 0 ? "No notifications found." : "No notifications found matching your search criteria."}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Notification</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-message">Message</Label>
                <Textarea 
                  id="edit-message" 
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter notification message" 
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
                        {page.charAt(0).toUpperCase() + page.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-start-time">Start Time</Label>
                  <Input 
                    id="edit-start-time" 
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-end-time">End Time</Label>
                  <Input 
                    id="edit-end-time" 
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    required
                  />
                </div>
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
                <Button type="submit">
                  Update Notification
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 