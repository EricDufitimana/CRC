"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import Head from "../../../(site)/head";
import Link from "next/link";
import { Button } from "../../../../../zenith/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../../zenith/src/components/ui/avatar";
import { Badge } from "../../../../../zenith/src/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../../zenith/src/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "../../../../../zenith/src/components/ui/command";
import { format } from "date-fns";
import { 
  Search, 
  Bell, 
  ChevronDown,
  ChevronRight,
  Loader2,
  
} from "lucide-react";
import "../../../../../zenith/src/index.css";
import "../../../../../zenith/src/App.css";
import "../../../../styles/index.css";
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { signOut } from "@/actions/signOut";
import { Toaster, ToastBar } from "react-hot-toast";
import "@/styles/toast-animations.css";
import { useUserData } from "@/hooks/useUserData";

// Default pages to show when search dialog opens
const defaultPages = [
  { name: 'Dashboard', route: '/dashboard/admin', description: 'Main admin dashboard providing comprehensive overview of the entire system. View real-time statistics, performance metrics, data visualizations, charts, and summaries. Access quick navigation to all admin features, monitor system status and health, review recent activity logs, track key performance indicators (KPIs), analyze trends, view user activity, check system alerts, and get a complete snapshot of all administrative operations and activities across the platform.' },
  { name: 'Students', route: '/dashboard/admin/student-management', description: 'Complete student management system for handling all student-related operations. View detailed student profiles with personal information, academic records, and contact details. Search and filter students by name, student ID, class, grade level, or email. Edit student information, update profiles, manage student accounts and access permissions. View student history, academic progress, enrollment status, and participation records. Send emails to students, assign students to classes or groups, view student statistics and analytics, export student data, manage student photos, track student activities, and perform comprehensive student-related administrative tasks and data management.' },
  { name: 'Assignments', route: '/dashboard/admin/assignments-management', description: 'Full-featured assignment management system for creating, organizing, and tracking all assignments and homework. Create new assignments with titles, descriptions, due dates, and requirements. Edit existing assignments, delete assignments, and manage assignment details. View all student submissions with submission timestamps, track submission status (submitted, not submitted, late), check if students submitted on time or late, view submitted files and documents, grade assignments, provide feedback, view student work including Google Docs and file uploads, manage assignment deadlines and extensions, filter assignments by class, workshop, or date range, see comprehensive submission statistics and completion rates, download submissions, export assignment data, review assignment performance metrics, and monitor assignment completion across all classes and students.' },
  { name: 'Attendance', route: '/dashboard/admin/attendance', description: 'Comprehensive attendance tracking and management system for monitoring student presence and absence. Mark students as present or absent for classes and workshops, record attendance in real-time, view detailed attendance reports and history, filter attendance records by date range, class, student, or workshop, see attendance statistics including attendance rates and patterns, export attendance data to CSV or Excel, track attendance trends over time, identify students with poor attendance, manage attendance for CRC classes and workshops, view attendance calendars, generate attendance summaries, and perform all attendance-related administrative tasks and reporting.' },
  { name: 'CRC Classes', route: '/dashboard/admin/crc-class-groups', description: 'Complete class management system for organizing and managing CRC class groups and schedules. Create new classes with names, descriptions, and settings, edit existing classes, delete classes, assign students to classes, remove students from classes, view class rosters with student lists, organize classes by grade level including Enrichment Year (EY), Senior 4 (S4), Senior 5 (S5), and Senior 6 (S6), manage class schedules and timetables, view class statistics including student counts and participation, filter classes by grade level or name, search for specific classes, view class details and information, manage class settings and permissions, track class enrollment, and perform all class-related administrative operations and organizational tasks.' },
  { name: 'Resources', route: '/dashboard/admin/content-management', description: 'Educational resource management system for organizing and maintaining all learning materials and content. Upload new resources including documents, PDFs, videos, images, links, and study materials. Edit existing resources, update resource information, delete resources, organize resources by categories and tags, search resources by name or content, view resource usage statistics and download counts, manage resource access permissions and visibility, maintain a comprehensive content library for students and teachers, categorize resources by subject or topic, add resource descriptions and metadata, manage resource versions, track resource popularity, and ensure easy access to all educational materials and learning resources.' },
  { name: 'Workshops', route: '/dashboard/admin/workshops', description: 'Workshop management system for creating, scheduling, and managing all training sessions and educational workshops. Create new workshops with titles, descriptions, dates, and content, edit existing workshops, delete workshops, assign workshops to specific classes or groups, view workshop participants and enrollment, track workshop attendance and participation, manage workshop assignments and related tasks, see workshop statistics including enrollment rates and completion, filter workshops by class, date, or status, view workshop schedules and calendars, manage workshop materials and resources, track workshop performance, organize workshop content, and handle all workshop-related administrative activities and content management.' },
  { name: 'Events', route: '/dashboard/admin/events-management?category=previous-events', description: 'Complete event management system for organizing and managing all school events and activities. Create new events with details, dates, locations, and descriptions, edit existing events, delete events, view event details and information, filter events by category (past events, upcoming events, current events), filter events by date range, see event participants and registrations, manage event registrations and sign-ups, view event calendars and schedules, track event attendance, manage event resources and materials, organize event-related activities, view event history and archives, and handle all school-related events, activities, and calendar management tasks.' },
  { name: 'Announcements', route: '/dashboard/admin/announcements-management', description: 'Announcement management system for creating and distributing important messages and updates. Create new announcements with titles, content, and formatting, edit existing announcements, delete announcements, post announcements to students and staff, update announcement content and details, view announcement history and archives, schedule announcements for future publication, manage announcement visibility and target audiences, control who can see each announcement, communicate important information and news, track announcement views and engagement, organize announcements by category or priority, and ensure effective communication across the entire school community through the announcement system.' },
  { name: 'Essay Requests', route: '/dashboard/admin/essay-requests', description: 'Essay request management system for reviewing and processing student essay submissions. Review essay submission requests from students, approve or reject essay requests, view essay submissions with full content, read student essays and written work, check essay status and processing state, filter essays by student name, status, or submission date, provide feedback and comments on essays, manage essay deadlines and due dates, track essay request history, view essay statistics and metrics, handle essay-related administrative tasks, review essay quality and content, and manage all essay submission requests and reviews efficiently.' },
  { name: 'Opportunity Tracker', route: '/dashboard/admin/opportunity-tracker', description: 'Career opportunity tracking system for managing job opportunities, internships, and student applications. Track and manage various opportunities including job postings, internship positions, scholarship opportunities, and career programs. View opportunity details, requirements, and deadlines, manage opportunity postings and listings, track student applications for each opportunity, monitor application status and progress, filter opportunities by type, status, or date, view opportunity statistics and application rates, manage opportunity information and updates, track application deadlines, view student application details, monitor career-related opportunities, and ensure comprehensive tracking of all opportunities and student applications for career development and placement.' },
];

