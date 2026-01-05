"use client";

import { useState, useMemo, useEffect } from "react";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/zenith/components/ui/button";
import { Input } from "@/zenith/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/zenith/components/ui/card";
import { Search, Download } from "lucide-react";
import { format } from "date-fns";
import { AttendanceManagementHeader } from "./AttendanceManagementHeader";
import { AttendanceStatsCards } from "./AttendanceStatsCards";
import { AttendanceFilters } from "./AttendanceFilters";
import { AttendanceTable } from "./AttendanceTable";
import { RecordAttendanceDialog } from "./RecordAttendanceDialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function AttendanceManagementContent() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Fetch data using tRPC
  const { data: attendanceRecordsData = [] } = useSuspenseQuery(
    trpc.attendanceManagement.getAttendanceRecords.queryOptions(undefined)
  );
  const { data: classesData = [] } = useSuspenseQuery(
    trpc.crcClassManagement.getCrcClasses.queryOptions(undefined)
  );

  // State
  const [selectedWeek, setSelectedWeek] = useState<string>("this-week");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedWorkshopFilter, setSelectedWorkshopFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Transform attendance records
  const attendanceRecords = useMemo(() => {
    return attendanceRecordsData.map((record) => ({
      id: record.id,
      student: {
        id: record.student.id,
        student_id: record.student.student_id,
        first_name: record.student.first_name || null,
        last_name: record.student.last_name || null,
        major_short: record.student.major_short ? String(record.student.major_short) : null,
        grade: record.student.grade ? String(record.student.grade) : null,
        profile_picture: record.student.profile_picture || null,
      },
      status: record.status,
      created_at: record.created_at instanceof Date ? record.created_at : new Date(record.created_at),
      workshop_title: record.workshop_title,
      class_name: record.class_name,
      class_id: record.class_id,
    }));
  }, [attendanceRecordsData]);

  // Group classes by grade group
  const groupedClasses = useMemo(() => {
    const groups: Record<string, typeof classesData> = {};
    classesData.forEach((cls) => {
      const groupName = cls.grade_group || 'Other';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(cls);
    });
    return Object.entries(groups).map(([groupName, classes]) => ({
      groupName,
      classes,
    }));
  }, [classesData]);

  // Generate week options
  const weekOptions = useMemo(() => {
    const options = [];
    const today = new Date();
    
    const getMondayOfWeek = (date: Date) => {
      const dayOfWeek = date.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(date);
      monday.setDate(date.getDate() - daysToSubtract);
      monday.setHours(0, 0, 0, 0);
      return monday;
    };
    
    const getSundayOfWeek = (monday: Date) => {
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      return sunday;
    };
    
    const thisWeekMonday = getMondayOfWeek(today);
    const thisWeekSunday = getSundayOfWeek(thisWeekMonday);
    options.push({
      value: "this-week",
      label: `This Week (${format(thisWeekMonday, "MMM dd")} - ${format(thisWeekSunday, "MMM dd")})`,
      startDate: thisWeekMonday,
      endDate: thisWeekSunday
    });
    
    if (attendanceRecords.length > 0) {
      const earliestRecordDate = new Date(Math.min(...attendanceRecords.map(r => r.created_at.getTime())));
      const earliestWeekMonday = getMondayOfWeek(earliestRecordDate);
      const weeksBack = Math.ceil((thisWeekMonday.getTime() - earliestWeekMonday.getTime()) / (7 * 24 * 60 * 60 * 1000));
      
      for (let i = 1; i <= weeksBack; i++) {
        const weekMonday = new Date(thisWeekMonday);
        weekMonday.setDate(thisWeekMonday.getDate() - (i * 7));
        weekMonday.setHours(0, 0, 0, 0);
        const weekSunday = getSundayOfWeek(weekMonday);
        
        options.push({
          value: `week-${i}`,
          label: `${i === 1 ? 'Last week' : `${i} weeks ago`} (${format(weekMonday, "MMM dd")} - ${format(weekSunday, "MMM dd")})`,
          startDate: weekMonday,
          endDate: weekSunday
        });
      }
    } else {
      const lastWeekMonday = new Date(thisWeekMonday);
      lastWeekMonday.setDate(thisWeekMonday.getDate() - 7);
      lastWeekMonday.setHours(0, 0, 0, 0);
      const lastWeekSunday = getSundayOfWeek(lastWeekMonday);
      
      options.push({
        value: `week-1`,
        label: `Last week (${format(lastWeekMonday, "MMM dd")} - ${format(lastWeekSunday, "MMM dd")})`,
        startDate: lastWeekMonday,
        endDate: lastWeekSunday
      });
    }
    
    return options;
  }, [attendanceRecords]);

  // Get unique workshops
  const uniqueWorkshops = useMemo(() => {
    return Array.from(new Set(attendanceRecords.map(record => record.workshop_title))).sort();
  }, [attendanceRecords]);

  // Filter records
  const filteredRecords = useMemo(() => {
    const selectedWeekOption = weekOptions.find(option => option.value === selectedWeek);
    
    return attendanceRecords.filter(record => {
      const matchesSearch = (record.student?.first_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (record.student?.last_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (record.student?.student_id || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = !selectedClass || selectedClass === "all" || 
        (record.class_id === selectedClass || (!record.class_id && record.class_name === selectedClass));
      const matchesDate = !selectedDate || format(record.created_at, "yyyy-MM-dd") === selectedDate;
      const matchesStatus = !selectedStatus || selectedStatus === "all" || record.status === selectedStatus;
      const matchesWorkshop = !selectedWorkshopFilter || selectedWorkshopFilter === "all" || record.workshop_title === selectedWorkshopFilter;
      
      let matchesWeek = true;
      if (selectedWeekOption && selectedWeekOption.startDate && selectedWeekOption.endDate) {
        matchesWeek = record.created_at >= selectedWeekOption.startDate && record.created_at <= selectedWeekOption.endDate;
      }
      
      return matchesSearch && matchesClass && matchesDate && matchesStatus && matchesWorkshop && matchesWeek;
    });
  }, [attendanceRecords, searchQuery, selectedClass, selectedDate, selectedStatus, selectedWorkshopFilter, selectedWeek, weekOptions]);

  // Calculate stats for selected week
  const stats = useMemo(() => {
    const selectedWeekOption = weekOptions.find(option => option.value === selectedWeek);
    
    if (!selectedWeekOption || !selectedWeekOption.startDate || !selectedWeekOption.endDate) {
      return {
        totalStudents: 0,
        presentToday: 0,
        lateToday: 0,
        absentToday: 0,
        averageCheckIn: "00:00",
        presentLastWeek: 0,
        lateLastWeek: 0,
        absentLastWeek: 0
      };
    }
    
    const weekRecords = attendanceRecords.filter(record => {
      return record.created_at >= selectedWeekOption.startDate! && record.created_at <= selectedWeekOption.endDate!;
    });
    
    const presentCount = weekRecords.filter(record => record.status === 'present').length;
    const lateCount = weekRecords.filter(record => record.status === 'late').length;
    const absentCount = weekRecords.filter(record => record.status === 'absent').length;
    
    const comparisonStartDate = new Date(selectedWeekOption.startDate!);
    comparisonStartDate.setDate(comparisonStartDate.getDate() - 7);
    const comparisonEndDate = new Date(selectedWeekOption.endDate!);
    comparisonEndDate.setDate(comparisonEndDate.getDate() - 7);
    
    const comparisonRecords = attendanceRecords.filter(record => {
      return record.created_at >= comparisonStartDate && record.created_at <= comparisonEndDate;
    });
    
    const presentLastWeek = comparisonRecords.filter(record => record.status === 'present').length;
    const lateLastWeek = comparisonRecords.filter(record => record.status === 'late').length;
    const absentLastWeek = comparisonRecords.filter(record => record.status === 'absent').length;

    return {
      totalStudents: presentCount + lateCount + absentCount,
      presentToday: presentCount,
      lateToday: lateCount,
      absentToday: absentCount,
      averageCheckIn: presentCount > 0 ? "08:25 AM" : "00:00",
      presentLastWeek,
      lateLastWeek,
      absentLastWeek
    };
  }, [attendanceRecords, selectedWeek, weekOptions]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedClass, selectedDate, selectedStatus, selectedWeek]);

  // CSV Export
  const exportToCSV = () => {
    if (filteredRecords.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Student ID',
      'First Name',
      'Last Name',
      'Grade',
      'Major',
      'Workshop Title',
      'Status',
      'Date',
      'Class'
    ];

    const csvCell = (v: any) => {
      const s = v == null ? '' : String(v);
      const needsQuotes = /[",\n\r]/.test(s);
      const escaped = s.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };

    const csvRows = [
      headers.map(csvCell).join(','),
      ...filteredRecords.map(record => [
        record.student?.student_id,
        record.student?.first_name,
        record.student?.last_name,
        record.student?.grade,
        record.student?.major_short,
        record.workshop_title,
        record.status,
        format(record.created_at, "yyyy-MM-dd"),
        record.class_name
      ].map(csvCell).join(','))
    ];

    const csvContent = '\ufeff' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const currentDate = format(new Date(), "yyyy-MM-dd_HH-mm");
    const filename = `attendance_export_${currentDate}.csv`;
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } else {
      const url = URL.createObjectURL(blob);
      window.open(url);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  const hasActiveFilters = Boolean(selectedClass !== "all" || selectedStatus !== "all" || selectedWorkshopFilter !== "all" || selectedDate || searchQuery);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <AttendanceManagementHeader
        selectedWeek={selectedWeek}
        onWeekChange={setSelectedWeek}
        weekOptions={weekOptions}
        onRecordClick={() => setIsRecordDialogOpen(true)}
      />

      {/* Stats Cards */}
      <AttendanceStatsCards stats={stats} />

      {/* Attendance History */}
      <Card className="border shadow-none border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">Attendance History</CardTitle>
            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedClass("all");
                    setSelectedStatus("all");
                    setSelectedWorkshopFilter("all");
                    setSelectedDate("");
                    setSearchQuery("");
                    setSelectedWeek("this-week");
                    setCurrentPage(1);
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Clear filters
                </Button>
              )}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or class..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 rounded-xl"
                />
              </div>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <AttendanceFilters
            classes={classesData}
            groupedClasses={groupedClasses}
            uniqueWorkshops={uniqueWorkshops}
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
            onClearFilters={() => {
              setSelectedClass("all");
              setSelectedStatus("all");
              setSelectedWorkshopFilter("all");
              setSelectedDate("");
              setSearchQuery("");
              setCurrentPage(1);
            }}
            onExportCSV={exportToCSV}
            classesLoading={false}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Table */}
          <AttendanceTable records={paginatedRecords as any} loading={false} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length} records
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-1">
                  {(() => {
                    const maxVisiblePages = 10;
                    const halfVisible = Math.floor(maxVisiblePages / 2);
                    let startPage = Math.max(1, currentPage - halfVisible);
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                    if (endPage - startPage < maxVisiblePages - 1) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }
                    const pages = [];
                    if (startPage > 1) {
                      pages.push(
                        <Button
                          key={1}
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(1)}
                          className="w-8 h-8 p-0"
                        >
                          1
                        </Button>
                      );
                      if (startPage > 2) {
                        pages.push(<span key="ellipsis1" className="px-2 text-gray-400">...</span>);
                      }
                    }
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <Button
                          key={i}
                          variant={currentPage === i ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(i)}
                          className={`w-8 h-8 p-0 ${currentPage === i ? "bg-black text-white hover:bg-black/90" : ""}`}
                        >
                          {i}
                        </Button>
                      );
                    }
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(<span key="ellipsis2" className="px-2 text-gray-400">...</span>);
                      }
                      pages.push(
                        <Button
                          key={totalPages}
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-8 h-8 p-0"
                        >
                          {totalPages}
                        </Button>
                      );
                    }
                    return pages;
                  })()}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Attendance Dialog */}
      <RecordAttendanceDialog
        open={isRecordDialogOpen}
        onOpenChange={setIsRecordDialogOpen}
        classes={classesData}
        groupedClasses={groupedClasses}
      />
    </div>
  );
}
