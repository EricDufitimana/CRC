"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/zenith/components/ui/button";
import { ChevronDown, Settings } from "lucide-react";
import { AdminHeader } from "./AdminHeader";
import Image from "next/image";
import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";

interface AdminSidebarProps {
  adminName: string;
  adminEmail: string;
}

export function AdminSidebar({ adminName, adminEmail }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [contentOpen, setContentOpen] = useState(false);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [classesOpen, setClassesOpen] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const STALE_TIME = 30 * 1000;

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

  return (
    <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 backdrop-blur-2xl flex-col z-10 transition-colors duration-300 bg-gray-50 border-gray-200/30">
 

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
          onMouseEnter={() => {
            void queryClient.prefetchQuery({
              ...trpc.studentManagement.getStudents.queryOptions(undefined),
              staleTime: STALE_TIME,
            });
            void queryClient.prefetchQuery({
              ...trpc.studentManagement.getCrcClasses.queryOptions(undefined),
              staleTime: STALE_TIME,
            });
          }}
          className={`w-full h-12 px-4 justify-start text-left transition-all duration-300 rounded-xl group relative ${
            pathname === '/dashboard/admin/student-management'
              ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/25 font-medium hover:text-white'
              : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
          }`}
        >
          <span className="text-sm font-medium">Students</span>
        </Button>

        {/* CRP */}
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/admin/crp')}
          onMouseEnter={() => {
            void queryClient.prefetchQuery({
              ...trpc.crpAdmin.getCohortOverview.queryOptions(undefined),
              staleTime: STALE_TIME,
            });
            void queryClient.prefetchQuery({
              ...trpc.crpAdmin.getReviewQueue.queryOptions(undefined),
              staleTime: STALE_TIME,
            });
          }}
          className={`w-full h-12 px-4 justify-start text-left transition-all duration-300 rounded-xl group relative ${
            pathname === '/dashboard/admin/crp' || pathname?.startsWith('/dashboard/admin/crp')
              ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/25 font-medium hover:text-white'
              : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
          }`}
        >
          <span className="text-sm font-medium">CRP</span>
        </Button>

        {/* Assignments */}
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/admin/assignments-management')}
          onMouseEnter={() => {
            void queryClient.prefetchQuery({
              ...trpc.assignmentsManagement.getCrcClasses.queryOptions(undefined),
              staleTime: STALE_TIME,
            });
            void queryClient.prefetchQuery({
              ...trpc.assignmentsManagement.getWorkshops.queryOptions({ useCase: 'assignment' }),
              staleTime: STALE_TIME,
            });
            void queryClient.prefetchQuery({
              ...trpc.assignmentsManagement.getAssignmentsForManagement.queryOptions(undefined),
              staleTime: STALE_TIME,
            });
          }}
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
              onMouseEnter={() => {
                void queryClient.prefetchQuery({
                  ...trpc.attendanceManagement.getAttendanceRecords.queryOptions(undefined),
                  staleTime: STALE_TIME,
                });
              }}
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
              onMouseEnter={() => {
                void queryClient.prefetchQuery({
                  ...trpc.workshopsManagement.getCrcClasses.queryOptions(undefined),
                  staleTime: STALE_TIME,
                });
                void queryClient.prefetchQuery({
                  ...trpc.workshopsManagement.getWorkshopsByCategory.queryOptions({ category: 'ey' }),
                  staleTime: STALE_TIME,
                });
              }}
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
              onMouseEnter={() => {
                void queryClient.prefetchQuery({
                  ...trpc.eventsManagement.getEvents.queryOptions({ category: 'previous-events' }),
                  staleTime: STALE_TIME,
                });
              }}
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
              onMouseEnter={() => {
                void queryClient.prefetchQuery({
                  ...trpc.essayRequestsManagement.getAdmins.queryOptions(undefined),
                  staleTime: STALE_TIME,
                });
              }}
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
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 via-gray-50/50 to-transparent pointer-events-none" />
      </div>

      {/* Footer with search and user */}
      <AdminHeader adminName={adminName} adminEmail={adminEmail} />
    </div>
  );
}

