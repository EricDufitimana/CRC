"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/zenith/components/ui/button";
import { Input } from "@/zenith/components/ui/input";
import { Badge } from "@/zenith/components/ui/badge";

interface StudentSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCount: number;
  savedCount: number;
  onSaveSelection: () => void;
  onClearSelection: () => void;
  onClearSaved: () => void;
}

export function StudentSearchBar({
  searchTerm,
  onSearchChange,
  selectedCount,
  savedCount,
  onSaveSelection,
  onClearSelection,
  onClearSaved,
}: StudentSearchBarProps) {
  return (
    <div className="flex gap-3 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 transition-colors duration-300 text-gray-400 dark:text-gray-500" />
        <Input
          placeholder="Search students by name..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
          className="pl-8 pr-8 h-11 text-sm transition-colors duration-300 bg-white/80 border-gray-300 text-gray-900 placeholder:text-gray-500"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 transition-colors duration-300 cursor-pointer text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      
      {/* Save and Clear Buttons */}
      <div className="flex gap-1.5">
        <div className="relative">
          <Button 
            onClick={onSaveSelection}
            disabled={selectedCount === 0}
            size="sm"
            className="bg-black hover:bg-gray-800 text-white text-xs h-11 px-4 whitespace-nowrap shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200"
          >
            Save ({selectedCount})
          </Button>
          
          {/* Saved Selections Tooltip */}
          {savedCount > 0 && (
            <div className="absolute bottom-full mb-1.5 right-0 bg-blue-50 border border-blue-200 rounded-md p-2 shadow-lg z-50 min-w-max">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-medium text-blue-800">
                    Saved: {savedCount} students
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClearSaved}
                  className="text-blue-600 hover:text-blue-700 h-5 px-1.5 text-xs"
                >
                  Clear
                </Button>
              </div>
              <div className="absolute top-full right-3 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-blue-200"></div>
            </div>
          )}
        </div>
        
        <Button 
          onClick={onClearSelection}
          disabled={selectedCount === 0}
          variant="outline"
          size="sm"
          className="h-11 px-4 text-xs transition-colors duration-300 border-gray-300 hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300 dark:hover:text-white"
        >
          Clear Selected
        </Button>
      </div>
    </div>
  );
}

