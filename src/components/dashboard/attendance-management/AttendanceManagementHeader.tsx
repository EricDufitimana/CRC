"use client";

import { Button } from "../../../../zenith/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../zenith/src/components/ui/select";
import {
  Dialog,
  DialogTrigger,
} from "../../../../zenith/src/components/ui/dialog";
import { Plus } from "lucide-react";
import { format } from "date-fns";

interface WeekOption {
  value: string;
  label: string;
  startDate: Date;
  endDate: Date;
}

interface AttendanceManagementHeaderProps {
  selectedWeek: string;
  onWeekChange: (week: string) => void;
  weekOptions: WeekOption[];
  onRecordClick: () => void;
}

export function AttendanceManagementHeader({
  selectedWeek,
  onWeekChange,
  weekOptions,
  onRecordClick,
}: AttendanceManagementHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-cal-sans mb-1">
          Attendance Dashboard
        </h1>
        <p className="text-gray-600 text-md">
          Track student attendance and manage records
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Week Selector */}
        <div className="flex items-center gap-2">
          <Select value={selectedWeek} onValueChange={onWeekChange}>
            <SelectTrigger className="w-64 rounded-xl">
              <SelectValue placeholder="Select week" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {weekOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={onRecordClick}
          className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Record Attendance
        </Button>
      </div>
    </div>
  );
}

