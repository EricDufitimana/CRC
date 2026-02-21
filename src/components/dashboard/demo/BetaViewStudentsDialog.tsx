"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/zenith/components/ui/dialog";
import { Input } from "@/zenith/components/ui/input";
import { Button } from "@/zenith/components/ui/button";
import { Users, Edit } from "lucide-react";

// Dummy data for Demo
const dummyStudents = [
  { id: "s1", first_name: "Alice", last_name: "Smith", email: "alice@example.com", grade: "Senior 6", major_short: "MCB", crc_class_id: "class1" },
  { id: "s2", first_name: "Bob", last_name: "Jones", email: "bob@example.com", grade: "Senior 6", major_short: "MCB", crc_class_id: "class1" },
  { id: "s5", first_name: "Eve", last_name: "White", email: "eve@example.com", grade: "Senior 5", major_short: "PCM", crc_class_id: "class2" },
];

interface BetaViewStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewingGroup: any | null;
}

export function BetaViewStudentsDialog({ open, onOpenChange, viewingGroup }: BetaViewStudentsDialogProps) {
  const [studentsSearchQuery, setStudentsSearchQuery] = useState("");

  const groupStudents = useMemo(() => {
     if (!viewingGroup) return [];
     return dummyStudents.filter(s => s.crc_class_id === viewingGroup.id);
  }, [viewingGroup]);

  const filteredStudents = useMemo(() => {
    const q = studentsSearchQuery.trim().toLowerCase();
    if (!q) return groupStudents;
    return groupStudents.filter((student: any) => {
      const name = `${student.first_name || ""} ${student.last_name || ""}`.trim().toLowerCase();
      const email = (student.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [groupStudents, studentsSearchQuery]);

  useEffect(() => {
    if (!open) setStudentsSearchQuery("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Students in {viewingGroup?.name} (Demo)</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="mb-4">
            <Input
              placeholder="Search students..."
              value={studentsSearchQuery}
              onChange={(e) => setStudentsSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          {groupStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No students assigned to this class yet.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredStudents.map((student: any) => (
                <div key={student.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium">
                    {student.first_name?.[0]}{student.last_name?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{student.first_name} {student.last_name}</p>
                    <p className="text-sm text-gray-500">{student.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {groupStudents.length} student{groupStudents.length !== 1 ? 's' : ''} total
            </p>
            <Button variant="outline" asChild>
              <Link href={`/demo/admin/crc-class-groups/${viewingGroup?.id}`}>
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
