"use client";

import { Button } from "@/zenith/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/zenith/components/ui/dropdown-menu";
import { Plus, GraduationCap, Users, ChevronDown, Loader2, Check } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

const categories = [
  { id: "ey", label: "EY", icon: GraduationCap, type: "button" },
  { id: "senior_4", label: "Senior 4", icon: Users, type: "button" },
  { id: "senior_5", label: "Senior 5", icon: Users, type: "dropdown" },
  { id: "senior_6", label: "Senior 6", icon: Users, type: "dropdown" },
];

interface WorkshopsNavigationProps {
  selectedGroup: string;
  onGroupChange: (group: string) => void;
  onAddWorkshopOpen: () => void;
  onAddAssignmentOpen: () => void;
}

export function WorkshopsNavigation({
  selectedGroup,
  onGroupChange,
  onAddWorkshopOpen,
  onAddAssignmentOpen,
}: WorkshopsNavigationProps) {
  const trpc = useTRPC();
  const { data: crcClasses = [], isLoading } = useQuery({
    ...trpc.workshopsManagement.getCrcClasses.queryOptions(),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const getClassesForGroup = (groupId: string) => {
    const dbGroupMap: Record<string, string> = {
      'senior_5': 'Senior_5',
      'senior_6': 'Senior_6',
    };
    const targetGroup = dbGroupMap[groupId];
    return crcClasses.filter(c => c.grade_group === targetGroup);
  };

  const isCategoryActive = (categoryId: string) => {
    if (selectedGroup === categoryId) return true;

    // Check if a class within this category is selected
    if (selectedGroup.startsWith('class:')) {
      const classId = selectedGroup.replace('class:', '');
      const cls = crcClasses.find(c => c.id === classId);
      if (cls) {
        const dbGroupMap: Record<string, string> = {
          'senior_5': 'Senior_5',
          'senior_6': 'Senior_6',
        };
        const targetGroup = dbGroupMap[categoryId];
        return cls.grade_group === targetGroup;
      }
    }
    return false;
  };

  const getActiveLabel = (categoryId: string) => {
    if (selectedGroup === categoryId) return null; // Default label is fine

    if (selectedGroup.startsWith('class:')) {
      const classId = selectedGroup.replace('class:', '');
      const cls = crcClasses.find(c => c.id === classId);

      const dbGroupMap: Record<string, string> = {
        'senior_5': 'Senior_5',
        'senior_6': 'Senior_6',
      };

      if (cls && cls.grade_group === dbGroupMap[categoryId]) {
        return cls.name;
      }
    }
    return null;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full bg-white p-2 rounded-xl border">
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((category) => {
          const IconComponent = category.icon;
          const isActive = isCategoryActive(category.id);
          const activeLabel = getActiveLabel(category.id);

          if (category.type === "dropdown") {
            const classes = getClassesForGroup(category.id);

            return (
              <DropdownMenu key={category.id}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium focus:outline-none focus:ring-0 ${isActive
                      ? "bg-green-50 text-green-600 border border-green-100"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                  >
                    <IconComponent className={`h-4 w-4 ${isActive ? "text-white" : "text-gray-400"}`} />
                    {activeLabel ? `${category.label}: ${activeLabel}` : category.label}
                    <ChevronDown className={`h-3 w-3 ml-1 opacity-70`} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 rounded-2xl border-gray-100 shadow-xl p-2">
                  {isLoading ? (
                    <div className="p-2 flex justify-center text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </div>
                  ) : classes.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      No classes found
                    </div>
                  ) : (
                    classes.map((c) => (
                      <DropdownMenuItem
                        key={c.id}
                        onClick={() => onGroupChange(`class:${c.id}`)}
                        className="flex justify-between items-center cursor-pointer rounded-xl focus:bg-green-50 focus:text-green-900 mb-1 px-3 py-2"
                      >
                        {c.name}
                        {selectedGroup === `class:${c.id}` && <Check className="h-3 w-3 ml-2 text-green-600" />}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }

          return (
            <button
              key={category.id}
              onClick={() => onGroupChange(category.id)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium focus:outline-none focus:ring-0 ${selectedGroup === category.id
                ? "bg-green-50 text-green-600 border border-green-100"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
            >
              <IconComponent className={`h-4 w-4 ${selectedGroup === category.id ? "text-green-600" : "text-gray-400"}`} />
              {category.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={onAddAssignmentOpen}
          variant="outline"
          className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl focus:outline-none focus:ring-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Assignment
        </Button>
        <Button
          onClick={onAddWorkshopOpen}
          className="bg-primary hover:bg-primary/90 text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200 rounded-xl focus:outline-none focus:ring-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Workshop
        </Button>
      </div>
    </div>
  );
}
