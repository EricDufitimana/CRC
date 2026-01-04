"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnnouncementsHeader } from "./AnnouncementsHeader";
import { AnnouncementsTable } from "./AnnouncementsTable";
import { showToastSuccess, showToastError } from "@/components/toasts";
import { AddAnnouncementDialog } from "./AddAnnouncementDialog";
import { EditAnnouncementDialog } from "./EditAnnouncementDialog";
import { Search, X, Plus } from "lucide-react";
import { Input } from "@/zenith/components/ui/input";
import { Button } from "@/zenith/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/zenith/components/ui/select";

const ALL_PAGES = [
  { value: "all", label: "All Pages" },
  { value: "home", label: "Home Page" },
  { value: "student_dashboard", label: "Student Dashboard" },
  { value: "admin_dashboard", label: "Admin Dashboard" },
  { value: "new_opportunities", label: "New Opportunities" },
  { value: "recurring_opportunities", label: "Recurring Opportunities" },
  { value: "internships", label: "Internships" },
  { value: "english_language_learning", label: "English Learning" },
  { value: "approved_opportunities", label: "Approved Opportunities" },
  { value: "previous_events", label: "Previous Events" },
  { value: "upcoming_events", label: "Upcoming Events" },
  { value: "crp", label: "CRP" },
  { value: "templates", label: "Templates" },
  { value: "job_readiness_course", label: "Job Readiness" },
  { value: "s4_workshops", label: "S4 Workshops" },
  { value: "ey_workshops", label: "EY Workshops" },
  { value: "senior_5_group_a_b_workshops", label: "S5 Group A&B" },
  { value: "senior_5_customer_care", label: "S5 Customer Care" },
  { value: "senior_6_group_a_b_workshops", label: "S6 Group A&B" },
  { value: "senior_6_group_c_workshops", label: "S6 Group C" },
  { value: "senior_6_group_d", label: "S6 Group D" },
];

export function AnnouncementsContent() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [announcementToEdit, setAnnouncementToEdit] = useState<any>(null);

  // Fetch all announcements once to leverage prefetching and client-side filtering
  const { data: announcements = [], isFetching } = useQuery({
    ...trpc.announcementsManagement.getAnnouncements.queryOptions({}),
    refetchOnWindowFocus: false,
  });

  const statusMutation = useMutation({
    ...trpc.announcementsManagement.updateAnnouncementStatus.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["announcementsManagement", "getAnnouncements"]] });
      showToastSuccess({
        headerText: "Status Updated",
        paragraphText: "The announcement visibility has been toggled.",
        direction: "right"
      });
    },
    onError: (error) => {
      showToastError({
        headerText: "Update Failed",
        paragraphText: error.message,
        direction: "right"
      });
    }
  });

  const deleteMutation = useMutation({
    ...trpc.announcementsManagement.deleteAnnouncement.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["announcementsManagement", "getAnnouncements"]] });
      showToastSuccess({
        headerText: "Announcement Deleted",
        paragraphText: "The announcement has been removed permanently.",
        direction: "right"
      });
    },
    onError: (error) => {
      showToastError({
        headerText: "Delete Failed",
        paragraphText: error.message,
        direction: "right"
      });
    }
  });

  const handleEdit = (announcement: any) => {
    setAnnouncementToEdit(announcement);
    setIsEditOpen(true);
  };

  const handleDelete = (announcement: any) => {
    if (window.confirm("Are you sure you want to delete this announcement? This action cannot be undone.")) {
      (deleteMutation.mutate as any)({ id: announcement.id });
    }
  };

  const handleStatusChange = (id: string, newStatus: boolean) => {
    (statusMutation.mutate as any)({ id, is_active: newStatus });
  };

  // Filter local search and page category
  const filteredAnnouncements = (announcements as any[]).filter((ann: any) => {
    const matchesSearch = ann.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || ann.page === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <AnnouncementsHeader />
      </div>

      {/* Controls Section: Search, Filter, Add Button */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4 items-center w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 bg-white/80 border-gray-200 shadow-none rounded-2xl"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Page Filter */}
          <div className="w-full md:w-64">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full bg-white border-gray-200 rounded-2xl shadow-none focus:outline-none focus:ring-0">
                <SelectValue placeholder="All Pages" />
              </SelectTrigger>
              <SelectContent>
                {ALL_PAGES.map((page) => (
                  <SelectItem key={page.value} value={page.value}>
                    {page.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Add Button */}
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white shadow-none transition duration-200 whitespace-nowrap rounded-2xl px-6"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Announcement
        </Button>
      </div>

      {/* Table Section - Full Width */}
      <div className="w-full">
        <AnnouncementsTable
          announcements={filteredAnnouncements}
          isFetching={isFetching}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      </div>

      <AddAnnouncementDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
      />

      {announcementToEdit && (
        <EditAnnouncementDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          announcement={announcementToEdit}
        />
      )}
    </div>
  );
}
