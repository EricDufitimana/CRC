"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/zenith/components/ui/table";
import { Button } from "@/zenith/components/ui/button";
import { Badge } from "@/zenith/components/ui/badge";
import { Edit, Trash2, Calendar, ChevronDown, Check, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/zenith/components/ui/dropdown-menu";
import { showToastError } from "@/components/toasts/ToastError";

interface Announcement {
  id: string;
  message: string;
  page: string;
  end_time: string | null;
  is_active: boolean | null;
  created_at: string;
}

interface BetaAnnouncementsTableProps {
  announcements: Announcement[];
  isFetching: boolean;
  onEdit: (announcement: Announcement) => void;
  onDelete: (announcement: Announcement) => void;
  onStatusChange: (id: string, newStatus: boolean) => void;
}

const formatPageLabel = (page: string) => {
  if (page === 'english_language_learning') return 'English Learning';
  if (page === 'upcoming_events') return 'Upcoming Events';
  if (page === 'student_dashboard') return 'Student Dashboard';
  if (page === 'admin_dashboard') return 'Admin Dashboard';
  return page.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export function BetaAnnouncementsTable({
  announcements,
  isFetching,
  onEdit,
  onDelete,
  onStatusChange,
}: BetaAnnouncementsTableProps) {

  const handleAction = () => {
    showToastError({
      headerText: "Demo Action",
      paragraphText: "This action is disabled in the demo.",
      direction: "right"
    });
  };

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
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 font-medium">
                  {formatPageLabel(announcement.page)}
                </Badge>
              </TableCell>
              <TableCell className="py-4">
                <button
                  onClick={handleAction}
                  className={`px-2 py-0 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 focus:outline-none ${announcement.is_active
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}>
                  {announcement.is_active ? "Active" : "Inactive"}
                  <ChevronDown className="h-3 w-3" />
                </button>
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
                    <DropdownMenuItem onClick={handleAction} className="cursor-pointer gap-2 py-2">
                      <Edit className="h-4 w-4 text-blue-600" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAction} className="cursor-pointer gap-2 py-2 text-red-600 focus:text-red-700 focus:bg-red-50">
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
