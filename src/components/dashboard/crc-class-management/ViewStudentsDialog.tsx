"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../zenith/src/components/ui/dialog";
import { Input } from "../../../../zenith/src/components/ui/input";
import { Button } from "../../../../zenith/src/components/ui/button";
import { Skeleton } from "../../../../zenith/src/components/ui/skeleton";
import { Users, Edit } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import type { CrcClass } from "./types";

interface ViewStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewingGroup: CrcClass | null;
}

export function ViewStudentsDialog({ open, onOpenChange, viewingGroup }: ViewStudentsDialogProps) {
  const trpc = useTRPC();
  const [studentsSearchQuery, setStudentsSearchQuery] = useState("");

  const { data: classData, isLoading: loadingStudents } = useQuery({
    ...trpc.crcClassManagement.getCrcClassStudents.queryOptions({
      classId: viewingGroup?.id || '',
    }),
    enabled: open && !!viewingGroup?.id,
  });

  const groupStudents = classData?.students || [];

  const filteredStudents = useMemo(() => {
    const q = studentsSearchQuery.trim().toLowerCase();
    if (!q) return groupStudents;
    return groupStudents.filter((student: any) => {
      const name = `${student.first_name || ""} ${student.last_name || ""}`.trim().toLowerCase();
      const email = (student.email || "").toLowerCase();
      const className = `${student.grade || ""} ${student.major_short || ""}`.trim().toLowerCase();
      return name.includes(q) || email.includes(q) || className.includes(q);
    });
  }, [groupStudents, studentsSearchQuery]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setStudentsSearchQuery("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Students in {viewingGroup?.name}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {/* Search Input */}
          <div className="mb-4">
            <Input
              placeholder="Search students by name, email, or class..."
              value={studentsSearchQuery}
              onChange={(e) => setStudentsSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          {loadingStudents ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : groupStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No students assigned to this class yet.</p>
              <p className="text-sm mt-1">Use the Edit button to assign students.</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No students found matching your search.</p>
              <p className="text-sm mt-1">Try a different search term.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredStudents.map((student: any) => (
                <div key={student.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-700 font-medium">
                      {student.first_name?.[0]}{student.last_name?.[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{student.email}</p>
                    {(student.grade || student.major_short) && (
                      <p className="text-xs text-gray-400 mt-1">
                        {student.grade?.replace(/_/g, ' ')} {student.major_short}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {studentsSearchQuery ? (
                <>
                  Showing {filteredStudents.length} of {groupStudents.length} student{groupStudents.length !== 1 ? 's' : ''}
                </>
              ) : (
                <>
                  {groupStudents.length} student{groupStudents.length !== 1 ? 's' : ''} total
                </>
              )}
            </p>
            <Button
              variant="outline"
              asChild
            >
              <Link href={`/dashboard/admin/crc-class-groups/${viewingGroup?.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Manage Students
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

