"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "../../../../../../zenith/src/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../../../zenith/src/components/ui/popover";
import { Badge } from "../../../../../../zenith/src/components/ui/badge";
import { Input } from "../../../../../../zenith/src/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../zenith/src/components/ui/table";
import { Skeleton } from "../../../../../../zenith/src/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../../zenith/src/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../../../../zenith/src/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../../../../zenith/src/components/ui/dialog";
import { Calendar, Clock, Download, Filter, Search, Upload, ChevronLeft, ChevronRight, FileText, Users, CheckCircle2, XCircle, ArrowUpRight, ChevronsUpDown, Check, Eye } from "lucide-react";

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

// CRC Class type
type CrcClass = {
  id: string;
  name: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  num_students: number;
};

// Workshop type from junction table
type Workshop = {
  id: string;
  title: string;
  description: string;
  has_assignment: boolean;
  date: string;
  presentation_url?: string;
  created_at: string;
  crc_classes: Array<{ id: string; name: string }>;
  assignments: Array<{ id: string; title: string }>;
};

// Simplified navigation state interface
interface NavigationState {
  selectedClass: string | null;
  selectedSubClass: string | null;
  selectedWorkshop: string | null;
  assignmentId: string | null;
}

type Row = {
  student_id: string;
  name: string;
  email: string;
  status: "submitted" | "not_yet_submitted";
  submitted_at: string | null;
  submission_type: string;
  on_time: boolean | null;
  google_doc_link?: string | null;
  file_upload_link?: string | null;
  view_url?: string | null;
  crc_class_name?: string | null;
};

type AssignmentLite = { id: string; title: string; workshop_title?: string | null; workshop_crc_class?: string | null };

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Helper function to determine if a class is EY, S4, S5, or S6
function isEyOrS4S5S6Class(className: string): boolean {
  const lowerName = className.toLowerCase();
  return lowerName.includes('ey') || 
         lowerName.includes('enrichment') || 
         lowerName.includes('s4') || 
         lowerName.includes('senior 4') ||
         lowerName.includes('senior_4') ||
         lowerName.includes('s5') ||
         lowerName.includes('senior 5') ||
         lowerName.includes('senior_5') ||
         lowerName.includes('s6') ||
         lowerName.includes('senior 6') ||
         lowerName.includes('senior_6');
}

// Helper function to determine if a class is EY
function isEyClass(className: string): boolean {
  const lowerName = className.toLowerCase();
  return lowerName.includes('ey') || lowerName.includes('enrichment');
}

// Helper function to determine if a class is S4
function isS4Class(className: string): boolean {
  const lowerName = className.toLowerCase();
  return lowerName.includes('s4') || lowerName.includes('senior 4') || lowerName.includes('senior_4');
}

// Helper function to determine if a class is S5
function isS5Class(className: string): boolean {
  const lowerName = className.toLowerCase();
  return lowerName.includes('s5') || lowerName.includes('senior 5') || lowerName.includes('senior_5');
}

// Helper function to determine if a class is S6
function isS6Class(className: string): boolean {
  const lowerName = className.toLowerCase();
  return lowerName.includes('s6') || lowerName.includes('senior 6') || lowerName.includes('senior_6');
}

// Helper function to group classes for display
function groupCrcClasses(classes: CrcClass[]): Array<{ id: string; name: string; isGroup: boolean; classes?: CrcClass[] }> {
  const eyClasses = classes.filter(c => isEyClass(c.name));
  const s4Classes = classes.filter(c => isS4Class(c.name));
  const s5Classes = classes.filter(c => isS5Class(c.name));
  const s6Classes = classes.filter(c => isS6Class(c.name));
  const otherClasses = classes.filter(c => !isEyOrS4S5S6Class(c.name));
  
  const grouped = [];
  
  // Add EY as a group if there are any
  if (eyClasses.length > 0) {
    grouped.push({
      id: 'ey_group',
      name: 'Enrichment Year',
      isGroup: true,
      classes: eyClasses
    });
  }
  
  // Add S4 as a group if there are any
  if (s4Classes.length > 0) {
    grouped.push({
      id: 's4_group',
      name: 'Senior 4',
      isGroup: true,
      classes: s4Classes
    });
  }
  
  // Add S5 as a group if there are any
  if (s5Classes.length > 0) {
    grouped.push({
      id: 's5_group',
      name: 'Senior 5',
      isGroup: true,
      classes: s5Classes
    });
  }
  
  // Add S6 as a group if there are any
  if (s6Classes.length > 0) {
    grouped.push({
      id: 's6_group',
      name: 'Senior 6',
      isGroup: true,
      classes: s6Classes
    });
  }
  
  // Add other classes individually
  otherClasses.forEach(c => {
    grouped.push({
      id: c.id,
      name: c.name,
      isGroup: false,
      classes: [c]
  });
  });
  
  return grouped;
}

