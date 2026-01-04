"use client";

import { Button } from "@/zenith/components/ui/button";
import { Plus, History, CalendarDays } from "lucide-react";

interface EventsCategorySidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onAddEventOpen: () => void;
}

const categories = [
  { id: "previous-events", label: "Previous Events", icon: History },
  { id: "upcoming-events", label: "Upcoming Events", icon: CalendarDays },
];

export function EventsCategorySidebar({
  selectedCategory,
  onCategoryChange,
  onAddEventOpen,
}: EventsCategorySidebarProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-2">
          Event Types
        </h3>
        <div className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-200 flex items-center gap-3 font-medium focus:outline-none focus:ring-0 ${
                  selectedCategory === category.id
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className={`h-5 w-5 ${selectedCategory === category.id ? "text-orange-500" : "text-gray-400"}`} />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-4">
        <Button
          onClick={onAddEventOpen}
          className="w-full bg-primary hover:bg-primary/90 text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200 rounded-xl focus:outline-none focus:ring-0 py-6"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Event
        </Button>
      </div>
    </div>
  );
}
