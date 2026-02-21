"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/zenith/components/ui/button";
import { ChevronDown } from "lucide-react";
import { AdminHeader } from "../admin/AdminHeader";

interface BetaAdminSidebarProps {
  adminName: string;
  adminEmail: string;
}

export function BetaAdminSidebar({ adminName, adminEmail }: BetaAdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [contentOpen, setContentOpen] = useState(false);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [classesOpen, setClassesOpen] = useState(false);

  // Function to handle dropdown toggling
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

  const isActive = (path: string) => {
    if (path === '/demo/admin') return pathname === path;
    return pathname?.startsWith(path);
  };

  const navItemClass = (path: string) => `w-full h-12 px-4 justify-start text-left transition-all duration-300 rounded-xl group relative ${isActive(path)
      ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/25 font-medium hover:text-white'
      : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
    }`;

  const subNavItemClass = (path: string) => `w-full h-10 px-4 justify-start text-left rounded-lg ${isActive(path)
      ? 'bg-orange-50 text-orange-700'
      : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
    }`;

  return (
    <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 backdrop-blur-2xl flex-col z-10 transition-colors duration-300 bg-gray-50 border-gray-200/30">
      <nav className="flex-1 p-6 space-y-2 overflow-y-auto overflow-x-hidden relative scrollbar-hide">
        {/* Dashboard */}
        <Button
          variant="ghost"
          onClick={() => router.push('/demo/admin')}
          className={navItemClass('/demo/admin')}
        >
          <span className="text-sm font-medium">Dashboard</span>
        </Button>

        {/* Students */}
        <Button
          variant="ghost"
          onClick={() => router.push('/demo/admin/student-management')}
          className={navItemClass('/demo/admin/student-management')}
        >
          <span className="text-sm font-medium">Students</span>
        </Button>

        {/* Assignments */}
        <Button
          variant="ghost"
          onClick={() => router.push('/demo/admin/assignments-management')}
          className={navItemClass('/demo/admin/assignments-management')}
        >
          <span className="text-sm font-medium">Assignments</span>
        </Button>

        {/* Classes group */}
        <Button
          variant="ghost"
          onClick={() => handleDropdownToggle('classes')}
          className={`w-full h-12 px-4 justify-between text-left transition-all duration-300 rounded-xl group ${['/demo/admin/attendance', '/demo/admin/crc-class-groups'].some(p => isActive(p))
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
            <Button variant="ghost" onClick={() => router.push('/demo/admin/attendance')} className={subNavItemClass('/demo/admin/attendance')}>
              <span className="text-sm">Attendance</span>
            </Button>
            <Button variant="ghost" onClick={() => router.push('/demo/admin/crc-class-groups')} className={subNavItemClass('/demo/admin/crc-class-groups')}>
              <span className="text-sm">CRC Classes</span>
            </Button>
          </div>
        </div>

        {/* Content group */}
        <Button
          variant="ghost"
          onClick={() => handleDropdownToggle('content')}
          className={`w-full h-12 px-4 justify-between text-left transition-all duration-300 rounded-xl group ${['/demo/admin/content-management', '/demo/admin/workshops', '/demo/admin/announcements-management', '/demo/admin/events-management'].some(p => isActive(p))
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
            <Button variant="ghost" onClick={() => router.push('/demo/admin/content-management')} className={subNavItemClass('/demo/admin/content-management')}>
              <span className="text-sm">Resources</span>
            </Button>
            <Button variant="ghost" onClick={() => router.push('/demo/admin/workshops')} className={subNavItemClass('/demo/admin/workshops')}>
              <span className="text-sm">Workshops</span>
            </Button>
            <Button variant="ghost" onClick={() => router.push('/demo/admin/events-management')} className={subNavItemClass('/demo/admin/events-management')}>
              <span className="text-sm">Events</span>
            </Button>
            <Button variant="ghost" onClick={() => router.push('/demo/admin/announcements-management')} className={subNavItemClass('/demo/admin/announcements-management')}>
              <span className="text-sm">Announcements</span>
            </Button>
          </div>
        </div>

        {/* Requests group */}
        <Button
          variant="ghost"
          onClick={() => handleDropdownToggle('requests')}
          className={`w-full h-12 px-4 justify-between text-left transition-all duration-300 rounded-xl group ${['/demo/admin/essay-requests', '/demo/admin/opportunity-tracker'].some(p => isActive(p))
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
            <Button variant="ghost" onClick={() => router.push('/demo/admin/essay-requests')} className={subNavItemClass('/demo/admin/essay-requests')}>
              <span className="text-sm">Essay</span>
            </Button>
            <Button variant="ghost" onClick={() => router.push('/demo/admin/opportunity-tracker')} className={subNavItemClass('/demo/admin/opportunity-tracker')}>
              <span className="text-sm">Opportunity</span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="h-4" />
      <div className="relative h-px border-b border-gray-300/20 bg-gray-200/30 z-20">
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 via-gray-50/50 to-transparent pointer-events-none" />
      </div>

      <AdminHeader adminName={adminName} adminEmail={adminEmail} />
    </div>
  );
}