// Fix the grouping logic bug - only treat actual groups as groups
function shouldShowSubClassSelection(selectedClass: string | null, groupedClasses: Array<{ id: string; name: string; isGroup: boolean; classes?: CrcClass[] }>): boolean {
  if (!selectedClass) return false;
  
  const classGroup = groupedClasses.find(g => g.id === selectedClass);
  return classGroup?.isGroup === true; // Only true groups, not individual classes
}

// =============================================================================
// SIMPLIFIED STATE MANAGEMENT HOOK
// =============================================================================

const useAssignmentNavigation = () => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSubClass, setSelectedSubClass] = useState<string | null>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState<string | null>(null);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Single effect for URL synchronization
  useEffect(() => {
    const urlClass = searchParams.get('crcClassId');
    const urlSubClass = searchParams.get('subClassId');  
    const urlWorkshop = searchParams.get('workshopId');
    const urlAssignment = searchParams.get('assignmentId');
    
    // Set state from URL with fallback to existing state values
    setSelectedClass(urlClass || selectedClass);
    setSelectedSubClass(urlSubClass || selectedSubClass);
    setSelectedWorkshop(urlWorkshop || selectedWorkshop);
    setAssignmentId(urlAssignment || assignmentId);
  }, [searchParams, selectedClass, selectedSubClass, selectedWorkshop, assignmentId]);
  
  // Single function to update navigation state
  const updateNavigation = useCallback((updates: Partial<NavigationState>) => {
      const params = new URLSearchParams();
    
    // Calculate new state
    const newClass = updates.selectedClass !== undefined ? updates.selectedClass : selectedClass;
    const newSubClass = updates.selectedSubClass !== undefined ? updates.selectedSubClass : selectedSubClass;
    const newWorkshop = updates.selectedWorkshop !== undefined ? updates.selectedWorkshop : selectedWorkshop;
    const newAssignment = updates.assignmentId !== undefined ? updates.assignmentId : assignmentId;
    
    // Clear dependent selections when parent changes
    let finalSubClass = newSubClass;
    let finalWorkshop = newWorkshop;
    let finalAssignment = newAssignment;
    
    if (updates.selectedClass !== undefined && updates.selectedClass !== selectedClass) {
      finalSubClass = null;
      finalWorkshop = null;
      finalAssignment = null;
    }
    if (updates.selectedSubClass !== undefined && updates.selectedSubClass !== selectedSubClass) {
      finalWorkshop = null;
      finalAssignment = null;
    }
    if (updates.selectedWorkshop !== undefined && updates.selectedWorkshop !== selectedWorkshop) {
      finalAssignment = null;
    }
    
    // Build URL
    if (newClass) params.set('crcClassId', newClass);
    if (finalSubClass) params.set('subClassId', finalSubClass);
    if (finalWorkshop) params.set('workshopId', finalWorkshop);
    if (finalAssignment) params.set('assignmentId', finalAssignment);
    
    router.push(`/dashboard/admin/testing?${params.toString()}`);
  }, [selectedClass, selectedSubClass, selectedWorkshop, assignmentId, router]);
  
  // Helper to get the effective class ID for API calls with fallback to URL params
  const getEffectiveClassId = useCallback(() => {
    const urlSubClass = searchParams.get('subClassId');
    const urlClass = searchParams.get('crcClassId');
    return selectedSubClass || urlSubClass || selectedClass || urlClass;
  }, [selectedSubClass, selectedClass, searchParams]);
  
  return {
    selectedClass,
    selectedSubClass,
    selectedWorkshop,
    assignmentId,
    updateNavigation,
    getEffectiveClassId
  };
};

// =============================================================================
// SIMPLIFIED DATA FETCHING HOOK
// =============================================================================

