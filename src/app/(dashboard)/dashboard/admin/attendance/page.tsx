"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "../../../../../../zenith/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../zenith/src/components/ui/card";
import { Badge } from "../../../../../../zenith/src/components/ui/badge";
import { Input } from "../../../../../../zenith/src/components/ui/input";
import { Label } from "../../../../../../zenith/src/components/ui/label";
import { Skeleton } from "../../../../../../zenith/src/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../../zenith/src/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../../../zenith/src/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../../../zenith/src/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../../zenith/src/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../../../zenith/src/components/ui/avatar";
import { 
  Users, 
  Clock, 
  UserX, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Search,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useUserData } from "@/hooks/useUserData";
import { showToastSuccess, showToastError, showToastPromise } from "@/components/toasts";
import { updateAttendanceStatus } from "@/actions/attendance/updateAttendance";

interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  major_short: string;
  grade: string;
  profile_picture?: string | null;
  crc_class_id?: number;
}

interface Workshop {
  id: number;
  title: string;
  date: string;
}

interface CRCClass {
  id: number;
  name: string;
}

interface AttendanceRecord {
  id: number;
  student: Student;
  status: 'present' | 'absent' | 'late' | 'excused';
  created_at: string;
  workshop_title: string;
  class_name: string;
}

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [classes, setClasses] = useState<CRCClass[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedWorkshopFilter, setSelectedWorkshopFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<string>("this-week");
  const [selectedStudents, setSelectedStudents] = useState<{[key: number]: 'present' | 'absent' | 'late' | 'excused'}>({});
  const [loading, setLoading] = useState(true);
  const [filteredWorkshops, setFilteredWorkshops] = useState<Workshop[]>([]);
  const [loadingWorkshops, setLoadingWorkshops] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [recordingAttendance, setRecordingAttendance] = useState(false);
  const {userId, adminId  } = useUserData();
  const [classesLoading, setClassesLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Real metrics state
  const [realStats, setRealStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
    averageCheckIn: "00:00",
    // Last week comparison data
    presentLastWeek: 0,
    lateLastWeek: 0,
    absentLastWeek: 0
  });

  // Generate week options for the dropdown
  const generateWeekOptions = () => {
    const options = [];
    const today = new Date();
    
    // Helper function to get Monday of a given week
    const getMondayOfWeek = (date: Date) => {
      const dayOfWeek = date.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(date);
      monday.setDate(date.getDate() - daysToSubtract);
      return monday;
    };
    
    // Helper function to get Sunday of a given week
    const getSundayOfWeek = (monday: Date) => {
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return sunday;
    };
    
    // This week
    const thisWeekMonday = getMondayOfWeek(today);
    const thisWeekSunday = getSundayOfWeek(thisWeekMonday);
    options.push({
      value: "this-week",
      label: `This Week (${format(thisWeekMonday, "MMM dd")} - ${format(thisWeekSunday, "MMM dd")})`
    });
    
    // Last 4 weeks
    for (let i = 1; i <= 4; i++) {
      const weekMonday = new Date(thisWeekMonday);
      weekMonday.setDate(thisWeekMonday.getDate() - (i * 7));
      const weekSunday = getSundayOfWeek(weekMonday);
      
      options.push({
        value: `week-${i}`,
        label: `${i === 1 ? 'Last' : `${i} weeks ago`} (${format(weekMonday, "MMM dd")} - ${format(weekSunday, "MMM dd")})`
      });
    }
    
    return options;
  };

  useEffect(() => {
    // Load attendance records
  const loadData = async () => {
    try {
      // Load attendance records from API
      try {
        const response = await fetch('/api/attendance/record');
        const result = await response.json();
        
        if (response.ok && result.data) {
          // Transform the data to match our interface
          const transformedRecords = result.data.map((record: any) => ({
            id: record.id,
            student: record.student,
            status: record.status,
            created_at: record.created_at,
            workshop_title: record.session?.workshop?.title || 'Unknown Workshop',
            class_name: record.session?.class?.name || 'Unknown Class'
          }));
          console.log('Loaded attendance records:', transformedRecords.length, transformedRecords);
          setAttendanceRecords(transformedRecords);
        } else {
          // No data from API
          console.log('No data from API');
          setAttendanceRecords([]);
        }
      } catch (error) {
        console.error('Error loading attendance records:', error);
        // Fallback to mock data
        setAttendanceRecords([]);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
    };

    loadData();
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      setClassesLoading(true);
      try {
        const response = await fetch('/api/admin/crc-classes');
        const data = await response.json();
        if (data.classes) {
          // Sort classes: EY first, then S4, S5, S6
          const sortedClasses = data.classes.sort((a: any, b: any) => {
            const getClassOrder = (className: string) => {
              if (className.toLowerCase().includes('ey') || className.toLowerCase().includes('enrichment')) return 1;
              if (className.toLowerCase().includes('s4')) return 2;
              if (className.toLowerCase().includes('s5')) return 3;
              if (className.toLowerCase().includes('s6')) return 4;
              return 5; // Any other classes go last
            };
            
            const orderA = getClassOrder(a.name);
            const orderB = getClassOrder(b.name);
            
            if (orderA !== orderB) {
              return orderA - orderB;
            }
            
            // If same order, sort alphabetically
            return a.name.localeCompare(b.name);
          });
          
          setClasses(sortedClasses);
        } else {
          setClasses([]);
        }
      } catch (error) {
        console.error('Failed to fetch classes:', error);
        setClasses([]);
      } finally {
        setClassesLoading(false);
      }
    };
    
    fetchClasses();
  }, []);

  useEffect(() => {
    // Load workshops for selected class when selectedClassId changes
    const loadWorkshopsForClass = async () => {
      if (!selectedClassId) {
        setFilteredWorkshops([]);
        return;
      }

      setLoadingWorkshops(true);
      try {
        const response = await fetch(`/api/admin/workshops?crcClassId=${selectedClassId}&useCase=attendance`);
        const data = await response.json();
        
        if (data.workshops) {
          setFilteredWorkshops(data.workshops);
        } else {
          setFilteredWorkshops([]);
        }
      } catch (error) {
        console.error('Error loading workshops for class:', error);
        setFilteredWorkshops([]);
      } finally {
        setLoadingWorkshops(false);
      }
    };

    loadWorkshopsForClass();
  }, [selectedClassId]);

  useEffect(() => {
    // Load students for selected class when selectedClassId changes
    const loadStudentsForClass = async () => {
      if (!selectedClassId) {
        setStudents([]); // Clear students when no class is selected
        setLoadingStudents(false);
        return;
      }

      setLoadingStudents(true);
      try {
        const response = await fetch(`/api/admin/crc-classes/${selectedClassId}/students`);
        const data = await response.json();
        
        if (data.class && data.class.students) {
          setStudents(data.class.students);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error('Error loading students for class:', error);
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudentsForClass();
  }, [selectedClassId]);

  // Calculate metrics when attendance records or selected week change
  useEffect(() => {
    calculateMetrics();
  }, [attendanceRecords, selectedWeek]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedClass, selectedDate, selectedStatus, selectedWeek]);


  const handleClassChange = (classId: string) => {
    setSelectedClass(classId);
    setSelectedClassId(classId === "all" ? null : parseInt(classId));
    setSelectedWorkshop(""); // Reset workshop selection
  };

  const getStatusBadge = (status: string, attendanceId: number) => {
    const statusOptions = [
      { value: 'present', label: 'Present', className: 'bg-green-100 text-green-800 hover:bg-green-100 text-green-800' },
      { value: 'late', label: 'Late', className: 'bg-orange-100 text-orange-800 hover:bg-orange-100 text-orange-800' },
      { value: 'absent', label: 'Absent', className: 'bg-red-100 text-red-800 hover:bg-red-100 text-red-800' },
      { value: 'excused', label: 'Excused', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100 text-blue-800' }
    ];

    const currentStatus = statusOptions.find(option => option.value === status);
    const currentClassName = currentStatus?.className || 'bg-gray-100 text-gray-800';

    const handleStatusChange = async (newStatus: string) => {
      const updatePromise = (async () => {
        const result = await updateAttendanceStatus(attendanceId, newStatus as 'present' | 'absent' | 'late' | 'excused');
        
        if (result.success) {
          // Update the local state to reflect the change
          setAttendanceRecords(prev => 
            prev.map(record => 
              record.id === attendanceId 
                ? { ...record, status: newStatus as 'present' | 'absent' | 'late' | 'excused' }
                : record
            )
          );
          return { success: true };
        } else {
          throw new Error(result.error || 'Failed to update attendance status');
        }
      })();

      showToastPromise({
        promise: updatePromise,
        loadingText: 'Updating attendance status...',
        successText: 'Attendance status updated successfully',
        successHeaderText: 'Status Updated',
        errorText: 'Failed to update attendance status. Please try again.',
        errorHeaderText: 'Update Failed',
        direction: 'right'
      });
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Badge className={`${currentClassName} cursor-pointer hover:scale-105  transition-all duration-200 flex items-center gap-1 px-2 py-1 w-fit`}>
            {currentStatus?.label || status}
            <ChevronDown className="h-3 w-3 stroke-2" />
          </Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className="cursor-pointer"
            >
              <div className={`w-3 h-3 rounded-full mr-2 ${option.className.replace('bg-', 'bg-').replace(' text-', '')}`}></div>
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const handleRecordAttendance = async () => {
    if (!selectedWorkshop || !selectedClass) {
      showToastError({
        headerText: 'Missing Information',
        paragraphText: 'Please select both workshop and class'
      });
      return;
    }

    // Check if at least one student has a status selected
    const studentsWithStatus = Object.values(selectedStudents).filter(status => status);
    if (studentsWithStatus.length === 0) {
      showToastError({
        headerText: 'No Students Selected',
        paragraphText: 'Please mark attendance for at least one student'
      });
      return;
    }

    const attendanceRecords = Object.entries(selectedStudents)
      .filter(([_, status]) => status) // Only include students with status
      .map(([studentId, status]) => ({
        studentId: parseInt(studentId),
        status
      }));

    setRecordingAttendance(true);
    
    const attendancePromise = (async () => {
      const response = await fetch('/api/attendance/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workshopId: parseInt(selectedWorkshop),
          classId: parseInt(selectedClass),
          adminId: adminId,
          attendanceRecords
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to record attendance');
      }

      setIsRecordDialogOpen(false);
      setSelectedStudents({});
      setSelectedWorkshop("");
      setSelectedClass("all");
      setSelectedClassId(null);
      
      // Refresh attendance records to update metrics
      try {
        const response = await fetch('/api/attendance/record');
        const result = await response.json();
        
        if (response.ok && result.data) {
          const transformedRecords = result.data.map((record: any) => ({
            id: record.id,
            student: record.student,
            status: record.status,
            created_at: record.created_at,
            workshop_title: record.session?.workshop?.title || 'Unknown Workshop',
            class_name: record.session?.class?.name || 'Unknown Class'
          }));
          setAttendanceRecords(transformedRecords);
        }
      } catch (error) {
        console.error('Error refreshing attendance records:', error);
      }
      
      return result;
    })();

    // Handle the promise properly
    attendancePromise
      .then(() => {
        setRecordingAttendance(false);
      })
      .catch(() => {
        setRecordingAttendance(false);
      });

    showToastPromise({
      promise: attendancePromise,
      loadingText: 'Recording attendance...',
      successText: 'This record will appear in your history.',
      successHeaderText: 'Attendance Recorded Successfully',
      errorText: 'Please try again.',
      errorHeaderText: 'Failed to record attendance',
      direction: 'right'
    });
  };

// Add this debugging code right before your filteredRecords filter function
console.log('=== FILTER DEBUG ===');
console.log('Filter states:', {
  selectedClass: `"${selectedClass}"`,
  selectedClassType: typeof selectedClass,
  selectedStatus: `"${selectedStatus}"`,
  selectedDate: `"${selectedDate}"`,
  selectedWorkshopFilter: `"${selectedWorkshopFilter}"`,
  searchQuery: `"${searchQuery}"`
});

// Test the first few records individually
const sampleRecords = attendanceRecords.slice(0, 3);
sampleRecords.forEach((record, index) => {
  const matchesSearch = record.student?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       record.student?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       record.student?.student_id?.toLowerCase().includes(searchQuery.toLowerCase());
  
  const matchesClass = !selectedClass || selectedClass === "all" || record.class_name?.includes(selectedClass);
  const matchesDate = !selectedDate || record.created_at?.startsWith(selectedDate);
  const matchesStatus = !selectedStatus || selectedStatus === "all" || record.status === selectedStatus;
  const matchesWorkshop = !selectedWorkshopFilter || selectedWorkshopFilter === "all" || record.workshop_title === selectedWorkshopFilter;
  
  console.log(`Record ${index + 1}:`, {
    student_name: `${record.student?.first_name} ${record.student?.last_name}`,
    class_name: record.class_name,
    status: record.status,
    workshop_title: record.workshop_title,
    created_at: record.created_at,
    // Filter results:
    matchesSearch,
    matchesClass,
    matchesDate, 
    matchesStatus,
    matchesWorkshop,
    // Detailed breakdown:
    searchCheck: {
      hasFirstName: !!record.student?.first_name,
      hasLastName: !!record.student?.last_name,
      hasStudentId: !!record.student?.student_id,
      searchQueryEmpty: searchQuery === ""
    },
    classCheck: {
      selectedClassEmpty: !selectedClass,
      selectedClassIsAll: selectedClass === "all",
      classNameExists: !!record.class_name,
      includesCheck: record.class_name?.includes(selectedClass)
    },
    statusCheck: {
      selectedStatusEmpty: !selectedStatus,
      selectedStatusIsAll: selectedStatus === "all", 
      statusMatch: record.status === selectedStatus
    }
  });
});
console.log('=== END FILTER DEBUG ===');

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.student?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.student?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.student?.student_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = !selectedClass || selectedClass === "all" || record.class_name?.includes(selectedClass);
    const matchesDate = !selectedDate || record.created_at?.startsWith(selectedDate);
    const matchesStatus = !selectedStatus || selectedStatus === "all" || record.status === selectedStatus;
    const matchesWorkshop = !selectedWorkshopFilter || selectedWorkshopFilter === "all" || record.workshop_title === selectedWorkshopFilter;
    
    // Filter by selected week
    const weekOptions = generateWeekOptions();
    const selectedWeekOption = weekOptions.find(option => option.value === selectedWeek);
    let matchesWeek = true;
    
    if (selectedWeekOption) {
      const dateRangeMatch = selectedWeekOption.label.match(/\(([^)]+)\)/);
      if (dateRangeMatch) {
        const [startDateStr, endDateStr] = dateRangeMatch[1].split(' - ');
        
        // Parse dates more reliably
        const parseDate = (dateStr: string) => {
          const today = new Date();
          const currentYear = today.getFullYear();
          
          // Try to parse the date with the current year
          const dateWithYear = new Date(`${dateStr}, ${currentYear}`);
          
          // If the parsed date is invalid, return null
          if (isNaN(dateWithYear.getTime())) {
            return null;
          }
          
          // If the date is in the future and we're in the latter part of the year,
          // it might be from last year
          if (dateWithYear > today && today.getMonth() >= 10) {
            return new Date(`${dateStr}, ${currentYear - 1}`);
          }
          
          return dateWithYear;
        };
        
        const startDate = parseDate(startDateStr);
        const endDate = parseDate(endDateStr);
        
        if (startDate && endDate) {
          // Set end date to end of day for inclusive comparison
          endDate.setHours(23, 59, 59, 999);
          
          const recordDate = new Date(record.created_at);
          matchesWeek = recordDate >= startDate && recordDate <= endDate;
        }
      }
    }
    
    return matchesSearch && matchesClass && matchesDate && matchesStatus && matchesWorkshop && matchesWeek;
  });

  // Get unique workshops from attendance records
  const uniqueWorkshops = Array.from(new Set(attendanceRecords.map(record => record.workshop_title))).sort();

  // Debug logging
  console.log('Records summary:', {
    totalRecords: attendanceRecords.length,
    filteredRecords: filteredRecords.length,
    selectedWeek,
    selectedClass,
    selectedStatus,
    selectedWorkshopFilter,
    searchQuery
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

  // Calculate real metrics from attendance records for selected week
  const calculateMetrics = () => {
    const today = new Date();
    const weekOptions = generateWeekOptions();
    const selectedWeekOption = weekOptions.find(option => option.value === selectedWeek);
    
    if (!selectedWeekOption) return;
    
    // Parse the date range from the selected week
    const dateRangeMatch = selectedWeekOption.label.match(/\(([^)]+)\)/);
    if (!dateRangeMatch) return;
    
    const [startDateStr, endDateStr] = dateRangeMatch[1].split(' - ');
    
    // Parse dates more reliably
    const parseDate = (dateStr: string) => {
      const currentYear = today.getFullYear();
      
      // Try to parse the date with the current year
      const dateWithYear = new Date(`${dateStr}, ${currentYear}`);
      
      // If the parsed date is invalid, return null
      if (isNaN(dateWithYear.getTime())) {
        return null;
      }
      
      // If the date is in the future and we're in the latter part of the year,
      // it might be from last year
      if (dateWithYear > today && today.getMonth() >= 10) {
        return new Date(`${dateStr}, ${currentYear - 1}`);
      }
      
      return dateWithYear;
    };
    
    const startDate = parseDate(startDateStr);
    const endDate = parseDate(endDateStr);
    
    if (!startDate || !endDate) return;
    
    // Set end date to end of day for inclusive comparison
    endDate.setHours(23, 59, 59, 999);
    
    // Filter records for the selected week
    const weekRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.created_at);
      return recordDate >= startDate && recordDate <= endDate;
    });
    
    // Calculate metrics for the selected week
    const presentCount = weekRecords.filter(record => record.status === 'present').length;
    const lateCount = weekRecords.filter(record => record.status === 'late').length;
    const absentCount = weekRecords.filter(record => record.status === 'absent').length;
    const totalStudents = presentCount + lateCount + absentCount;
    
    // Calculate comparison week (previous week)
    const comparisonStartDate = new Date(startDate);
    comparisonStartDate.setDate(startDate.getDate() - 7);
    const comparisonEndDate = new Date(endDate);
    comparisonEndDate.setDate(endDate.getDate() - 7);
    
    const comparisonRecords = attendanceRecords.filter(record => {
      const recordDate = new Date(record.created_at);
      return recordDate >= comparisonStartDate && recordDate <= comparisonEndDate;
    });
    
    const presentLastWeek = comparisonRecords.filter(record => record.status === 'present').length;
    const lateLastWeek = comparisonRecords.filter(record => record.status === 'late').length;
    const absentLastWeek = comparisonRecords.filter(record => record.status === 'absent').length;

    // Calculate average check-in time (simplified)
    const presentRecords = weekRecords.filter(record => record.status === 'present');
    const averageTime = presentRecords.length > 0 ? "08:25 AM" : "00:00";

    setRealStats({
      totalStudents,
      presentToday: presentCount,
      lateToday: lateCount,
      absentToday: absentCount,
      averageCheckIn: averageTime,
      presentLastWeek,
      lateLastWeek,
      absentLastWeek
    });
  };

  // Helper functions to calculate trend indicators
  const calculateTrend = (current: number, previous: number) => {
    const difference = current - previous;
    const isIncrease = difference > 0;
    const isDecrease = difference < 0;
    const absoluteDifference = Math.abs(difference);
    
    return {
      difference: absoluteDifference,
      isIncrease,
      isDecrease,
      hasChange: difference !== 0
    };
  };

  const getTrendDisplay = (current: number, previous: number, metricName: string) => {
    const trend = calculateTrend(current, previous);
    
    if (!trend.hasChange) {
      return {
        text: `No change from last week`,
        color: "text-gray-500",
        icon: null
      };
    }
    
    const icon = trend.isIncrease ? TrendingUp : TrendingDown;
    const color = trend.isIncrease ? "text-green-600" : "text-red-600";
    const direction = trend.isIncrease ? "+" : "-";
    
    return {
      text: `${direction}${trend.difference} from last week`,
      color,
      icon
    };
  };

  // Bulletproof CSV cell encoder
  const csvCell = (v: any) => {
    const s = v == null ? '' : String(v);
    const needsQuotes = /[",\n\r]/.test(s);
    const escaped = s.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  // CSV Export function
  const exportToCSV = () => {
    // Get the filtered records (all records, not just current page)
    const recordsToExport = filteredRecords;
    
    if (recordsToExport.length === 0) {
      alert('No data to export');
      return;
    }

    // Define CSV headers
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

    // Convert records to CSV rows with bulletproof encoding
    const csvRows = [
      headers.map(csvCell).join(','), // Header row
      ...recordsToExport.map(record => [
        record.student?.student_id,
        record.student?.first_name,
        record.student?.last_name,
        record.student?.grade,
        record.student?.major_short,
        record.workshop_title,
        record.status,
        format(new Date(record.created_at), "yyyy-MM-dd"),
        record.class_name
      ].map(csvCell).join(','))
    ];

    // Create CSV content with UTF-8 BOM for Excel compatibility
    const csvContent = '\ufeff' + csvRows.join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    // Generate filename with current date and time
    const currentDate = format(new Date(), "yyyy-MM-dd_HH-mm");
    const filename = `attendance_export_${currentDate}.csv`;
    
    // Check if download is supported
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      
      // Memory cleanup
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } else {
      // Fallback for older browsers
      const url = URL.createObjectURL(blob);
      window.open(url);
      // Clean up after a delay to allow the window to open
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border p-4 bg-white">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-3 w-24 mb-1" />
                <Skeleton className="h-5 w-12 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>

        {/* Attendance History Card Skeleton */}
        <Card >
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-8 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>

            {/* Table Skeleton */}
            <div className="rounded-md border">
              <div className="p-4">
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-16" />
                      <div className="flex items-center space-x-3 flex-1">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-cal-sans mb-1">Attendance Dashboard</h1>
          <p className="text-gray-600 text-md">Track student attendance and manage records</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Week Selector */}
          <div className="flex items-center gap-2">
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="w-64 rounded-xl">
                <SelectValue placeholder="Select week" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {generateWeekOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Dialog open={isRecordDialogOpen} onOpenChange={(open) => {
            setIsRecordDialogOpen(open);
            if (!open) {
              // Reset all popover state when dialog closes
              setSelectedClass("all");
              setSelectedClassId(null);
              setSelectedWorkshop("");
              setSelectedStudents({});
              setFilteredWorkshops([]);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200 ">
                <Plus className="h-4 w-4 mr-2" />
                Record Attendance
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Record Student Attendance</DialogTitle>
                <DialogDescription>
                  Select a workshop and class, then mark attendance for each student.
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex-1 overflow-hidden flex flex-col">
                {/* Selection Controls */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="class" className="text-sm font-medium">Class</Label>
                    <Select value={selectedClass} onValueChange={handleClassChange} disabled={classesLoading}>
                      <SelectTrigger className="mt-1 rounded-xl">
                        <SelectValue placeholder={classesLoading ? "Loading classes..." : "Select class"} />
                      </SelectTrigger>
                      <SelectContent>
                        {classesLoading ? (
                          <div className="flex items-center justify-center p-4">
                            <div className="animate-spin h-5 w-5 border-2 border-orange-600 border-t-transparent rounded-full"></div>
                            <span className="ml-2 text-sm text-gray-500">Loading classes...</span>
                            </div>
                        ) : (
                          Array.isArray(classes) ? classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id.toString()}>
                              {cls.name}
                          </SelectItem>
                          )) : (
                            <div className="p-4 text-center text-gray-500">
                              No classes available
                            </div>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="workshop" className="text-sm font-medium">Workshop</Label>
                    <Select value={selectedWorkshop} onValueChange={setSelectedWorkshop} disabled={selectedClass === "all" || loadingWorkshops}>
                      <SelectTrigger className="mt-1 rounded-xl">
                        <SelectValue placeholder={loadingWorkshops ? "Loading workshops..." : "Select workshop"}>
                          {selectedWorkshop && Array.isArray(filteredWorkshops) ? 
                            filteredWorkshops.find(w => w.id.toString() === selectedWorkshop)?.title || "Select workshop"
                            : "Select workshop"
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {loadingWorkshops ? (
                          <div className="flex items-center justify-center p-4">
                            <div className="animate-spin h-5 w-5 border-2 border-orange-600 border-t-transparent rounded-full"></div>
                            <span className="ml-2 text-sm text-gray-500">Loading workshops...</span>
                          </div>
                        ) : (
                          Array.isArray(filteredWorkshops) && filteredWorkshops.length > 0 ? filteredWorkshops.map((workshop) => (
                            <SelectItem key={workshop.id} value={workshop.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">{workshop.title}</span>
                                <span className="text-xs text-gray-500">{format(new Date(workshop.date), "MMM dd, yyyy")}</span>
                              </div>
                          </SelectItem>
                          )) : (
                            <div className="p-4 text-center text-gray-500">
                              No workshops found for this class
                            </div>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Student List */}
                {selectedWorkshop && selectedClass !== "all" && !loadingWorkshops && (
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Student Attendance</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Quick Actions:</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const allPresent = students.reduce((acc, student) => {
                              acc[student.id] = 'present';
                              return acc;
                            }, {} as {[key: number]: 'present' | 'absent' | 'late' | 'excused'});
                            setSelectedStudents(allPresent);
                          }}
                          disabled={loadingStudents || students.length === 0}
                        >
                          Mark All Present
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedStudents({})}
                          disabled={loadingStudents}
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto border rounded-lg">
                      {loadingStudents ? (
                        <div className="flex items-center justify-center p-8">
                          <div className="text-center">
                            <div className="animate-spin h-8 w-8 border-2 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading students...</p>
                          </div>
                        </div>
                      ) : students.length === 0 ? (
                        <div className="flex items-center justify-center p-8">
                          <div className="text-center">
                            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 mb-2">No students found</p>
                            <p className="text-sm text-gray-400">There are no students enrolled in this class</p>
                          </div>
                        </div>
                                          ) : (
                        <div className="space-y-4 p-4">
                          {(() => {
                            // Group students by major_short
                            const groupedStudents = students.reduce((groups, student) => {
                              const major = student.major_short || 'Other';
                              if (!groups[major]) {
                                groups[major] = [];
                              }
                              groups[major].push(student);
                              return groups;
                            }, {} as Record<string, typeof students>);

                            // Sort majors alphabetically
                            const sortedMajors = Object.keys(groupedStudents).sort();

                            return sortedMajors.map((major) => (
                              <div key={major} className="space-y-2">
                                {/* Major Header */}
                                <div className="flex items-center space-x-2 py-2  border-gray-200">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                                    {major} ({groupedStudents[major].length} students)
                                  </h4>
                                </div>
                                
                                {/* Students in this major */}
                                <div className="space-y-2 ml-4">
                                  {groupedStudents[major]
                                    .sort((a, b) => a.first_name.localeCompare(b.first_name))
                                    .map((student) => (
                                      <div key={student.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center space-x-3">
                                          <Avatar className="h-8 w-8">
                                            <AvatarFallback>
                                              {student.first_name[0]}{student.last_name[0]}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <div className="font-medium text-sm">{student.first_name} {student.last_name}</div>
                                            <div className="text-xs text-gray-500">{student.grade} • {student.major_short}</div>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className={`w-32 justify-between px-3 ${
                                                  selectedStudents[student.id] === 'present' ? 'bg-green-50 border-green-300 text-green-700' :
                                                  selectedStudents[student.id] === 'late' ? 'bg-orange-50 border-orange-300 text-orange-700' :
                                                  selectedStudents[student.id] === 'absent' ? 'bg-red-50 border-red-300 text-red-700' :
                                                  selectedStudents[student.id] === 'excused' ? 'bg-blue-50 border-blue-300 text-blue-700' :
                                                  'border-gray-300'
                                                }`}
                                              >
                                                <div className="flex items-center">
                                                  {selectedStudents[student.id] === 'present' && <UserCheck className="h-4 w-4 mr-2" />}
                                                  {selectedStudents[student.id] === 'late' && <Clock className="h-4 w-4 mr-2" />}
                                                  {selectedStudents[student.id] === 'absent' && <UserX className="h-4 w-4 mr-2" />}
                                                  {selectedStudents[student.id] === 'excused' && <AlertCircle className="h-4 w-4 mr-2" />}
                                                  <span className="truncate">{selectedStudents[student.id] || 'Select Status'}</span>
                                                </div>
                                                <ChevronDown className="h-4 w-4 mr-2 flex-shrink-0" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-32">
                                              <DropdownMenuItem
                                                onClick={() => setSelectedStudents(prev => {
                                                  const newState = { ...prev };
                                                  if (selectedStudents[student.id] === 'present') {
                                                    delete newState[student.id];
                                                  } else {
                                                    newState[student.id] = 'present';
                                                  }
                                                  return newState;
                                                })}
                                                className="flex items-center"
                                              >
                                                <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                                                Present
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                onClick={() => setSelectedStudents(prev => {
                                                  const newState = { ...prev };
                                                  if (selectedStudents[student.id] === 'late') {
                                                    delete newState[student.id];
                                                  } else {
                                                    newState[student.id] = 'late';
                                                  }
                                                  return newState;
                                                })}
                                                className="flex items-center"
                                              >
                                                <Clock className="h-4 w-4 mr-2 text-orange-600" />
                                                Late
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                onClick={() => setSelectedStudents(prev => {
                                                  const newState = { ...prev };
                                                  if (selectedStudents[student.id] === 'absent') {
                                                    delete newState[student.id];
                                                  } else {
                                                    newState[student.id] = 'absent';
                                                  }
                                                  return newState;
                                                })}
                                                className="flex items-center"
                                              >
                                                <UserX className="h-4 w-4 mr-2 text-red-600" />
                                                Absent
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                onClick={() => setSelectedStudents(prev => {
                                                  const newState = { ...prev };
                                                  if (selectedStudents[student.id] === 'excused') {
                                                    delete newState[student.id];
                                                  } else {
                                                    newState[student.id] = 'excused';
                                                  }
                                                  return newState;
                                                })}
                                                className="flex items-center"
                                              >
                                                <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
                                                Excused
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter className="flex-shrink-0">
                <div className="flex items-center justify-between w-full">
                  <div className="text-sm text-gray-600">
                    {(() => {
                      const selectedCount = Object.values(selectedStudents).filter(status => status).length;
                      const totalCount = students.length;
                      return selectedCount === 0 ? (
                        <span>No students marked</span>
                      ) : (
                        <span>
                          {loadingStudents ? "Loading..." : `${Object.values(selectedStudents).filter(status => status).length} students marked`}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="rounded-xl" onClick={() => {
                       setIsRecordDialogOpen(false);
                       setSelectedStudents({});
                       setSelectedWorkshop("");
                       setSelectedClass("all");
                      setSelectedClassId(null);
                      setFilteredWorkshops([]);
                     }}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleRecordAttendance} 
                      disabled={!selectedWorkshop || selectedClass === "all" || loadingStudents || students.length === 0 || Object.values(selectedStudents).filter(status => status).length === 0 || recordingAttendance}
                      className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200 "
                    >
                      {recordingAttendance ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        "Record Attendance"
                      )}
                    </Button>
                  </div>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Students Present */}
        <div className="flex flex-col gap-1 rounded-xl border p-4 bg-white">
          <div className="flex flex-row items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
            <div className="flex flex-col">
            <p className="text-xs text-neutral-500 mb-1">Total Students Present</p>
              <div className="text-lg font-semibold mb-1">{realStats.presentToday}</div>
            </div>
          </div>
          <div className="flex items-center text-xs gap-1">
            {(() => {
              const trend = getTrendDisplay(realStats.presentToday, realStats.presentLastWeek, "present");
              const IconComponent = trend.icon;
              return (
                <div className={`flex items-center text-xs ${trend.color}`}>
                  {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
                  {trend.text}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Late Arrivals */}
        <div className="flex flex-col gap-1 rounded-xl border p-4 bg-white">
          <div className="flex flex-row items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
            <div className="flex flex-col">
              <p className="text-xs text-neutral-500 mb-1">Late Arrivals</p>
              <div className="text-lg font-semibold mb-1">{realStats.lateToday}</div>
            </div>
          </div>
          <div className="flex items-center text-xs gap-1">
            {(() => {
              const trend = getTrendDisplay(realStats.lateToday, realStats.lateLastWeek, "late");
              const IconComponent = trend.icon;
              return (
                <div className={`flex items-center text-xs ${trend.color}`}>
                  {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
                  {trend.text}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Students Absent */}
        <div className="flex flex-col gap-1 rounded-xl border p-4 bg-white">
          <div className="flex flex-row items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
            <UserX className="h-6 w-6" />
          </div>
            <div className="flex flex-col">
            <p className="text-xs text-neutral-500 mb-1">Students Absent</p>
              <div className="text-lg font-semibold mb-1">{realStats.absentToday}</div>
            </div>
          </div>
          <div className="flex items-center text-xs gap-1">
            {(() => {
              const trend = getTrendDisplay(realStats.absentToday, realStats.absentLastWeek, "absent");
              const IconComponent = trend.icon;
              return (
                <div className={`flex items-center text-xs ${trend.color}`}>
                  {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
                  {trend.text}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <Card className="border  shadow-none border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Attendance History</CardTitle>
            <div className="flex items-center gap-3">
            {(selectedClass !== "all" || selectedStatus !== "all" || selectedWorkshopFilter !== "all" || selectedDate || searchQuery) && (
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
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="class-filter">Select Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="All classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.name}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            
            <div className="flex-1">
              <Label htmlFor="status-filter">Select Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
              <Select value={selectedWorkshopFilter} onValueChange={setSelectedWorkshopFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All workshops" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All workshops</SelectItem>
                  {(() => {
                    // If no specific class is selected, show all workshops
                    if (selectedClass === "all") {
                      return uniqueWorkshops.map((workshop) => (
                        <SelectItem key={workshop} value={workshop}>
                          {workshop}
                        </SelectItem>
                      ));
                    } else {
                      // If a specific class is selected, only show workshops for that class
                      const classWorkshops = attendanceRecords
                        .filter(record => record.class_name === selectedClass)
                        .map(record => record.workshop_title);
                      
                      // Remove duplicates and sort
                      const uniqueClassWorkshops = Array.from(new Set(classWorkshops)).sort();
                      
                      return uniqueClassWorkshops.map((workshop) => (
                        <SelectItem key={workshop} value={workshop}>
                          {workshop}
                        </SelectItem>
                      ));
                    }
                  })()}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            

          </div>



          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Workshop</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">No attendance records found</h3>
                          <p className="text-gray-500 text-sm">
                            {filteredRecords.length === 0 && attendanceRecords.length === 0 
                              ? "No attendance has been recorded yet. Start by recording attendance for a workshop."
                              : "No records match your current filters. Try adjusting your search criteria."
                            }
                          </p>
                        </div>
                        
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {record.student.first_name[0]}{record.student.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{record.student.first_name} {record.student.last_name}</div>
                            <div className="text-sm text-gray-500">{record.student.grade} • {record.student.major_short}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{record.workshop_title}</TableCell>
                      <TableCell>{getStatusBadge(record.status, record.id)}</TableCell>
                      <TableCell>{format(new Date(record.created_at), "MMM dd, yyyy")}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

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
                    
                    // Adjust start page if we're near the end
                    if (endPage - startPage < maxVisiblePages - 1) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }
                    
                    const pages = [];
                    
                    // Add first page and ellipsis if needed
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
                        pages.push(
                          <span key="ellipsis1" className="px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                    }
                    
                    // Add visible page numbers
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <Button
                          key={i}
                          variant={currentPage === i ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(i)}
                          className={`w-8 h-8 p-0 ${
                            currentPage === i 
                              ? "bg-black text-white hover:bg-black/90" 
                              : ""
                          }`}
                        >
                          {i}
                        </Button>
                      );
                    }
                    
                    // Add last page and ellipsis if needed
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span key="ellipsis2" className="px-2 text-gray-400">
                            ...
                          </span>
                        );
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
    </div>
  );
}
