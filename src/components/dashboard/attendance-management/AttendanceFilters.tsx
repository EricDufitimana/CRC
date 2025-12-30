"use client";

import { Button } from "../../../../zenith/src/components/ui/button";
import { Input } from "../../../../zenith/src/components/ui/input";
import { Label } from "../../../../zenith/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../zenith/src/components/ui/select";
import { Search, Download } from "lucide-react";

interface CRCClass {
  id: string;
  name: string;
  grade_group: string | null;
}

interface AttendanceFiltersProps {
  classes: CRCClass[];
  groupedClasses: Array<{ groupName: string; classes: CRCClass[] }>;
  uniqueWorkshops: string[];
  selectedClass: string;
  selectedStatus: string;
  selectedWorkshopFilter: string;
  selectedDate: string;
  searchQuery: string;
  onClassChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onWorkshopFilterChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  onExportCSV: () => void;
  classesLoading: boolean;
  hasActiveFilters: boolean;
}

export function AttendanceFilters({
  classes,
  groupedClasses,
  uniqueWorkshops,
  selectedClass,
  selectedStatus,
  selectedWorkshopFilter,
  selectedDate,
  searchQuery,
  onClassChange,
  onStatusChange,
  onWorkshopFilterChange,
  onDateChange,
  onSearchChange,
  onClearFilters,
  onExportCSV,
  classesLoading,
  hasActiveFilters,
}: AttendanceFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Label htmlFor="class-filter">Select Class</Label>
        <Select value={selectedClass} onValueChange={onClassChange} disabled={classesLoading}>
          <SelectTrigger>
            <SelectValue placeholder={classesLoading ? "Loading classes..." : "All classes"} />
          </SelectTrigger>
          <SelectContent>
            {classesLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin h-5 w-5 border-2 border-orange-600 border-t-transparent rounded-full"></div>
                <span className="ml-2 text-sm text-gray-500">Loading classes...</span>
              </div>
            ) : (
              <>
                <SelectItem value="all">All classes</SelectItem>
                {groupedClasses.map(({ groupName, classes: groupClasses }) => (
                  <div key={groupName}>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {groupName}
                    </div>
                    {groupClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Label htmlFor="status-filter">Select Status</Label>
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
            <SelectItem value="late">Late</SelectItem>
            <SelectItem value="excused">Excused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Label htmlFor="workshop-filter">Select Workshop</Label>
        <Select value={selectedWorkshopFilter} onValueChange={onWorkshopFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="All workshops" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All workshops</SelectItem>
            {uniqueWorkshops.map((workshop) => (
              <SelectItem key={workshop} value={workshop}>
                {workshop}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>
    </div>
  );
}

