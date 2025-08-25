"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "../../../../../../zenith/src/components/ui/button";
import { Input } from "../../../../../../zenith/src/components/ui/input";
import { Textarea } from "../../../../../../zenith/src/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../zenith/src/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../../../../zenith/src/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../../../../../zenith/src/components/ui/alert-dialog";
import { Skeleton } from "../../../../../../zenith/src/components/ui/skeleton";
import { Plus, Users, GraduationCap, Calendar, Trash2, Edit, Eye } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";

type Group = {
  id: string;
  name: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  num_students: number;
};

export default function CrcClassGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const { userId, adminId, isLoading} = useUserData();// Form state
  const [name, setName] = useState("");
  
  // View dialog state
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingGroup, setViewingGroup] = useState<Group | null>(null);
  const [groupStudents, setGroupStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentsSearchQuery, setStudentsSearchQuery] = useState("");
  
  // Delete dialog state
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/crc-classes", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load classes");
      setGroups(json.classes || []);
    } catch (e: any) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupStudents = async (groupId: string) => {
    setLoadingStudents(true);
    try {
      const response = await fetch(`/api/admin/crc-classes/${groupId}/students`);
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      setGroupStudents(data.class?.students || []);
    } catch (err: any) {
      console.error("Failed to load students:", err);
      setGroupStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => { fetchGroups(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(g =>
      [g.name, g.created_by_name]
        .some(v => v.toLowerCase().includes(q))
    );
  }, [groups, query]);

  // Filter students in view dialog based on search
  const filteredStudents = useMemo(() => {
    const q = studentsSearchQuery.trim().toLowerCase();
    if (!q) return groupStudents;
    return groupStudents.filter((student) => {
      const name = `${student.first_name || ""} ${student.last_name || ""}`.trim().toLowerCase();
      const email = (student.email || "").toLowerCase();
      const className = `${student.grade || ""} ${student.major_short || ""}`.trim().toLowerCase();
      return name.includes(q) || email.includes(q) || className.includes(q);
    });
  }, [groupStudents, studentsSearchQuery]);

  const onCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/crc-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), created_by: adminId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to create class");
      setName("");
      fetchGroups();
    } catch (e: any) {
      setError(e?.message || "Unknown error");
    } finally {
      setCreating(false);
    }
  };

  const onDelete = (group: Group) => {
    setDeletingGroup(group);
  };

  const confirmDelete = async () => {
    if (!deletingGroup) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/crc-classes", { 
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingGroup.id })
      });
      if (!res.ok) throw new Error("Failed to delete");
      setGroups(prev => prev.filter(g => g.id !== deletingGroup.id));
      setDeletingGroup(null);
    } catch (e) {
      alert((e as any).message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const onView = async (group: Group) => {
    setViewingGroup(group);
    setViewDialogOpen(true);
    setStudentsSearchQuery(""); // Reset search when opening dialog
    await fetchGroupStudents(group.id);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-4xl font-bold font-cal-sans text-gray-800">CRC Classes</h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input placeholder="Search classes..." value={query} onChange={(e) => setQuery(e.target.value)} className="md:w-72" />
        </div>
      </div>

      {/* Create Card */}
      <div className="rounded-2xl border bg-gradient-to-br from-white to-neutral-50 p-5">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <div>
              <label className="text-sm text-neutral-800 block mb-1">Class Name</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. s4mpc+s4meg" 
                className="h-10"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    onCreate();
                  }
                }}
              />
            </div>
          </div>
          <button
            onClick={onCreate}
            disabled={!name.trim() || creating}
            className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
              !name.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : creating
                ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer'
            }`}
          >
            {creating ? (
              <div className="animate-spin h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </button>
        </div>
        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
      </div>

      {/* List Card */}
      <div className="rounded-2xl border overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-neutral-500 py-8">No classes found.</TableCell>
              </TableRow>
            ) : (
              filtered.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{g.name}</TableCell>
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
                      <span>{new Date(g.created_at).toLocaleDateString()}</span>
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
                        <Link href={`/dashboard/admin/crc-class-groups/${g.id}`}>
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
                            onClick={() => onDelete(g)}
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete CRC Class</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the class "{g.name}"? This will unassign all students from this class. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={confirmDelete}
                              disabled={deleting}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              {deleting ? (
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
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Students Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
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
    </div>
  );
}


