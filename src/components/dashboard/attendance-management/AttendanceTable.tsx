"use client";

import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../zenith/src/components/ui/table";
import { Badge } from "../../../../zenith/src/components/ui/badge";
import { Avatar, AvatarFallback } from "../../../../zenith/src/components/ui/avatar";
import { Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../zenith/src/components/ui/dropdown-menu";
import { Button } from "../../../../zenith/src/components/ui/button";
import { CheckCircle, XCircle, Clock, AlertCircle, MoreVertical } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { showToastSuccess, showToastError } from "@/components/toasts";

interface AttendanceRecord {
  id: string;
  student: {
    id: string;
    student_id: string;
    first_name: string;
    last_name: string;
    major_short: string;
    grade: string;
    profile_picture?: string | null;
  };
  status: 'present' | 'absent' | 'late' | 'excused';
  created_at: string | Date;
  workshop_title: string;
  class_name: string;
  class_id?: string | null;
}

interface AttendanceTableProps {
  records: AttendanceRecord[];
  loading: boolean;
}

function getStatusBadge(status: string, recordId: string, onUpdate?: (recordId: string, status: string) => void) {
  const statusConfig = {
    present: { label: 'Present', className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    absent: { label: 'Absent', className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
    late: { label: 'Late', className: 'bg-orange-100 text-orange-800 border-orange-200', icon: Clock },
    excused: { label: 'Excused', className: 'bg-blue-100 text-blue-800 border-blue-200', icon: AlertCircle },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.present;
  const IconComponent = config.icon;

  if (onUpdate) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 px-2">
            <Badge className={`${config.className} border flex items-center gap-1`}>
              <IconComponent className="h-3 w-3" />
              {config.label}
            </Badge>
            <MoreVertical className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {Object.entries(statusConfig).map(([key, value]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => onUpdate(recordId, key)}
              className="flex items-center gap-2"
            >
              <value.icon className="h-4 w-4" />
              {value.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Badge className={`${config.className} border flex items-center gap-1`}>
      <IconComponent className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

export function AttendanceTable({ records, loading }: AttendanceTableProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    ...trpc.attendanceManagement.updateAttendanceStatus.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['attendanceManagement', 'getAttendanceRecords']] });
      showToastSuccess({
        headerText: 'Status Updated',
        paragraphText: 'Attendance status has been updated successfully.',
        direction: 'right'
      });
    },
    onError: (error) => {
      showToastError({
        headerText: 'Update Failed',
        paragraphText: error.message || 'Failed to update attendance status.',
        direction: 'right'
      });
    },
  });

  const handleStatusUpdate = (recordId: string, status: string) => {
    updateStatusMutation.mutate({
      recordId,
      status: status as 'present' | 'absent' | 'late' | 'excused',
    });
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <div className="p-4">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
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
            <TableRow>
              <TableCell colSpan={4} className="text-center py-12">
                <div className="flex flex-col items-center space-y-3">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No attendance records found</h3>
                    <p className="text-gray-500 text-sm">
                      No attendance has been recorded yet. Start by recording attendance for a workshop.
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
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
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {record.student.first_name?.[0] || ''}{record.student.last_name?.[0] || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {record.student.first_name || ''} {record.student.last_name || ''}
                    </div>
                    <div className="text-sm text-gray-500">
                      {record.student.grade || 'N/A'} • {record.student.major_short || 'N/A'}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="max-w-xs truncate">{record.workshop_title}</TableCell>
              <TableCell>
                {getStatusBadge(record.status, record.id, handleStatusUpdate)}
              </TableCell>
              <TableCell>
                {format(new Date(record.created_at), "MMM dd, yyyy")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

