"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/zenith/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/zenith/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/zenith/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/zenith/components/ui/dropdown-menu";
import { Skeleton } from "@/zenith/components/ui/skeleton";
import { Users, GraduationCap, Calendar, Trash2, Edit, Eye, MoreHorizontal, MoreVertical } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { showToastSuccess, showToastError } from "@/components/toasts";
import type { CrcClass } from "./types";

interface CrcClassTableProps {
  classes: CrcClass[];
  loading: boolean;
  onView: (group: CrcClass) => void;
  basePath?: string;
}

export function CrcClassTable({ classes, loading, onView, basePath = "/dashboard/admin/crc-class-groups" }: CrcClassTableProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<CrcClass | null>(null);

  const deleteClassMutation = useMutation({
    ...trpc.crcClassManagement.deleteCrcClass.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['crcClassManagement', 'getCrcClasses']] });
      setDeletingGroup(null);
      showToastSuccess({
        headerText: 'Class deleted successfully',
        paragraphText: 'The class has been removed from the system.',
        direction: 'right'
      });
    },
    onError: (error) => {
      showToastError({
        headerText: 'Class Deletion Failed',
        paragraphText: error.message || 'Failed to delete class. Please try again.',
        direction: 'right'
      });
    },
    onSettled: () => {
      setDeletingClassId(null);
    },
  });

  const handleDelete = (group: CrcClass) => {
    setDeletingGroup(group);
  };

  const confirmDelete = () => {
    if (!deletingGroup) return;
    setDeletingClassId(deletingGroup.id);
    deleteClassMutation.mutate({ id: deletingGroup.id });
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="border-none hover:bg-transparent bg-transpa">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(g)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`${basePath}/${g.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              onSelect={(e) => {
                                e.preventDefault();
                                handleDelete(g);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
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
                                disabled={deletingClassId === deletingGroup?.id}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                {deletingClassId === deletingGroup?.id ? (
                                  <div className="flex items-center justify-center">
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                  </div>
                                ) : (
                                  'Delete Class'
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
  );
}