const useAssignmentData = () => {
  const { selectedClass, selectedSubClass, selectedWorkshop, assignmentId, getEffectiveClassId } = useAssignmentNavigation();
  
  // Get the effective class ID for filtering
  const effectiveClassId = getEffectiveClassId();
  
  // State for data
  const [classes, setClasses] = useState<CrcClass[]>([]);
  const [allWorkshops, setAllWorkshops] = useState<Workshop[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [assignments, setAssignments] = useState<AssignmentLite[]>([]);
  const [assignmentData, setAssignmentData] = useState<any>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [metrics, setMetrics] = useState({ total_students: 0, total_submitted: 0 });
  
  // Clear assignment data when class or subclass changes
  useEffect(() => {
    setAssignmentData(null);
    setRows([]);
    setMetrics({ total_students: 0, total_submitted: 0 });
    setAssignmentDataLoading(false);
  }, [selectedClass, selectedSubClass]);
  
  // Loading states
  const [classesLoading, setClassesLoading] = useState(false);
  const [workshopsLoading, setWorkshopsLoading] = useState(false);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentDataLoading, setAssignmentDataLoading] = useState(false);
  const [workshopsFetched, setWorkshopsFetched] = useState(false);
  
  // Fetch classes and all workshops on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setClassesLoading(true);
      setWorkshopsLoading(true);
      
      try {
        // Fetch classes and workshops in parallel
        const [classesResponse, workshopsResponse] = await Promise.all([
          fetch('/api/admin/crc-classes'),
          fetch('/api/admin/workshops?useCase=assignment')
        ]);
        
        const classesData = await classesResponse.json();
        const workshopsData = await workshopsResponse.json();
        
        if (classesData.classes) {
          setClasses(classesData.classes);
          console.log("classes", classesData.classes);
        }
        
        if (workshopsData.workshops) {
          setAllWorkshops(workshopsData.workshops);
          console.log('Fetched all workshops:', workshopsData.workshops.length);
        }
        

      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      } finally {
        setClassesLoading(false);
        setWorkshopsLoading(false);
        setWorkshopsFetched(true);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Filter workshops based on effective class ID
  useEffect(() => {
    if (!effectiveClassId) {
      setWorkshops([]);
      return;
    }
    
    // Filter workshops that belong to the selected class
    const filteredWorkshops = allWorkshops.filter(workshop => 
      workshop.crc_classes.some(crcClass => crcClass.id === effectiveClassId)
    );
    
    console.log('Filtered workshops for class', effectiveClassId, ':', filteredWorkshops.length);
    setWorkshops(filteredWorkshops);
  }, [effectiveClassId, allWorkshops]);
  
  // Fetch assignment data when we have an assignment ID
  useEffect(() => {
    // Always clear old data when assignmentId changes (including when it becomes null)
    setAssignmentData(null);
    setRows([]);
    setMetrics({ total_students: 0, total_submitted: 0 });
    
    if (!assignmentId || !effectiveClassId) {
      setAssignmentDataLoading(false);
      return;
    }
    
    setAssignmentDataLoading(true); // Start loading for new assignment
    
    const fetchAssignmentData = async () => {
      try {
        const response = await fetch(`/api/admin/assignments/for-management?assignmentId=${assignmentId}&selectedClassId=${effectiveClassId}`);
        const data = await response.json();
        if (data.assignment) {
          setAssignmentData(data.assignment);
          setRows(data.rows || []);
          setMetrics(data.metrics || { total_students: 0, total_submitted: 0 });
        }
      } catch (error) {
        console.error('Failed to fetch assignment data:', error);
      } finally {
        setAssignmentDataLoading(false);
      }
    };
    
    fetchAssignmentData();
  }, [assignmentId, effectiveClassId]);
  
  // Fetch assignments list when we have an effective class ID
  useEffect(() => {
    if (!effectiveClassId) {
      setAssignments([]);
        return;
      }
      
    const fetchAssignments = async () => {
      setAssignmentsLoading(true);
      try {
        const response = await fetch(`/api/admin/assignments/for-management?selectedClassId=${effectiveClassId}`);
        const data = await response.json();
        if (data.assignments) {
          setAssignments(data.assignments);
        }
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
      } finally {
        setAssignmentsLoading(false);
      }
    };
    
    fetchAssignments();
  }, [effectiveClassId]);
  
  return {
    classes,
    workshops,
    assignments,
    assignmentData,
    rows,
    metrics,
    classesLoading,
    workshopsLoading,
    assignmentsLoading,
    assignmentDataLoading,
    workshopsFetched
  };
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AdminAssignmentsManagement() {
  const navigation = useAssignmentNavigation();
  const data = useAssignmentData();
  
  // Local state for filters and search
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "submitted" | "not_yet_submitted">("all");
  const [filterOnTime, setFilterOnTime] = useState<"all" | "on_time" | "late">("all");
  const [filterCrcClass, setFilterCrcClass] = useState<string>("all");
  const [dateOn, setDateOn] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [workshopSearch, setWorkshopSearch] = useState("");
  
  // Popover states
  const [workshopPopoverOpen, setWorkshopPopoverOpen] = useState(false);
  const [assignmentPopoverOpen, setAssignmentPopoverOpen] = useState(false);
  
  // State for signed URLs and dialog
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loadingUrls, setLoadingUrls] = useState<Record<string, boolean>>({});
  const [selectedSubmission, setSelectedSubmission] = useState<Row | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Group classes for display
  const groupedClasses = useMemo(() => {
    return groupCrcClasses(data.classes);
  }, [data.classes]);
  
  // Check if current selection needs sub-class
  const needsSubClassSelection = shouldShowSubClassSelection(navigation.selectedClass, groupedClasses);
  
  // Get current class options for sub-selection
  const subClassOptions = useMemo(() => {
    if (!needsSubClassSelection || !navigation.selectedClass) return [];
    const group = groupedClasses.find(g => g.id === navigation.selectedClass);
    return group?.classes || [];
  }, [needsSubClassSelection, navigation.selectedClass, groupedClasses]);
  
  // Get workshop options
  const workshopOptions = useMemo(() => {
    return data.workshops;
  }, [data.workshops]);
  
  // Get assignment options from selected workshop
  const assignmentOptions = useMemo(() => {
    if (!navigation.selectedWorkshop || !workshopOptions.length) return [];
    const workshop = workshopOptions.find(w => w.title === navigation.selectedWorkshop);
    return workshop?.assignments || [];
  }, [navigation.selectedWorkshop, workshopOptions]);

  // Filtered data for table
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filteredRows = data.rows.filter((r) => {
      // text query
      const matchesText = q
        ? [r.name, r.email, r.status, r.submission_type]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
        : true;
      // status filter
      const matchesStatus = filterStatus === 'all' ? true : r.status === filterStatus;
      // on-time filter
      const matchesOnTime = filterOnTime === 'all'
        ? true
        : filterOnTime === 'on_time'
        ? r.on_time === true
        : r.on_time === false; // late
      // single date filter: match submissions made on this day
      let matchesDate = true;
      if (dateOn) {
        if (!r.submitted_at) {
          matchesDate = false;
        } else {
          const d = new Date(r.submitted_at);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          const submittedDay = `${yyyy}-${mm}-${dd}`;
          matchesDate = submittedDay === dateOn;
        }
      }
      // CRC class filter
      const matchesCrcClass = filterCrcClass === 'all' ? true : 
        (filterCrcClass === 'ey' && r.crc_class_name && 
         (r.crc_class_name.toLowerCase().includes('ey') || 
          r.crc_class_name.toLowerCase().includes('enrichment'))) ||
        (filterCrcClass === 's4' && r.crc_class_name && 
         (r.crc_class_name.toLowerCase().includes('s4') || 
          r.crc_class_name.toLowerCase().includes('senior 4') ||
          r.crc_class_name.toLowerCase().includes('senior_4')));
      return matchesText && matchesStatus && matchesOnTime && matchesDate && matchesCrcClass;
    });
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [data.rows, query, page, filterStatus, filterOnTime, filterCrcClass, dateOn]);

  const totalPages = Math.max(1, Math.ceil((query ? filtered.length : data.rows.length) / pageSize));
  const notSubmitted = Math.max(0, (data.metrics?.total_students || 0) - (data.metrics?.total_submitted || 0));

  // Function to get signed URL
  const getSignedUrl = async (filePath: string, studentId: string) => {
    if (!filePath) return;
    
    // Create a unique key combining student ID and file path
    const urlKey = `${studentId}-${filePath}`;
    
    // Check if we already have this specific file's signed URL
    if (signedUrls[urlKey]) return;
    
    setLoadingUrls(prev => ({ ...prev, [urlKey]: true }));
    
    try {
      const response = await fetch('/api/admin/get-signed-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath }),
      });
      
      const data = await response.json();
      
      if (data.signedUrl) {
        setSignedUrls(prev => ({ ...prev, [urlKey]: data.signedUrl }));
      }
    } catch (error) {
      console.error('Error fetching signed URL:', error);
    } finally {
      setLoadingUrls(prev => ({ ...prev, [urlKey]: false }));
    }
  };

  // Function to clear signed URLs cache when switching assignments
  const clearSignedUrlsCache = () => {
    setSignedUrls({});
    setLoadingUrls({});
    setSelectedSubmission(null);
    setDialogOpen(false);
  };

  // Helper functions
  const formatDateTime = (d?: string | null) => {
    if (!d) return "N/A";
    try {
      return new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    } catch {
      return "N/A";
    }
  };

  const renderSubmissionType = (row: Row) => {
    if (row.status !== 'submitted') return <span className="text-neutral-500">N/A</span>;
    const late = row.on_time === false;
    const hasFileUpload = !!row.file_upload_link;
    const hasGoogleDoc = row.submission_type === 'google link' && row.google_doc_link;
    
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Clock className={`h-4 w-4 ${late ? 'text-red-600' : 'text-emerald-600'}`} />
          <span className="text-sm text-neutral-600">{late ? 'Late submit' : 'On time'}</span>
        </div>
        {hasFileUpload ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-black hover:text-gray-700 bg-gray-100 hover:translate-x-0.5 hover:-translate-y-0.5"
            title="View submission image"
            onClick={() => {
              setSelectedSubmission(row);
              setDialogOpen(true);
              // Fetch signed URL if not already available
              if (row.file_upload_link) {
                const urlKey = `${row.student_id}-${row.file_upload_link}`;
                if (!signedUrls[urlKey]) {
                  getSignedUrl(row.file_upload_link, row.student_id);
                }
              }
            }}
          >
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 hover:translate-x-0.5 hover:-translate-y-0.5" />
          </Button>
        ) : hasGoogleDoc ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-black hover:text-gray-500"
            title="Open Google Doc"
            onClick={() => window.open(row.google_doc_link as string, '_blank', 'noopener,noreferrer')}
          >
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 hover:translate-x-0.5 hover:-translate-y-0.5" />
          </Button>
        ) : row.view_url ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-black hover:text-gray-500"
            title="Open submission"
            onClick={() => window.open(row.view_url as string, '_blank', 'noopener,noreferrer')}
          >
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 hover:translate-x-0.5 hover:-translate-y-0.5" />
          </Button>
        ) : (
          <div className="h-8 w-8 flex items-center justify-center text-neutral-300">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header / Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-4xl font-bold font-cal-sans text-gray-800">Assignments</h1>
        
        {/* Hierarchical Navigation */}
        <div className="flex items-center gap-3">
            {/* Step 1: Class Selection */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-48 justify-between  ">
                  <span className="truncate text-left">
                  {navigation.selectedClass ? (
                    groupedClasses.find(g => g.id === navigation.selectedClass)?.name || navigation.selectedClass
                    ) : "Select Class"}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="space-y-1">
                  {data.classesLoading ? (
                    <div className="py-6 text-center text-sm text-neutral-500">
                      <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full mx-auto mb-2" />
                      Loading classes...
                    </div>
                  ) : groupedClasses.length === 0 ? (
                    <div className="py-6 text-center text-sm text-neutral-500">
                      No classes found
                    </div>
                  ) : (
                    groupedClasses.map((classGroup) => (
                    <button
                      key={classGroup.id}
                      onClick={() => {
                        navigation.updateNavigation({ selectedClass: classGroup.id });
                        // Clear signed URLs cache when switching classes
                        clearSignedUrlsCache();
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-neutral-50 rounded-md ${navigation.selectedClass === classGroup.id ? 'bg-neutral-50' : ''}`}
                    >
                      <Check className={`h-4 w-4 ${navigation.selectedClass === classGroup.id ? 'opacity-100' : 'opacity-0'}`} />
                      <span>{classGroup.name}</span>
                      {classGroup.isGroup && (
                        <span className="ml-auto text-xs text-gray-500">
                          ({classGroup.classes?.length || 0})
                        </span>
                      )}
                    </button>
                  ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

          {/* Step 2: Sub-Class Selection (only show when needed) */}
          {needsSubClassSelection && (
            <Popover>
                <PopoverTrigger asChild>
                <Button variant="outline" className="w-48 justify-between">
                    <span className="truncate text-left">
                    {navigation.selectedSubClass ? (
                      data.classes.find(c => c.id === navigation.selectedSubClass)?.name || navigation.selectedSubClass
                      ) : "Select Specific Class"}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                                <PopoverContent className="w-64 p-2">
                  <div className="space-y-1">
                   {data.classesLoading ? (
                     <div className="py-6 text-center text-sm text-neutral-500">
                       <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full mx-auto mb-2" />
                       Loading classes...
                     </div>
                   ) : subClassOptions.length === 0 ? (
                     <div className="py-6 text-center text-sm text-neutral-500">
                       No subclasses found
                     </div>
                   ) : (
                     subClassOptions.map((subClass) => (
                        <button
                          key={subClass.id}
                          onClick={() => {
                        navigation.updateNavigation({ selectedSubClass: subClass.id });
                        // Clear signed URLs cache when switching subclasses
                        clearSignedUrlsCache();
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-neutral-50 rounded-md ${navigation.selectedSubClass === subClass.id ? 'bg-neutral-50' : ''}`}
                    >
                      <Check className={`h-4 w-4 ${navigation.selectedSubClass === subClass.id ? 'opacity-100' : 'opacity-0'}`} />
                          <span>{subClass.name}</span>
                          <span className="ml-auto text-xs text-gray-500">
                            ({subClass.num_students})
                          </span>
                        </button>
                  )))}
                  </div>
                </PopoverContent>
              </Popover>
            )}

          {/* Step 3: Workshop Selection */}
            <Popover open={workshopPopoverOpen} onOpenChange={setWorkshopPopoverOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-48 justify-between" 
                disabled={!navigation.getEffectiveClassId()}
                >
                  <span className="text-left truncate">
                  {navigation.selectedWorkshop || "Select Workshop"}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-2">
                <div className="p-2">
                  <Input
                    placeholder="Search workshops..."
                    value={workshopSearch}
                    onChange={(e) => setWorkshopSearch(e.target.value)}
                  />
                </div>
                <div className="space-y-1 max-h-72 overflow-auto">
                  {(() => {
                  if (data.workshopsLoading) {
                      return (
                        <div className="py-6 text-center text-sm text-neutral-500">
                          <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full mx-auto mb-2" />
                          Loading workshops...
                        </div>
                      );
                    }
                    
                  if (!navigation.getEffectiveClassId()) {
                      return <div className="py-6 text-center text-sm text-neutral-500">
                        Select a class first
                      </div>;
                    }
                    
                  if (needsSubClassSelection && !navigation.selectedSubClass) {
                      return <div className="py-6 text-center text-sm text-neutral-500">
                        Select a specific class first
                      </div>;
                    }
                    
                  // Check for no workshops
                  if (workshopOptions.length === 0) {
                      return <div className="py-6 text-center text-sm text-neutral-500">
                        No workshops found for this class
                      </div>;
                    }
                    
                  const searchFilteredWorkshops = workshopOptions
                      .filter((workshop: Workshop) => workshop.title.toLowerCase().includes(workshopSearch.toLowerCase()));
                    
                    if (searchFilteredWorkshops.length === 0 && workshopOptions.length > 0) {
                      return <div className="py-6 text-center text-sm text-neutral-500">
                        No workshops match your search
                      </div>;
                    }
                    
                    return searchFilteredWorkshops.map((workshop: Workshop) => (
                      <button
                        key={workshop.id}
                        onClick={() => {
                        navigation.updateNavigation({ selectedWorkshop: workshop.title });
                        setWorkshopPopoverOpen(false);
                        // Clear signed URLs cache when switching workshops
                        clearSignedUrlsCache();
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-neutral-50 rounded-md ${navigation.selectedWorkshop === workshop.title ? 'bg-neutral-50' : ''}`}
                    >
                      <Check className={`h-4 w-4 flex-shrink-0 ${navigation.selectedWorkshop === workshop.title ? 'opacity-100' : 'opacity-0'}`} />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="break-words font-normal leading-relaxed">{workshop.title}</span>
                        </div>
                      </button>
                    ));
                  })()}
                </div>
              </PopoverContent>
            </Popover>

          {/* Step 4: Assignment Selection */}
            <Popover open={assignmentPopoverOpen} onOpenChange={setAssignmentPopoverOpen}>
              <PopoverTrigger asChild>
              <Button variant="outline" className="w-64 justify-between" disabled={!navigation.selectedWorkshop}>
                  <span className="truncate text-left">
                  {data.assignments.find((a) => a.id === navigation.assignmentId)?.title || "Select Assignment"}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-2">
                <div className="space-y-1 max-h-72 overflow-auto">
                {data.assignmentsLoading ? (
                    <div className="py-6 text-center text-sm text-neutral-500">
                      <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full mx-auto mb-2" />
                      Loading assignments...
                    </div>
                ) : !navigation.selectedWorkshop ? (
                  <div className="py-6 text-center text-sm text-neutral-500">Select a workshop first</div>
                ) : (() => {
                  const selectedWorkshopObj = workshopOptions.find(w => w.title === navigation.selectedWorkshop);
                      
                      if (!selectedWorkshopObj) {
                        return <div className="py-6 text-center text-sm text-neutral-500">Workshop not found</div>;
                      }
                      
                      return selectedWorkshopObj.assignments.map((assignment) => (
                        <button
                          key={assignment.id}
                          onClick={() => {
                        navigation.updateNavigation({ assignmentId: assignment.id });
                        setAssignmentPopoverOpen(false);
                        // Clear signed URLs cache when switching assignments
                        clearSignedUrlsCache();
                       
                          }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-neutral-50 rounded-md ${navigation.assignmentId === assignment.id ? 'bg-neutral-50' : ''}`}
                        >
                      <Check className={`h-4 w-4 ${navigation.assignmentId === assignment.id ? 'opacity-100' : 'opacity-0'}`} />
                          <span className="truncate">{assignment.title}</span>
                        </button>
                      ));
                })()}
                </div>
              </PopoverContent>
            </Popover>
        </div>
      </div>


      {/* Content Area */}
      {!navigation.assignmentId ? (
        /* Navigation Guide */
        <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50/50">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Select an Assignment</h3>
          <p className="text-gray-500 mb-4">
            Choose a class, then specific class, then workshop, then assignment to view student submission data.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <span className="px-2 py-1 bg-white rounded border">Class</span>
            <span>→</span>
            <span className="px-2 py-1 bg-white rounded border text-gray-300">(Specific Class)</span>
            <span>→</span>
            <span className="px-2 py-1 bg-white rounded border">Workshop</span>
            <span>→</span>
            <span className="px-2 py-1 bg-white rounded border">Assignment</span>
          </div>
        </div>
      ) : data.assignmentDataLoading ? (
        /* Loading Skeletons */
        <>
          {/* Top section skeleton */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-8 w-48 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border p-3 bg-white">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div>
                    <Skeleton className="h-3 w-16 mb-1" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table skeleton */}
          <div className="space-y-3">
            <div className="pb-2">
              <Skeleton className="h-6 w-48" />
            </div>
            {/* Filters skeleton */}
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-44" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>
            <div className="rounded-lg border overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Submission Status</TableHead>
                    <TableHead>Assignment Submit Date</TableHead>
                    <TableHead>Submission Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Top metrics (no outer card) */}
          <TooltipProvider>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div className="text-base font-medium truncate cursor-pointer">
                      {"Workshop: " + (data.assignmentData?.workshop_title || "N/A")}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{"Workshop: " + (data.assignmentData?.workshop_title || "N/A")}</p>
                  </TooltipContent>
                </Tooltip>
                <div className="hidden md:flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 text-violet-700 px-3 py-1 text-xs">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{`${formatDateTime(data.assignmentData?.created_at)} — ${formatDateTime(data.assignmentData?.submission_idate)}`}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Assignment Name */}
            <div className="flex items-center gap-3 rounded-xl border p-3 bg-white min-w-0">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-neutral-500">Assignment Name</p>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <div className="text-sm font-medium truncate cursor-pointer">
                      {data.assignmentData?.title || "N/A"}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{data.assignmentData?.title || "N/A"}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            {/* Total Students */}
            <div className="flex items-center gap-3 rounded-xl border p-3 bg-white">
              <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Total Students</p>
                  <div className="text-sm font-medium">{data.metrics.total_students}</div>
              </div>
            </div>
            {/* Total Submitted */}
            <div className="flex items-center gap-3 rounded-xl border p-3 bg-white">
              <div className="h-10 w-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Total Submitted</p>
                  <div className="text-sm font-medium">{data.metrics.total_submitted}</div>
              </div>
            </div>
            {/* Not Submitted */}
            <div className="flex items-center gap-3 rounded-xl border p-3 bg-white">
              <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Not Submitted</p>
                <div className="text-sm font-medium">{notSubmitted}</div>
              </div>
            </div>
              </div>
            </div>
          </TooltipProvider>

          {/* Table (no outer card) */}
          <div className="space-y-3">
        <div className="pb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-medium">Assignment submission status</h2>
            {(() => {
              // Get the most common submission type from submitted assignments
              const submittedRows = data.rows.filter(row => row.status === 'submitted');
              if (submittedRows.length === 0) return null;
              
              const submissionTypes = submittedRows.map(row => row.submission_type);
              const typeCounts = submissionTypes.reduce((acc, type) => {
                acc[type] = (acc[type] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              
              const mostCommonType = Object.entries(typeCounts)
                .sort(([,a], [,b]) => b - a)[0]?.[0];
              
              // Format the submission type for display
              if (!mostCommonType) return null;
              
              let displayText = '';
              switch (mostCommonType.toLowerCase()) {
                case 'google link':
                  displayText = 'Google Doc';
                  break;
                case 'file upload':
                  displayText = 'File Upload';
                  break;
                case 'text':
                  displayText = 'Text Input';
                  break;
                default:
                  displayText = mostCommonType.charAt(0).toUpperCase() + mostCommonType.slice(1);
              }
              
              return (
                <div className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  Submission style: {displayText}
                </div>
              );
            })()}
          </div>
        </div>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-64">
            <Input
              value={query}
              onChange={(e) => {
                setPage(1);
                setQuery(e.target.value);
              }}
              placeholder="Search student, email, status..."
            />
          </div>
              <Select value={filterStatus} onValueChange={(v) => { 
            setPage(1); 
            setFilterStatus(v as any); 
          }}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="not_yet_submitted">Not yet submitted</SelectItem>
            </SelectContent>
          </Select>
              <Select value={filterOnTime} onValueChange={(v) => { 
            setPage(1); 
            setFilterOnTime(v as any); 
          }}>
            <SelectTrigger className="w-40"><SelectValue placeholder="On-time" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All timing</SelectItem>
              <SelectItem value="on_time">On time</SelectItem>
              <SelectItem value="late">Late</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
                <Input type="date" value={dateOn} onChange={(e) => { 
              setPage(1); 
              setDateOn(e.target.value); 
            }} className="w-40" />
          </div>
          {(query || filterStatus !== 'all' || filterOnTime !== 'all' || filterCrcClass !== 'all' || dateOn) && (
            <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setFilterStatus('all'); setFilterOnTime('all'); setFilterCrcClass('all'); setDateOn(""); setPage(1); }}>
              Clear filters
            </Button>
          )}
        </div>
        <div className="rounded-lg border overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Submission Status</TableHead>
                  <TableHead>Assignment Submit Date</TableHead>
                  <TableHead>Submission Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-neutral-500 py-8">No students found.</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.student_id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{r.name || 'Unknown'}</span>
                          <span className="text-xs text-neutral-500">{r.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              r.status === 'submitted' ? 'bg-green-500' : 'bg-orange-400'
                            }`}
                          />
                          <span className="text-sm text-neutral-600">
                            {r.status === 'submitted' ? 'Submitted' : 'Not yet submitted'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-neutral-600">
                        {r.submitted_at
                          ? new Date(r.submitted_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-neutral-600">{renderSubmissionType(r)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-xs text-neutral-600">Page {page} of {totalPages}</div>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Submission Image Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                {selectedSubmission ? `${selectedSubmission.name}'s Submission` : 'Submission Image'}
              </DialogTitle>
            </DialogHeader>
                         <div className="flex flex-col space-y-4">
               {selectedSubmission && (
                 <>
                   <div className="flex items-center justify-between p-3 bg-gray-100  rounded-lg">
                     <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-full bg-statColors-1 text-gray-700 flex items-center justify-center text-sm font-medium">
                         {selectedSubmission.name?.charAt(0)?.toUpperCase() || 'S'}
                       </div>
                       <div>
                         <p className="text-sm font-semibold text-gray-900">{selectedSubmission.name}</p>
                         <p className="text-xs text-gray-600">{selectedSubmission.email}</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="text-xs text-gray-500">Submitted</p>
                       <p className="text-xs font-medium text-gray-700">
                         {selectedSubmission.submitted_at ? new Date(selectedSubmission.submitted_at).toLocaleDateString() : 'N/A'}
                       </p>
                     </div>
                   </div>
                   
                   <div className="flex-1 min-h-0 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                    {(() => {
                      const urlKey = `${selectedSubmission.student_id}-${selectedSubmission.file_upload_link}`;
                      const signedUrl = signedUrls[urlKey];
                      const isLoading = loadingUrls[urlKey];
                      
                      if (isLoading) {
                        return (
                          <div className="flex items-center justify-center p-8">
                            <div className="animate-spin h-8 w-8 border-2 border-statColors-1 border-t-transparent rounded-full" />
                            <span className="ml-3 text-gray-600">Loading image...</span>
                          </div>
                        );
                      }
                      
                      if (!signedUrl) {
                        return (
                          <div className="flex items-center justify-center p-8 text-gray-500">
                            <div className="text-center">
                              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                              <p>No image available</p>
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <img
                          src={signedUrl}
                          alt={`${selectedSubmission.name || 'Student'}'s submission`}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            console.log('Image failed to load in dialog:', signedUrl);
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = 'none';
                            const errorDiv = target.nextElementSibling as HTMLDivElement;
                            if (errorDiv) {
                              errorDiv.style.display = 'flex';
                            }
                          }}
                        />
                      );
                    })()}
                    <div className="hidden w-full h-full items-center justify-center text-gray-500">
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>Failed to load image</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
        </>
      )}
    </div>
  );
}


