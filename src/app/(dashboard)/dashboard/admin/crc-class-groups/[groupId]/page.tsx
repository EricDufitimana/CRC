"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "../../../../../../../zenith/src/components/ui/button";
import { Input } from "../../../../../../../zenith/src/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../../zenith/src/components/ui/table";
import { Skeleton } from "../../../../../../../zenith/src/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../../../../zenith/src/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../../../../../zenith/src/components/ui/alert-dialog";
import { Checkbox } from "../../../../../../../zenith/src/components/ui/checkbox";
import { Users, Plus, X, Check, ChevronDown, Loader2, ArrowLeft, AlertTriangle, Edit } from "lucide-react";
import { updateClassName } from "@/actions/crc-classes/updateClassName";
import { showToastSuccess, showToastError, showToastPromise } from "@/components/toasts";

type Member = { id: string; student: { id: string; first_name: string | null; last_name: string | null; email: string | null } };

export default function CrcClassGroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = String(params?.groupId || "");
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [availableQuery, setAvailableQuery] = useState("");
  const [membersQuery, setMembersQuery] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictStudents, setConflictStudents] = useState<any[]>([]);
  const [selectedToRemove, setSelectedToRemove] = useState<string[]>([]);
  const [isRemoving, setIsRemoving] = useState(false);
  
  // Edit class name state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/crc-classes/${groupId}/students`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to fetch class");
      setGroup(json.class);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/fetch-students");
      const json = await res.json();
      if (res.ok) {
        setStudents(json);
      } else {
        console.error("Failed to fetch students:", json);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => { if (groupId) { fetchGroup(); fetchStudents(); } }, [groupId]);

  const startEditingName = () => {
    setEditingName(group?.name || "");
    setIsEditingName(true);
  };

  const saveClassName = async () => {
    if (!editingName.trim() || editingName.trim() === group?.name) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);
    
    const updatePromise = (async () => {
      const result = await updateClassName(groupId, editingName.trim());
      
      if (result.success) {
        // Update local state
        setGroup((prev: any) => prev ? { ...prev, name: editingName.trim() } : prev);
        setIsEditingName(false);
      }
      return result;
    })();

    showToastPromise({
      promise: updatePromise,
      loadingText: 'Updating class name...',
      successText: 'Class name updated successfully',
      successHeaderText: 'Success',
      errorText: 'Failed to update class name',
      errorHeaderText: 'Error',
      direction: 'right'
    });

    try {
      await updatePromise;
    } catch (error: any) {
      console.error("Error updating class name:", error);
    } finally {
      setIsSavingName(false);
    }
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setEditingName("");
  };

  const availableStudents = useMemo(() => {
    // Debug: Check what crc_class_id values look like
    const studentsWithClassId = students.filter(s => s.crc_class_id !== null && s.crc_class_id !== undefined);
    const studentsWithoutClassId = students.filter(s => s.crc_class_id === null || s.crc_class_id === undefined);
    
    console.log("DEBUG - Students data:", {
      totalStudents: students.length,
      studentsWithClassId: studentsWithClassId.length,
      studentsWithoutClassId: studentsWithoutClassId.length,
      sampleStudentWithClass: studentsWithClassId[0],
      sampleStudentWithoutClass: studentsWithoutClassId[0]
    });
    
    const memberIds = new Set((group?.students || []).map((s: any) => String(s.id)));
    const q = availableQuery.trim().toLowerCase();
    const filtered = students.filter((s) => {
      const id = String(s.id);
      // Exclude if already in this group
      if (memberIds.has(id)) return false;
      // ONLY include students with null or undefined crc_class_id
      if (s.crc_class_id !== null && s.crc_class_id !== undefined) return false;
      if (!q) return true;
      const name = `${s.first_name || ""} ${s.last_name || ""}`.trim().toLowerCase();
      const className = `${s.grade || ""} ${s.major_short || ""}`.trim().toLowerCase();
      return [name, className].some((v) => v.toLowerCase().includes(q));
    });
    
    console.log("Available students filtered:", filtered.length);
    return filtered;
  }, [students, group, availableQuery]);

  // Group students by class
  const studentsByClass = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};
    availableStudents.forEach((student) => {
      const classKey = `${student.grade || 'Unknown'} ${student.major_short || ''}`.trim() || 'Unknown Class';
      if (!grouped[classKey]) grouped[classKey] = [];
      grouped[classKey].push(student);
    });
    return grouped;
  }, [availableStudents]);

  const selectAllFromClass = (className: string) => {
    const classStudents = studentsByClass[className] || [];
    const classStudentIds = classStudents.map(s => String(s.id));
    setSelected(prev => {
      const alreadySelected = classStudentIds.every(id => prev.includes(id));
      if (alreadySelected) {
        // Deselect all from this class
        return prev.filter(id => !classStudentIds.includes(id));
      } else {
        // Select all from this class
        const newSelected = [...prev];
        classStudentIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      }
    });
  };

  // Filter current members based on search
  const filteredMembers = useMemo(() => {
    const q = membersQuery.trim().toLowerCase();
    if (!q) return group?.students || [];
    return (group?.students || []).filter((s: any) => {
      const name = `${s.first_name || ""} ${s.last_name || ""}`.trim().toLowerCase();
      const className = `${s.grade || ""} ${s.major_short || ""}`.trim().toLowerCase();
      return [name, className].some((v) => v.toLowerCase().includes(q));
    });
  }, [group?.students, membersQuery]);

  // Check for students already assigned to other classes
  const checkForConflicts = async (studentIds: string[]) => {
    try {
      const selectedStudents = students.filter(s => studentIds.includes(String(s.id)));
      const studentsWithClasses = selectedStudents.filter(s => s.crc_class_id && s.crc_class_id !== parseInt(groupId));
      
      if (studentsWithClasses.length > 0) {
        // Fetch class names for students with conflicts
        const classIds = Array.from(new Set(studentsWithClasses.map(s => s.crc_class_id)));
        const classDetailsPromises = classIds.map(async (classId) => {
          const res = await fetch(`/api/admin/crc-classes/${classId}/students`);
          const data = await res.json();
          return { id: classId, name: data.class?.name || 'Unknown Class' };
        });
        
        const classDetails = await Promise.all(classDetailsPromises);
        const classMap = Object.fromEntries(classDetails.map(c => [c.id, c.name]));
        
        const enrichedConflicts = studentsWithClasses.map(student => ({
          ...student,
          current_class_name: classMap[student.crc_class_id] || 'Unknown Class'
        }));
        
        setConflictStudents(enrichedConflicts);
        setShowConflictDialog(true);
        return false; // Has conflicts
      }
      
      return true; // No conflicts
    } catch (error) {
      console.error("Error checking for conflicts:", error);
      return true; // Allow assignment on error
    }
  };

  const assignSelected = async () => {
    if (selected.length === 0) return;
    setIsAssigning(true);
    
    const assignPromise = (async () => {
      // Check for conflicts first
      const canAssign = await checkForConflicts(selected);
      if (!canAssign) {
        setIsAssigning(false);
        return; // Stop if there are conflicts
      }
      
      // Save selected IDs before clearing
      const selectedIds = [...selected];
      const selectedStudentsData = students.filter(s => selectedIds.includes(String(s.id)));
      
      // Add to group immediately
      setGroup((prevGroup: any) => {
        if (!prevGroup) return prevGroup;
        return {
          ...prevGroup,
          students: [...(prevGroup.students || []), ...selectedStudentsData]
        };
      });

      // Update students list to set crc_class_id
      setStudents(prev => prev.map(s => 
        selectedIds.includes(String(s.id)) ? { ...s, crc_class_id: groupId } : s
      ));

      setSelected([]);

      // Proceed with assignment in background
      const response = await fetch("/api/admin/crc-classes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: groupId, student_ids_to_add: selectedIds }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to assign students");
      }
      
      return { success: true, count: selectedIds.length };
    })();

    showToastPromise({
      promise: assignPromise,
      loadingText: 'Adding students to class...',
      successText: `${selected.length} student(s) have been added to the class.`,
      successHeaderText: 'Students Added Successfully',
      errorText: 'Failed to add students to class. Please try again.',
      errorHeaderText: 'Student Assignment Failed',
      direction: 'right'
    });

    try {
      await assignPromise;
    } catch (error) {
      console.error("Error assigning students:", error);
      // On error, refetch to restore correct state
      fetchGroup();
      fetchStudents();
    } finally {
      setIsAssigning(false);
    }
  };

  const removeMember = async (studentId: string) => {
    // Immediately remove from local state for instant UI feedback
    setGroup((prevGroup: any) => {
      if (!prevGroup || !prevGroup.students) return prevGroup;
      return {
        ...prevGroup,
        students: prevGroup.students.filter((s: any) => String(s.id) !== studentId)
      };
    });

    // Also remove from selectedToRemove if it was selected
    setSelectedToRemove(prev => prev.filter(id => id !== studentId));

    // Optimistically update students list to set crc_class_id to null
    setStudents(prev => prev.map(s => 
      String(s.id) === studentId ? { ...s, crc_class_id: null } : s
    ));

    // Handle API call in background
    try {
      await fetch("/api/admin/crc-classes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: groupId, student_ids_to_remove: [studentId] }),
      });
      // Don't call fetchGroup() here to avoid reload - we already updated local state
    } catch (error) {
      console.error("Error removing student:", error);
      // On error, refetch to restore correct state
      fetchGroup();
      fetchStudents();
    }
  };

  const removeSelectedMembers = async () => {
    if (selectedToRemove.length === 0) return;
    setIsRemoving(true);
    
    const removePromise = (async () => {
      // Save IDs before clearing
      const idsToRemove = [...selectedToRemove];
      
      // Optimistically update local state
      setGroup((prevGroup: any) => {
        if (!prevGroup || !prevGroup.students) return prevGroup;
        return {
          ...prevGroup,
          students: prevGroup.students.filter((s: any) => !idsToRemove.includes(String(s.id)))
        };
      });

      // Update students list to set crc_class_id to null
      setStudents(prev => prev.map(s => 
        idsToRemove.includes(String(s.id)) ? { ...s, crc_class_id: null } : s
      ));

      setSelectedToRemove([]);

      // API call in background
      const response = await fetch("/api/admin/crc-classes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: groupId, student_ids_to_remove: idsToRemove }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to remove students");
      }
      
      return { success: true, count: idsToRemove.length };
    })();

    showToastPromise({
      promise: removePromise,
      loadingText: 'Removing students from class...',
      successText: `${selectedToRemove.length} student(s) have been removed from the class.`,
      successHeaderText: 'Students Removed Successfully',
      errorText: 'Failed to remove students from class. Please try again.',
      errorHeaderText: 'Student Removal Failed',
      direction: 'right'
    });

    try {
      await removePromise;
    } catch (error) {
      console.error("Error removing students:", error);
      // On error, refetch to restore correct state
      fetchGroup();
      fetchStudents();
    } finally {
      setIsRemoving(false);
    }
  };

  const selectAllMembers = () => {
    const memberIds = filteredMembers.map((s: any) => String(s.id));
    const allSelected = memberIds.every((id: string) => selectedToRemove.includes(id));
    
    if (allSelected) {
      // Deselect all filtered members
      setSelectedToRemove(prev => prev.filter(id => !memberIds.includes(id)));
    } else {
      // Select all filtered members
      setSelectedToRemove(prev => {
        const newSelected = [...prev];
        memberIds.forEach((id: string) => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {loading || !group ? (
        <>
          {/* Back to Classes Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <div>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48 mt-1" />
            </div>
          </div>

          {/* Assign Students Section Skeleton */}
          <div className="rounded-2xl border bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-full mb-3" />
                <div className="max-h-64 overflow-auto space-y-1">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm p-1">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-full mb-3" />
                <div className="max-h-64 overflow-auto space-y-1">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between text-sm p-1">
                      <Skeleton className="h-4 flex-1 mr-2" />
                      <Skeleton className="h-4 w-4" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

         
        </>
      ) : (
        <>
          <div className="space-y-3">
            <div
              onClick={() => router.push('/dashboard/admin/crc-class-groups')}
              className="flex items-center gap-2 hover:gap-3 transition-all duration-200 group cursor-pointer text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
              <span className="text-sm">Back to Classes</span>
            </div>
            <div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        saveClassName();
                      } else if (e.key === 'Escape') {
                        cancelEditingName();
                      }
                    }}
                    className="text-2xl font-bold h-10"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={saveClassName}
                    disabled={isSavingName}
                    className="h-8 text-white"
                  >
                    {isSavingName ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelEditingName}
                    disabled={isSavingName}
                    className="h-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{group.name}</h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startEditingName}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <p className="text-neutral-600">Created by {group.created_by_name}</p>
            </div>
          </div>

          {/* Assign students */}
      <div className="rounded-2xl border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium flex items-center gap-2"><Users className="h-4 w-4" /> Assign Students</h2>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <Users className="h-4 w-4" />
                  Bulk Select
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-64 overflow-y-auto">
                {Object.keys(studentsByClass).length === 0 ? (
                  <DropdownMenuItem disabled>No students available</DropdownMenuItem>
                ) : (
                  <>
                   
                    <DropdownMenuItem
                      onClick={() => setSelected([])}
                      className="font-medium text-red-600"
                    >
                      Clear Selection
                    </DropdownMenuItem>
                    <div className="border-t my-1"></div>
                    {Object.keys(studentsByClass)
                      .filter(className => studentsByClass[className].length > 0) // Only show classes with available students
                      .sort((a, b) => {
                        // Define custom order: EY, S4, S5, S6, then others
                        const getOrder = (className: string) => {
                          if (className.toLowerCase().includes('enrichment') || className.toLowerCase().includes('ey')) return 1;
                          if (className.toLowerCase().includes('s4') || className.toLowerCase().includes('senior 4')) return 2;
                          if (className.toLowerCase().includes('s5') || className.toLowerCase().includes('senior 5')) return 3;
                          if (className.toLowerCase().includes('s6') || className.toLowerCase().includes('senior 6')) return 4;
                          return 5; // Unknown classes at the end
                        };
                        
                        const orderA = getOrder(a);
                        const orderB = getOrder(b);
                        
                        if (orderA !== orderB) {
                          return orderA - orderB;
                        }
                        
                        // If same order level, sort alphabetically
                        return a.localeCompare(b);
                      })
                      .map((className) => {
                        const classStudents = studentsByClass[className];
                        const classStudentIds = classStudents.map(s => String(s.id));
                        const allSelected = classStudentIds.every(id => selected.includes(id));
                        const selectedCount = classStudentIds.filter(id => selected.includes(id)).length;
                        
                        return (
                          <DropdownMenuItem
                            key={className}
                            onClick={(e) => {
                              e.preventDefault();
                              selectAllFromClass(className);
                            }}
                            onSelect={(e) => e.preventDefault()}
                            className="flex items-center justify-between"
                          >
                            <span className="flex-1">
                              {className} ({classStudents.length}
                              {selectedCount > 0 && `, ${selectedCount} selected`})
                            </span>
                            {allSelected && <Check className="h-4 w-4 text-green-600" />}
                          </DropdownMenuItem>
                        );
                      })}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              disabled={selected.length === 0 || isAssigning} 
              onClick={assignSelected}
              className="bg-primary hover:bg-primary/80 text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(255,165,0,0.4)] transition duration-200"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Add Selected ({selected.length})
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Selected ({selected.length})
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg border p-3">
            <div className="text-xs text-neutral-500 mb-2">Available Students</div>
            <Input 
              placeholder="Search available students..." 
              value={availableQuery} 
              onChange={(e) => setAvailableQuery(e.target.value)} 
              className="mb-3 h-8 text-sm"
            />
            <div className="max-h-64 overflow-auto space-y-1">
              {availableStudents.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  {availableQuery ? 'No students found matching your search.' : 
                   students.length === 0 ? 'Loading students...' : 
                   'No students available to assign.'}
                  <div className="text-xs mt-1">
                    Total students: {students.length}, Class members: {group?.students?.length || 0}
                  </div>
                </div>
              ) : (
                availableStudents.map((s) => {
                  const className = `${s.grade || ''} ${s.major_short || ''}`.trim() || 'Unknown Class';
                  return (
                    <div key={s.id} className="flex items-center gap-2 text-sm hover:bg-gray-50 p-1 rounded">
                      <Checkbox 
                        checked={selected.includes(String(s.id))} 
                        onCheckedChange={() => setSelected((prev) => prev.includes(String(s.id)) ? prev.filter((v) => v !== String(s.id)) : [...prev, String(s.id)])}
                        className="border-black data-[state=checked]:text-white data-[state=checked]:border-white data-[state=checked]:bg-orange-500"
                      />
                      <div className="flex-1 truncate">
                        <span className="font-medium">{`${s.first_name || ""} ${s.last_name || ""}`.trim()}</span>
                        <span className="text-neutral-500 ml-2">— {className}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {/* Available Students Count */}
            <div className="mt-3 flex items-center justify-center">
              <div className="bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-1.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-600 font-medium">
                    {availableQuery ? (
                      <>Showing {availableStudents.length} of {students.filter(s => s.crc_class_id === null || s.crc_class_id === undefined).length} available</>
                    ) : (
                      <>{students.filter(s => s.crc_class_id === null || s.crc_class_id === undefined).length} available</>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-neutral-500">Current Members</div>
              {filteredMembers.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllMembers}
                    className="text-xs h-6 px-2"
                  >
                    {filteredMembers.every((s: any) => selectedToRemove.includes(String(s.id))) ? 'Deselect All' : 'Select All'}
                  </Button>
                  {selectedToRemove.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={removeSelectedMembers}
                      disabled={isRemoving}
                      className="text-xs h-6 px-2"
                    >
                      {isRemoving ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Removing...
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3 mr-1" />
                          Remove ({selectedToRemove.length})
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
            <Input 
              placeholder="Search current members..." 
              value={membersQuery} 
              onChange={(e) => setMembersQuery(e.target.value)} 
              className="mb-3 h-8 text-sm"
            />
            <div className="max-h-64 overflow-auto space-y-1">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  {membersQuery ? 'No members found matching your search.' : 'No students assigned to this class yet.'}
                </div>
              ) : (
                filteredMembers.map((s: any) => {
                  const className = `${s.grade || ''} ${s.major_short || ''}`.trim() || 'Unknown Class';
                  const formattedClassName = `${s.grade?.replace(/_/g, ' ') || ''} ${s.major_short || ''}`.trim() || 'Unknown Class';
                  return (
                    <div key={s.id} className="flex items-center gap-2 text-sm hover:bg-gray-50 p-1 rounded">
                      <Checkbox 
                        checked={selectedToRemove.includes(String(s.id))} 
                        onCheckedChange={() => setSelectedToRemove((prev) => 
                          prev.includes(String(s.id)) 
                            ? prev.filter((v) => v !== String(s.id)) 
                            : [...prev, String(s.id)]
                        )}
                        className="border-black data-[state=checked]:text-white data-[state=checked]:border-white data-[state=checked]:bg-orange-500"
                      />
                      <div className="flex-1 truncate">
                        <span className="font-medium">{`${s.first_name || ""} ${s.last_name || ""}`.trim()}</span>
                        <span className="text-neutral-500 ml-2">— {formattedClassName}</span>
                      </div>
                      <button 
                        type="button"
                        className="text-red-600 hover:text-red-700 ml-2" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeMember(String(s.id));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            {/* Current Members Count */}
            <div className="mt-3 flex items-center justify-center">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg px-3 py-1.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                  <span className="text-emerald-600 font-medium">
                    {membersQuery ? (
                      <>Showing {filteredMembers.length} of {group?.students?.length || 0} members</>
                    ) : (
                      <>{group?.students?.length || 0} members</>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        </>
      )}

      {/* Conflict Warning Dialog */}
      <AlertDialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Students Already Assigned
            </AlertDialogTitle>
            <AlertDialogDescription>
              The following student{conflictStudents.length > 1 ? 's are' : ' is'} already assigned to another class:
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {conflictStudents.map((student) => (
              <div key={student.id} className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-orange-700 font-medium text-sm">
                    {student.first_name?.[0]}{student.last_name?.[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {student.first_name} {student.last_name}
                  </p>
                  <p className="text-sm text-orange-600">
                    Currently in: <span className="font-medium">{student.current_class_name}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConflictDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // Remove conflicted students from selection
                const conflictIds = conflictStudents.map(s => String(s.id));
                setSelected(prev => prev.filter(id => !conflictIds.includes(id)));
                setShowConflictDialog(false);
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Remove from Selection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


