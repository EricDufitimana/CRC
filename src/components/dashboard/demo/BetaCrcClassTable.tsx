"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/zenith/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/zenith/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/zenith/components/ui/alert-dialog";
import { Skeleton } from "@/zenith/components/ui/skeleton";
import { Users, GraduationCap, Calendar, Trash2, Edit, Eye } from "lucide-react";
import { showToastError } from "@/components/toasts";

interface CrcClass {
  id: string;
  name: string;
  grade_group: string | null;
  created_by_name: string;
  created_at: string | Date;
  num_students: number;
}

interface BetaCrcClassTableProps {
  classes: CrcClass[];
  loading: boolean;
  onView: (group: CrcClass) => void;
  basePath?: string;
}

export function BetaCrcClassTable({ classes, loading, onView, basePath = "/demo/admin/crc-class-groups" }: BetaCrcClassTableProps) {
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<CrcClass | null>(null);

  const handleDelete = (group: CrcClass) => {
    setDeletingGroup(group);
  };

  const confirmDelete = () => {
    showToastError({
      headerText: "Demo Action",
      paragraphText: "Class deletion is disabled in the demo dashboard.",
      direction: "right"
    });
    setDeletingGroup(null);
  };

  return (
    <div className="rounded-2xl border overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Grade Group</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                </TableRow>
              ))
            ) : classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-neutral-500 py-8">
                  No classes found.
                </TableCell>
              </TableRow>
            ) : (
              classes.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{g.name}</TableCell>
                  <TableCell>
                    {g.grade_group ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 text-sm font-medium text-neutral-800">
                        {g.grade_group.replace(/_/g, ' ')}
                      </span>
                    ) : (
                      <span className="text-neutral-400 text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-neutral-400" />
                      <span>{g.created_by_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-neutral-400" />
                      <span>{g.num_students}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-neutral-400" />
                      <span>{g.created_at instanceof Date ? g.created_at.toLocaleDateString() : new Date(g.created_at).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => onView(g)}
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        asChild
                      >
                        <Link href={`${basePath}/${g.id}`}>
                          <Edit className="h-3 w-3" />
                          Edit
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1 text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(g)}
                            disabled={deletingClassId === g.id}
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete CRC Class</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the class &quot;{g.name}&quot;? This will unassign all students from this class. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={confirmDelete}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Delete Class
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
  );
}
