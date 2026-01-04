"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/zenith/components/ui/table";
import { Button } from "@/zenith/components/ui/button";
import { Badge } from "@/zenith/components/ui/badge";
import { Edit, Trash2, Calendar, Clock, ChevronDown, Check, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/zenith/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/zenith/components/ui/dropdown-menu";

interface Announcement {
  id: string;
  message: string;
  page: string;
  end_time: string | null;
  is_active: boolean | null;
  created_at: string;
}

interface AnnouncementsTableProps {
  announcements: Announcement[];
  isFetching: boolean;
  onEdit: (announcement: Announcement) => void;
  onDelete: (announcement: Announcement) => void;
  onStatusChange: (id: string, newStatus: boolean) => void;
}

const formatPageLabel = (page: string) => {
  if (page === 'english_language_learning') return 'English Learning';
  if (page === 'upcoming_events') return 'Upcoming Events';
  if (page === 'previous_events') return 'Previous Events';
  if (page === 'new_opportunities') return 'New Opportunities';
  if (page === 'recurring_opportunities') return 'Recurring Opportunities';
  if (page === 'approved_opportunities') return 'Approved Opportunities';
  if (page === 's4_workshops') return 'S4 Workshops';
  if (page === 'ey_workshops') return 'EY Workshops';
  if (page === 'senior_5_group_a_b_workshops') return 'S5 Group A&B';
  if (page === 'senior_5_customer_care') return 'S5 Customer Care';
  if (page === 'senior_6_group_c_workshops') return 'S6 Group C';
  if (page === 'senior_6_group_d') return 'S6 Group D';
  if (page === 'job_readiness_course') return 'Job Readiness';
  if (page === 'student_dashboard') return 'Student Dashboard';
  if (page === 'admin_dashboard') return 'Admin Dashboard';
  if (page === 'crp') return 'CRP';
  return page.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export function AnnouncementsTable({
  announcements,
  isFetching,
  onEdit,
  onDelete,
  onStatusChange,
}: AnnouncementsTableProps) {
  if (isFetching && announcements.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[45%]">Message</TableHead>
              <TableHead>Target Page</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><div className="flex justify-end"><Skeleton className="h-8 w-8 rounded-lg" /></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
        <Megaphone className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No announcements found</h3>
        <p className="text-gray-500 text-sm">Create your first announcement to reach students.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-transparent border-gray-100">
            <TableHead className="w-[45%] text-gray-600 font-semibold py-4">Message</TableHead>
            <TableHead className="text-gray-600 font-semibold py-4">Target Page</TableHead>
            <TableHead className="text-gray-600 font-semibold py-4">Status</TableHead>
            <TableHead className="text-gray-600 font-semibold py-4">Expires</TableHead>
            <TableHead className="text-right text-gray-600 font-semibold py-4 pr-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {announcements.map((announcement) => (
            <TableRow key={announcement.id} className="hover:bg-gray-50/50 border-gray-50 transition-colors">
              <TableCell className="py-4">
                <div className="text-sm text-gray-900 line-clamp-2" title={announcement.message}>
                  {announcement.message}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-100 font-medium">
                  {formatPageLabel(announcement.page)}
                </Badge>
              </TableCell>
              <TableCell className="py-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={`px-2 py-0 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 focus:outline-none ${announcement.is_active
                        ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                      }`}>
                      {announcement.is_active ? "Active" : "Inactive"}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="rounded-xl border-gray-100 shadow-md">
                    <DropdownMenuItem
                      onClick={() => onStatusChange(announcement.id, true)}
                      className="flex items-center gap-2 cursor-pointer focus:bg-green-50 focus:text-green-700 px-3"
                    >
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      Make Active
                      {announcement.is_active && <Check className="h-3 w-3 ml-auto" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusChange(announcement.id, false)}
                      className="flex items-center gap-2 cursor-pointer focus:bg-gray-100 focus:text-gray-700 px-3"
                    >
                      <div className="h-2 w-2 rounded-full bg-gray-400" />
                      Deactivate
                      {!announcement.is_active && <Check className="h-3 w-3 ml-auto" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {announcement.end_time ? format(new Date(announcement.end_time), "MMM d, yyyy") : "Never"}
                </div>
              </TableCell>
              <TableCell className="py-4 text-right pr-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-gray-100 focus:ring-0">
                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px] rounded-xl border-gray-100 shadow-md">
                    <DropdownMenuItem onClick={() => onEdit(announcement)} className="cursor-pointer gap-2 py-2">
                      <Edit className="h-4 w-4 text-blue-600" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(announcement)}
                      className="cursor-pointer gap-2 py-2 text-red-600 focus:text-red-700 focus:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Permanently
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Megaphone(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8 a3 3 0 1 1 -5.8-1.6" />
    </svg>
  );
}
