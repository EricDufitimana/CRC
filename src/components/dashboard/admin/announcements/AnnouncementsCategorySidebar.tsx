"use client";

import { Button } from "@/zenith/components/ui/button";
import { Plus, Layout, Zap, Megaphone } from "lucide-react";

interface AnnouncementsCategorySidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onAddOpen: () => void;
}

const categories = [
  { id: "all", label: "All Announcements", icon: Megaphone },
  { id: "home", label: "Home Page", icon: Layout },
  { id: "student_dashboard", label: "Student Dashboard", icon: Zap },
];

export function AnnouncementsCategorySidebar({
  selectedCategory,
  onCategoryChange,
  onAddOpen,
}: AnnouncementsCategorySidebarProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-2">
          Views
        </h3>
        <div className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-200 flex items-center gap-3 font-medium focus:outline-none focus:ring-0 ${
                  isActive
                    ? "bg-green-50 text-green-600 border border-green-100 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 border border-transparent"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-green-600" : "text-gray-400"}`} />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-4">
        <Button
          onClick={onAddOpen}
          className="w-full bg-primary hover:bg-primary/90 text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200 rounded-xl focus:outline-none focus:ring-0 py-6"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Announcement
        </Button>
      </div>
    </div>
  );
}
