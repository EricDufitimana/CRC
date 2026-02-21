"use client";

import { useState } from "react";
import { AnnouncementsHeader } from "../admin/announcements/AnnouncementsHeader";
import { BetaAnnouncementsTable as AnnouncementsTable } from "./BetaAnnouncementsTable";
import { Search, Plus } from "lucide-react";
import { Input } from "@/zenith/components/ui/input";
import { Button } from "@/zenith/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/zenith/components/ui/select";
import { showToastError } from "@/components/toasts/ToastError";

const ALL_PAGES = [
  { value: "all", label: "All Pages" },
  { value: "home", label: "Home Page" },
  { value: "student_dashboard", label: "Student Dashboard" },
  { value: "admin_dashboard", label: "Admin Dashboard" },
];

const dummyAnnouncements = [
  {
    id: "ann1",
    message: "Welcome to the new CRC Dashboard Demo!",
    page: "all",
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: "ann2",
    message: "Don't forget to submit your Personal Statement by Friday.",
    page: "student_dashboard",
    is_active: true,
    created_at: new Date().toISOString()
  }
];

export function BetaAnnouncementsContent() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAnnouncements = dummyAnnouncements.filter(ann => {
    const matchesSearch = ann.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || ann.page === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAction = () => {
    showToastError({
      headerText: "Demo Action",
      paragraphText: "This action is disabled in the demo dashboard.",
      direction: "right"
    });
  };

  return (
    <div className="space-y-8 p-8">
      <AnnouncementsHeader />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-4 items-center w-full md:w-auto">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-2xl"
            />
          </div>

          <div className="w-full md:w-64">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="rounded-2xl shadow-none">
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

        <Button
          onClick={handleAction}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl px-6"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Announcement
        </Button>
      </div>

      <div className="w-full">
        <AnnouncementsTable
          announcements={filteredAnnouncements as any}
          isFetching={false}
          onEdit={handleAction}
          onDelete={handleAction}
          onStatusChange={handleAction}
        />
      </div>
    </div>
  );
}
