"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/zenith/components/ui/card";
import { Input } from "@/zenith/components/ui/input";
import { Button } from "@/zenith/components/ui/button";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { AttendanceManagementHeader } from "../admin/attendance-management/AttendanceManagementHeader";
import { AttendanceStatsCards } from "../admin/attendance-management/AttendanceStatsCards";
import { AttendanceFilters } from "../admin/attendance-management/AttendanceFilters";
import { AttendanceTable } from "../admin/attendance-management/AttendanceTable";
import { showToastError } from "@/components/toasts/ToastError";

// Dummy data for Demo
const dummyClasses = [
  { id: "class1", name: "CRC Alpha", grade_group: "Senior 6" },
  { id: "class2", name: "CRC Beta", grade_group: "Senior 5" },
];

const dummyRecords = [
  {
    id: "r1",
    student: { id: "s1", student_id: "ST001", first_name: "John", last_name: "Doe", grade: "Senior 6", major_short: "MCB" },
    status: "present",
    created_at: new Date(),
    workshop_title: "College Essay Workshop",
    class_name: "CRC Alpha",
    class_id: "class1"
  },
  {
    id: "r2",
    student: { id: "s2", student_id: "ST002", first_name: "Jane", last_name: "Smith", grade: "Senior 5", major_short: "PCM" },
    status: "late",
    created_at: new Date(),
    workshop_title: "College Essay Workshop",
    class_name: "CRC Beta",
    class_id: "class2"
  },
  {
    id: "r3",
    student: { id: "s3", student_id: "ST003", first_name: "Alex", last_name: "Johnson", grade: "Senior 4", major_short: "MPC" },
    status: "absent",
    created_at: new Date(),
    workshop_title: "Standardized Testing prep",
    class_name: "CRC Alpha",
    class_id: "class1"
  }
];

export function BetaAttendanceManagementContent() {
  const [selectedWeek, setSelectedWeek] = useState<string>("this-week");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedWorkshopFilter, setSelectedWorkshopFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const weekOptions = [
    { value: "this-week", label: "This Week", startDate: new Date(), endDate: new Date() }
  ];

  const stats = {
    totalStudents: 3,
    presentToday: 1,
    lateToday: 1,
    absentToday: 1,
    averageCheckIn: "08:15 AM",
    presentLastWeek: 10,
    lateLastWeek: 2,
    absentLastWeek: 1
  };

  const handleAction = () => {
    showToastError({
      headerText: "Demo Action",
      paragraphText: "This action is disabled in the demo dashboard.",
      direction: "right"
    });
  };

  return (
    <div className="p-6 space-y-6">
      <AttendanceManagementHeader
        selectedWeek={selectedWeek}
        onWeekChange={setSelectedWeek}
        weekOptions={weekOptions}
        onRecordClick={handleAction}
      />

      <AttendanceStatsCards stats={stats} />

      <Card className="border shadow-none border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">Attendance History (Demo)</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 rounded-xl"
                />
              </div>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={handleAction}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AttendanceFilters
            classes={dummyClasses as any}
            groupedClasses={[]}
            uniqueWorkshops={["College Essay Workshop", "Standardized Testing prep"]}
            selectedClass={selectedClass}
            selectedStatus={selectedStatus}
            selectedWorkshopFilter={selectedWorkshopFilter}
            selectedDate={selectedDate}
            searchQuery={searchQuery}
            onClassChange={setSelectedClass}
            onStatusChange={setSelectedStatus}
            onWorkshopFilterChange={setSelectedWorkshopFilter}
            onDateChange={setSelectedDate}
            onSearchChange={setSearchQuery}
            onClearFilters={() => {}}
            onExportCSV={handleAction}
            classesLoading={false}
            hasActiveFilters={false}
          />

          <AttendanceTable records={dummyRecords as any} loading={false} />
        </CardContent>
      </Card>
    </div>
  );
}