// Sidebar navigation is rendered inline below to support grouped dropdowns

export default function DashboardAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ name: string; route: string; description: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ remaining: number; resetIn: number } | null>(null);
  const [rateLimitMessage, setRateLimitMessage] = useState<string>('');
  const getTitle = () => {
    if (pathname?.includes("student-management")) return "Student Management - Admin Dashboard"
    else if (pathname?.includes("assignments-management")) return "Assignments Management - Admin Dashboard"
    else if (pathname?.includes("announcements-management")) return "Announcements Management - Admin Dashboard"
    else if (pathname?.includes("events-management")) return "Events Management - Admin Dashboard"
    else if (pathname?.includes("content-management")) return "Content Management - Admin Dashboard"
    else if (pathname?.includes("workshops")) return "Workshops - Admin Dashboard"
    else if (pathname?.includes("attendance")) return "Attendance - Admin Dashboard"
    else if (pathname?.includes("crc-class-groups")) return "CRC Class Groups - Admin Dashboard"
    else if (pathname?.includes("testing")) return "Testing - Admin Dashboard"
    else return "Admin Dashboard - Career Resources Center" 
  }
  const [mounted, setMounted] = useState(false);
  const [contentOpen, setContentOpen] = useState(false);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [classesOpen, setClassesOpen] = useState(false);
  const { adminId } = useUserData();
  const [adminName, setAdminName] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Function to handle dropdown toggling - ensures only one is open at a time
  const handleDropdownToggle = (dropdownType: 'content' | 'requests' | 'classes') => {
    if (dropdownType === 'content') {
      setContentOpen(prev => !prev);
      setRequestsOpen(false);
      setClassesOpen(false);
    } else if (dropdownType === 'requests') {
      setRequestsOpen(prev => !prev);
      setContentOpen(false);
      setClassesOpen(false);
    } else if (dropdownType === 'classes') {
      setClassesOpen(prev => !prev);
      setContentOpen(false);
      setRequestsOpen(false);
    }
  };
  
  // Prevent hydration mismatch by only rendering theme-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load default pages when dialog opens
  useEffect(() => {
    if (searchOpen && !searchQuery.trim()) {
      setSearchResults(defaultPages);
      setIsSearching(false);
    }
  }, [searchOpen]);

  // Debounced AI search (only when query is not empty)
  useEffect(() => {
    if (!searchOpen || !searchQuery.trim()) {
      // If query is empty, show default pages
      if (searchOpen && !searchQuery.trim()) {
        setSearchResults(defaultPages);
        setIsSearching(false);
      }
      return;
    }

    const searchWithAI = async () => {
      setIsSearching(true);
      setRateLimitMessage('');
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery }),
        });
        const data = await response.json();
        setSearchResults(data.results || []);
        setRateLimitInfo(data.rateLimit || null);
        
        if (data.rateLimited) {
          setRateLimitMessage(data.message);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchWithAI, 300); // Debounce 300ms
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchOpen]);

  const handleSearchSelect = (route: string) => {
    router.push(route);
    setSearchOpen(false);
    setSearchQuery('');
    setRateLimitMessage('');
  };
  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (!adminId) return;
      
      try {
        const response = await fetch(`/api/admin/profile?admin_id=${adminId}`);
        if (response.ok) {
          const adminData = await response.json();
          const fullName = [adminData.honorific, adminData.first_name, adminData.last_name]
            .filter(Boolean)
            .join(' ');
          setAdminName(fullName || 'Admin');
          setAdminEmail(adminData.email || 'admin@school.edu');
        } else {
          setAdminName('Admin');
          setAdminEmail('admin@school.edu');
        }
      } catch (error) {
        console.error('Error fetching admin profile:', error);
        setAdminName('Admin');
        setAdminEmail('admin@school.edu');
      }
    };

    fetchAdminProfile();
  }, [adminId]);
  
  const currentDate = new Date();
  const dayName = format(currentDate, "EEEE");
  const fullDate = format(currentDate, "MMMM d, yyyy");

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setIsSigningOut(true);
      const result = await signOut();
      if (result.success) {
        router.push('/');
      }
    } catch (error) {
      console.error("Failed to logout:", error);
      // Keep loading state active since we'll redirect anyway
    }
    // Don't reset isSigningOut - let it stay true for infinite loading
  }

  // Apply body styles through useEffect
  useEffect(() => {
    if (mounted) {
      document.body.classList.remove('dark');
      document.body.classList.remove('bg-black');
      document.body.classList.add('bg-gray-50');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('dark', 'bg-black', 'bg-gray-50');
    };
  }, [mounted]);

  return (
    <>
      {Head(getTitle())}
      <div 
        suppressHydrationWarning={true} 
        className="min-h-screen background-blur-2xl transition-colors duration-300 bg-gray-50"
      >
          {/* Sidebar as background foundation */}
          <div className="fixed left-0 top-0 bottom-0 w-60 backdrop-blur-2xl flex flex-col z-10 transition-colors duration-300 bg-gray-50 border-gray-200/30">
            {/* Navigation */}
            <nav className="flex-1 p-6 space-y-2 overflow-y-auto overflow-x-hidden relative scrollbar-hide">
              {/* Dashboard */}
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/admin')}
                className={`w-full h-12 px-4 justify-start text-left transition-all duration-300 rounded-xl group relative ${
                  pathname === '/dashboard/admin'
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/25 font-medium hover:text-white'
                    : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                }`}
              >
                <span className="text-sm font-medium">Dashboard</span>
              </Button>

              {/* Students */}
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/admin/student-management')}
                className={`w-full h-12 px-4 justify-start text-left transition-all duration-300 rounded-xl group relative ${
                  pathname === '/dashboard/admin/student-management'
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/25 font-medium hover:text-white'
                    : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                }`}
              >
                <span className="text-sm font-medium">Students</span>
              </Button>

              {/* Assignments */}
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard/admin/assignments-management')}
                className={`w-full h-12 px-4 justify-start text-left transition-all duration-300 rounded-xl group relative ${
                  pathname === '/dashboard/admin/assignments-management'
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/25 font-medium hover:text-white'
                    : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                }`}
              >
                <span className="text-sm font-medium">Assignments</span>
              </Button>

              {/* Classes group */}
              <Button
                variant="ghost"
                onClick={() => handleDropdownToggle('classes')}
                className={`w-full h-12 px-4 justify-between text-left transition-all duration-300 rounded-xl group ${
                  ['/dashboard/admin/attendance','/dashboard/admin/crc-class-groups'].some(p => pathname === p || pathname?.startsWith(p))
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/25 font-medium hover:text-white'
                    : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                }`}
              >
                <span className="text-sm font-medium">Classes</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${classesOpen ? 'rotate-180' : ''}`} />
              </Button>
              <div className="relative pl-4">
                <div className={`absolute left-2 top-0 bottom-[-8px] w-px transition-opacity duration-300 bg-gray-300/60 ${classesOpen ? 'opacity-100' : 'opacity-0'}`} />
                <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-out relative ${classesOpen ? 'max-h-28 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-1'}`}>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard/admin/attendance')}
                    className={`w-full h-10 px-4 justify-start text-left rounded-lg ${
                      pathname === '/dashboard/admin/attendance'
                        ? 'bg-orange-50 text-orange-700'
                        : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-sm">Attendance</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard/admin/crc-class-groups')}
                    className={`w-full h-10 px-4 justify-start text-left rounded-lg ${
                      pathname === '/dashboard/admin/crc-class-groups' || pathname?.startsWith('/dashboard/admin/crc-class-groups/')
                        ? 'bg-orange-50 text-orange-700'
                        : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-sm">CRC Classes</span>
                  </Button>
                </div>
              </div>

              {/* Content group */}
              <Button
                variant="ghost"
                onClick={() => handleDropdownToggle('content')}
                className={`w-full h-12 px-4 justify-between text-left transition-all duration-300 rounded-xl group ${
                  ['/dashboard/admin/content-management','/dashboard/admin/workshops','/dashboard/admin/announcements-management'].some(p => pathname === p) || pathname?.startsWith('/dashboard/admin/events-management')
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/25 font-medium hover:text-white'
                    : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                }`}
              >
                <span className="text-sm font-medium">Content</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${contentOpen ? 'rotate-180' : ''}`} />
              </Button>
              <div className="relative pl-4">
                <div className={`absolute left-2 top-0 bottom-[-8px] w-px transition-opacity duration-300 bg-gray-300/60 ${contentOpen ? 'opacity-100' : 'opacity-0'}`} />
                <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-out relative ${contentOpen ? 'max-h-48 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-1'}`}>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard/admin/content-management')}
                    className={`w-full h-10 px-4 justify-start text-left rounded-lg ${
                      pathname === '/dashboard/admin/content-management'
                        ? 'bg-orange-50 text-orange-700'
                        : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-sm">Resources</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard/admin/workshops')}
                    className={`w-full h-10 px-4 justify-start text-left rounded-lg ${
                      pathname === '/dashboard/admin/workshops'
                        ? 'bg-orange-50 text-orange-700'
                        : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-sm">Workshops</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard/admin/events-management?category=previous-events')}
                    className={`w-full h-10 px-4 justify-start text-left rounded-lg ${
                      pathname?.startsWith('/dashboard/admin/events-management')
                        ? 'bg-orange-50 text-orange-700'
                        : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-sm">Events</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard/admin/announcements-management')}
                    className={`w-full h-10 px-4 justify-start text-left rounded-lg ${
                      pathname === '/dashboard/admin/announcements-management'
                        ? 'bg-orange-50 text-orange-700'
                        : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-sm">Announcements</span>
                  </Button>
                </div>
              </div>

              {/* Requests group */}
              <Button
                variant="ghost"
                onClick={() => handleDropdownToggle('requests')}
                className={`w-full h-12 px-4 justify-between text-left transition-all duration-300 rounded-xl group ${
                  ['/dashboard/admin/essay-requests','/dashboard/admin/opportunity-tracker'].some(p => pathname === p)
                        ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/25 font-medium hover:text-white' 
                        : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                <span className="text-sm font-medium">Requests</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${requestsOpen ? 'rotate-180' : ''}`} />
              </Button>
              <div className="relative pl-4">
                <div className={`absolute left-2 top-0 bottom-[-8px] w-px transition-opacity duration-300 bg-gray-300/60 ${requestsOpen ? 'opacity-100' : 'opacity-0'}`} />
                <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-out relative ${requestsOpen ? 'max-h-28 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-1'}`}>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard/admin/essay-requests')}
                    className={`w-full h-10 px-4 justify-start text-left rounded-lg ${
                      pathname === '/dashboard/admin/essay-requests'
                        ? 'bg-orange-50 text-orange-700'
                        : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-sm">Essay</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/dashboard/admin/opportunity-tracker')}
                    className={`w-full h-10 px-4 justify-start text-left rounded-lg ${
                      pathname === '/dashboard/admin/opportunity-tracker'
                        ? 'bg-orange-50 text-orange-700'
                        : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-sm">Opportunity</span>
                  </Button>
                </div>
              </div>


            </nav>

            {/* Spacer to create distance above footer */}
            <div className="h-4" />

            {/* Separator with fade above */}
            <div className="relative h-px border-b border-gray-300/20 bg-gray-200/30 z-20">
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 via-gray-50/80 via-gray-50/50 to-transparent pointer-events-none" />
            </div>

            {/* Footer */}
            <div className="p-6 space-y-3 relative z-20 bg-gray-50">
              <Button
                variant="ghost"
                onClick={() => setSearchOpen(true)}
                className="w-full h-14 px-4 justify-start text-left transition-all duration-300 rounded-xl hover:bg-gray-100/80 text-gray-700 hover:text-gray-900">
            
                <Search className="h-4 w-4 mr-3" />
                <span className="text-sm">Search</span>
              </Button>


              {/* User Avatar */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full h-12 px-4 justify-start text-left transition-all duration-300 rounded-xl hover:bg-gray-100/80 text-gray-700 hover:text-gray-900">
                  
                    <Avatar className="h-6 w-6 mr-3">
                      <AvatarImage src="/api/placeholder/32/32" alt="Admin" />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-xs">
                        {adminName ? adminName.split(' ')[0][0].toUpperCase() : 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm truncate max-w-[120px]" title={adminName || 'Admin'}>
                      {adminName || 'Admin'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="truncate max-w-[200px]" title={adminName || 'Admin'}>
                    {adminName || 'Admin'}
                  </DropdownMenuLabel>
                  <DropdownMenuLabel className="font-normal text-muted-foreground truncate max-w-[200px]" title={adminEmail || 'admin@school.edu'}>
                    {adminEmail || 'admin@school.edu'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => window.location.href = '/'}>
                    Home
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    onSelect={(e) => e.preventDefault()}
                    disabled={isSigningOut}
                  >
                    <div className="flex items-center gap-2">
                      {isSigningOut ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      {isSigningOut ? "Signing out..." : "Log out"}
                    </div>
                  </DropdownMenuItem>
                  
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Main content floating above sidebar */}
          <div className="relative z-20 ml-60 mr-6 mt-6 mb-6">
            <div className="backdrop-blur-sm border rounded-2xl shadow-2xl max-w-7xl transition-colors duration-300 bg-white border-gray-200/30">
              {children}
            </div>
          </div>

          {/* Command Dialog for Search */}
          <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
            <CommandInput 
              placeholder="Search pages... (e.g., 'where to see grades', 'student info', 'add homework')" 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {rateLimitMessage && (
                <div className="px-4 py-3 text-sm text-orange-600 bg-orange-50 border-b border-orange-100">
                  ⚠️ {rateLimitMessage}
                </div>
              )}
              {rateLimitInfo && rateLimitInfo.remaining <= 5 && rateLimitInfo.remaining > 0 && (
                <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                  {rateLimitInfo.remaining} searches remaining (resets in {rateLimitInfo.resetIn}s)
                </div>
              )}
              {isSearching ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : searchResults.length === 0 ? (
                <CommandEmpty>No results found.</CommandEmpty>
              ) : (
                <CommandGroup heading={searchQuery.trim() ? "Search Results" : "All Pages"}>
                  {searchResults.map((item) => (
                    <CommandItem
                      key={item.route}
                      value={`${item.name} ${item.description}`}
                      onSelect={() => handleSearchSelect(item.route)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-xs text-gray-500 line-clamp-2">{item.description}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </CommandDialog>

          {/* Global Toast Container - Top Right */}
          <Toaster
            position="top-right"
            containerStyle={{
              // Custom positioning for top-right
              marginTop: "20px",
              marginRight: "20px",
            }}
            toastOptions={{
              duration: 3000,
              style: {
                background: 'transparent',
                padding: 0,
                margin: 0,
                boxShadow: 'none',
              },
            }}
          >
            {(t) => (
              <ToastBar
                toast={t}
                style={{
                  ...t.style,
                  animation: t.visible
                    ? "slide-in-top 0.4s ease-out"
                    : "slide-out-top 0.4s ease-in forwards",
                }}
              />
            )}
          </Toaster>
      </div>
    </>
  );
} 