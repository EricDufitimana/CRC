"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
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

// Sidebar navigation is rendered inline below to support grouped dropdowns

export default function DashboardAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
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

  // Fetch admin profile data when adminId is available
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
    <div 
      suppressHydrationWarning={true} 
      className="min-h-screen background-blur-2xl transition-colors duration-300 bg-gray-50"
    >
          {/* Sidebar as background foundation */}
          <div className="fixed left-0 top-0 bottom-0 w-60 backdrop-blur-2xl flex flex-col z-10 transition-colors duration-300 bg-gray-50 border-gray-200/30">
            {/* Navigation */}
            <nav className="flex-1 p-6 space-y-2">
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
                <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-out ${classesOpen ? 'max-h-28 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-1'}`}>
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
                <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-out ${contentOpen ? 'max-h-48 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-1'}`}>
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
                <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-out ${requestsOpen ? 'max-h-28 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-1'}`}>
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

            {/* Footer */}
            <div className="p-6 space-y-3 border-t transition-colors duration-300 border-gray-200/30">
              {/* Search */}
              <Button
                variant="ghost"
                onClick={() => setSearchOpen(true)}
                className="w-full h-12 px-4 justify-start text-left transition-all duration-300 rounded-xl hover:bg-gray-100/80 text-gray-700 hover:text-gray-900">
            
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
            <CommandInput placeholder="Search students, essays, or settings..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Quick Actions">
                <CommandItem>
                  <span>Dashboard</span>
                </CommandItem>
                <CommandItem>
                  <span>Students</span>
                </CommandItem>
                <CommandItem>
                  <span>Essays</span>
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="Students">
                <CommandItem>
                  <span>Sarah Chen - Computer Science</span>
                </CommandItem>
                <CommandItem>
                  <span>Michael Johnson - Mathematics</span>
                </CommandItem>
                <CommandItem>
                  <span>Emily Davis - English Literature</span>
                </CommandItem>
              </CommandGroup>
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
  );
} 