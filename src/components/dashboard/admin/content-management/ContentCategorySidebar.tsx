"use client";

import { Button } from "@/zenith/components/ui/button";
import { Plus, Briefcase, Calendar, FileText, BookOpen } from "lucide-react";

const categories = [
  { id: "new-opportunities", label: "New Opportunities", icon: Briefcase },
  { id: "recurring-opportunities", label: "Recurring Opportunities", icon: Calendar },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "english-learning", label: "English Learning", icon: BookOpen },
];

interface ContentCategorySidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  isAddResourceOpen: boolean;
  onAddResourceOpenChange: (open: boolean) => void;
  canAddResource: boolean;
}

export function ContentCategorySidebar({
  selectedCategory,
  onCategoryChange,
  isAddResourceOpen,
  onAddResourceOpenChange,
  canAddResource,
}: ContentCategorySidebarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((category) => {
          const IconComponent = category.icon;
          const isActive = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium focus:outline-none focus:ring-0 ${isActive
                ? "bg-green-50 text-green-600 border border-green-100"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
            >
              <IconComponent className={`h-4 w-4 ${isActive ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"}`} />
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Add Resource Button */}
      {canAddResource && (
        <Button
          onClick={() => onAddResourceOpenChange(true)}
          className="bg-primary hover:bg-primary/90 text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200 rounded-xl focus:outline-none focus:ring-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      )}
    </div>
  );
}

