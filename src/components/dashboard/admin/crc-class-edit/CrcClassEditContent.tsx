"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSuspenseQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/zenith/components/ui/button";
import { Input } from "@/zenith/components/ui/input";
import { Checkbox } from "@/zenith/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/zenith/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/zenith/components/ui/alert-dialog";
import { Users, Plus, X, Check, ChevronDown, Loader2, AlertTriangle, Upload } from "lucide-react";
import { CrcClassEditHeader } from "./CrcClassEditHeader";
import { showToastSuccess, showToastError } from "@/components/toasts";

export function CrcClassEditContent() {
  const params = useParams();
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const groupId = String(params?.groupId || "");

  // Fetch class data
  const { data: classData } = useSuspenseQuery(
    trpc.crcClassManagement.getCrcClassStudents.queryOptions({ classId: groupId })
  );

  // Fetch all students
  const { data: allStudents = [] } = useSuspenseQuery(
    trpc.studentManagement.getStudents.queryOptions(undefined)
  );

  // State
  const [selected, setSelected] = useState<string[]>([]);
  const [availableQuery, setAvailableQuery] = useState("");
  const [membersQuery, setMembersQuery] = useState("");
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictStudents, setConflictStudents] = useState<any[]>([]);
  const [selectedToRemove, setSelectedToRemove] = useState<string[]>([]);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [bulkImportError, setBulkImportError] = useState<string | null>(null);

  // Mutations
  const addStudentsMutation = useMutation({
    ...trpc.crcClassManagement.addStudentsToCrcClass.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['crcClassManagement', 'getCrcClassStudents']] });
      queryClient.invalidateQueries({ queryKey: [['studentManagement', 'getStudents']] });
      setSelected([]);
      showToastSuccess({
        headerText: 'Students Added Successfully',
        paragraphText: `${selected.length} student(s) have been added to the class.`,
        direction: 'right'
      });
    },
    onError: (error) => {
      showToastError({
        headerText: 'Student Assignment Failed',
        paragraphText: error.message || 'Failed to add students to class. Please try again.',
        direction: 'right'
      });
    },
  });

  const removeStudentsMutation = useMutation({
    ...trpc.crcClassManagement.removeStudentsFromCrcClass.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['crcClassManagement', 'getCrcClassStudents']] });
      queryClient.invalidateQueries({ queryKey: [['studentManagement', 'getStudents']] });
      setSelectedToRemove([]);
      showToastSuccess({
        headerText: 'Students Removed Successfully',
        paragraphText: `${selectedToRemove.length} student(s) have been removed from the class.`,
        direction: 'right'
      });
    },
    onError: (error) => {
      showToastError({
        headerText: 'Student Removal Failed',
        paragraphText: error.message || 'Failed to remove students from class. Please try again.',
        direction: 'right'
      });
    },
  });

  const bulkImportMutation = useMutation({
    ...trpc.crcClassManagement.bulkImportStudents.mutationOptions(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [['crcClassManagement', 'getCrcClassStudents']] });
      queryClient.invalidateQueries({ queryKey: [['studentManagement', 'getStudents']] });
      setShowConflictDialog(false);
      setConflictStudents([]);
      setSelectedToRemove([]);
      showToastSuccess({
        headerText: 'Bulk Import Completed',
        paragraphText: data.message || 'Students have been successfully added to the class.',
        direction: 'right'
      });
    },
    onError: (error) => {
      showToastError({
        headerText: 'Bulk Import Failed',
        paragraphText: error.message || 'Failed to complete bulk import. Please try again.',
        direction: 'right'
      });
    },
  });

  // Available students (not in any class or in this class)
  const availableStudents = useMemo(() => {
    const memberIds = new Set((classData?.students || []).map((s: any) => String(s.id)));
    const q = availableQuery.trim().toLowerCase();
    const matchingGrade = classData?.grade_group || null;
    
    return allStudents.filter((s) => {
      const id = String(s.id);
      if (memberIds.has(id)) return false;
      if (s.crc_class_id !== null && s.crc_class_id !== undefined) return false;
      if (matchingGrade && s.grade !== matchingGrade) return false;
      if (!q) return true;
      const name = `${s.first_name || ""} ${s.last_name || ""}`.trim().toLowerCase();
      const className = `${s.grade || ""} ${s.major_short || ""}`.trim().toLowerCase();
      return [name, className].some((v) => v.toLowerCase().includes(q));
    });
  }, [allStudents, classData, availableQuery]);

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

  // Filtered members
  const filteredMembers = useMemo(() => {
    const q = membersQuery.trim().toLowerCase();
    if (!q) return classData?.students || [];
    return (classData?.students || []).filter((s: any) => {
      const name = `${s.first_name || ""} ${s.last_name || ""}`.trim().toLowerCase();
      const className = `${s.grade || ""} ${s.major_short || ""}`.trim().toLowerCase();
      return [name, className].some((v) => v.toLowerCase().includes(q));
    });
  }, [classData?.students, membersQuery]);

  const selectAllFromClass = (className: string) => {
    const classStudents = studentsByClass[className] || [];
    const classStudentIds = classStudents.map(s => String(s.id));
    setSelected(prev => {
      const alreadySelected = classStudentIds.every(id => prev.includes(id));
      if (alreadySelected) {
        return prev.filter(id => !classStudentIds.includes(id));
      } else {
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

  const checkForConflicts = async (studentIds: string[]) => {
    try {
      const selectedStudents = allStudents.filter(s => studentIds.includes(String(s.id)));
      const studentsWithClasses = selectedStudents.filter(s => s.crc_class_id && s.crc_class_id !== groupId);
      
      if (studentsWithClasses.length > 0) {
        // Fetch class names for conflicts
        const classIds = Array.from(new Set(studentsWithClasses.map(s => s.crc_class_id).filter(Boolean)));
        const classDetailsPromises = classIds.map(async (classId) => {
          const classData = await queryClient.fetchQuery(
            trpc.crcClassManagement.getCrcClassStudents.queryOptions({ classId: String(classId) })
          );
          return { id: classId, name: classData?.name || 'Unknown Class' };
        });
        
        const classDetails = await Promise.all(classDetailsPromises);
        const classMap = Object.fromEntries(classDetails.map(c => [c.id, c.name]));
        
        const enrichedConflicts = studentsWithClasses.map(student => ({
          ...student,
          current_class_name: student.crc_class_id ? (classMap[student.crc_class_id] || 'Unknown Class') : 'Unknown Class'
        }));
        
        setConflictStudents(enrichedConflicts);
        setShowConflictDialog(true);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error checking for conflicts:", error);
      return true;
    }
  };

  const assignSelected = async () => {
    if (selected.length === 0) return;
    
    const canAssign = await checkForConflicts(selected);
    if (!canAssign) return;
    
    addStudentsMutation.mutate({
      classId: groupId,
      studentIds: selected,
    });
  };

  const removeMember = async (studentId: string) => {
    removeStudentsMutation.mutate({
      classId: groupId,
      studentIds: [studentId],
    });
  };

  const removeSelectedMembers = async () => {
    if (selectedToRemove.length === 0) return;
    
    removeStudentsMutation.mutate({
      classId: groupId,
      studentIds: selectedToRemove,
    });
  };

  const confirmBulkImport = async () => {
    if (conflictStudents.length === 0) return;
    
    const studentIds = conflictStudents.map(student => student.studentId);
    bulkImportMutation.mutate({
      classId: groupId,
      studentIds: studentIds,
    });
  };

  const selectAllMembers = () => {
    const memberIds = filteredMembers.map((s: any) => String(s.id));
    const allSelected = memberIds.every((id: string) => selectedToRemove.includes(id));
    
    if (allSelected) {
      setSelectedToRemove(prev => prev.filter(id => !memberIds.includes(id)));
    } else {
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

  const handleBulkImport = async (file: File) => {
    setIsBulkImporting(true);
    setBulkImportError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('classId', groupId);

      const response = await fetch('/api/admin/crc-classes/bulk-import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        setBulkImportError(`Server error (${response.status}): ${errorText}`);
        return;
      }

      const data = await response.json();

      if (data.success) {
        console.log('📊 Bulk import analysis:', data);
        
        // Show matching results in conflict dialog
        setConflictStudents(data.studentsToAdd || []);
        setShowConflictDialog(true);
        
        // Show summary info
        const summaryMessage = `Found ${data.matching.matched} matching students. ${data.matching.alreadyInClass} already in class, ${data.matching.canBeAdded} can be added.`;
        
        if (data.matching.canBeAdded > 0) {
          showToastSuccess({
            headerText: 'Students Matched Successfully',
            paragraphText: summaryMessage,
            direction: 'right'
          });
        } else {
          showToastError({
            headerText: 'No New Students to Add',
            paragraphText: summaryMessage,
            direction: 'right'
          });
        }
      } else {
        setBulkImportError(data.error || 'Failed to import students');
      }
    } catch (err) {
      setBulkImportError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsBulkImporting(false);
    }
  };

  if (!classData) return null;

  return (
    <div className="p-6 space-y-6">
      <CrcClassEditHeader group={classData} />

      {/* Assign students */}
      <div className="rounded-2xl border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium flex items-center gap-2">
            <Users className="h-4 w-4" /> Assign Students
          </h2>
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
                      .filter(className => studentsByClass[className].length > 0)
                      .sort((a, b) => {
                        const getOrder = (className: string) => {
                          if (className.toLowerCase().includes('enrichment') || className.toLowerCase().includes('ey')) return 1;
                          if (className.toLowerCase().includes('s4') || className.toLowerCase().includes('senior 4')) return 2;
                          if (className.toLowerCase().includes('s5') || className.toLowerCase().includes('senior 5')) return 3;
                          if (className.toLowerCase().includes('s6') || className.toLowerCase().includes('senior 6')) return 4;
                          return 5;
                        };
                        const orderA = getOrder(a);
                        const orderB = getOrder(b);
                        if (orderA !== orderB) return orderA - orderB;
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
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls,.csv,.pdf,.docx,.txt"
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    await handleBulkImport(e.target.files[0]);
                    e.target.value = '';
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isBulkImporting}
              />
              <Button
                variant="outline"
                className="gap-2"
                disabled={isBulkImporting}
              >
                {isBulkImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Bulk Import
                  </>
                )}
              </Button>
            </div>
            <Button 
              disabled={selected.length === 0 || addStudentsMutation.isPending} 
              onClick={assignSelected}
              className="bg-primary hover:bg-primary/80 text-white"
            >
              {addStudentsMutation.isPending ? (
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
        
        {bulkImportError && (
          <div className="mt-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-red-700 font-medium text-sm">Import Error</span>
              </div>
              <p className="text-red-600 text-sm mt-1">{bulkImportError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Available Students */}
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-neutral-500">Available Students</div>
              {classData?.grade_group && (
                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Filtered: {classData.grade_group} only
                </div>
              )}
            </div>
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
                   'No students available to assign.'}
                </div>
              ) : (
                availableStudents.map((s) => {
                  const className = `${s.grade || ''} ${s.major_short || ''}`.trim() || 'Unknown Class';
                  return (
                    <div key={s.id} className="flex items-center gap-2 text-sm hover:bg-gray-50 p-1 rounded">
                      <Checkbox 
                        checked={selected.includes(String(s.id))} 
                        onCheckedChange={() => setSelected((prev) => 
                          prev.includes(String(s.id)) 
                            ? prev.filter((v) => v !== String(s.id)) 
                            : [...prev, String(s.id)]
                        )}
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
            <div className="mt-3 flex items-center justify-center">
              <div className="bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-1.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-600 font-medium">
                    {availableQuery ? (
                      <>Showing {availableStudents.length} available</>
                    ) : (
                      <>{availableStudents.length} available</>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Members */}
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
                      disabled={removeStudentsMutation.isPending}
                      className="text-xs h-6 px-2"
                    >
                      {removeStudentsMutation.isPending ? (
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
            <div className="mt-3 flex items-center justify-center">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg px-3 py-1.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                  <span className="text-emerald-600 font-medium">
                    {membersQuery ? (
                      <>Showing {filteredMembers.length} of {classData?.students?.length || 0} members</>
                    ) : (
                      <>{classData?.students?.length || 0} members</>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conflict Dialog - Handles both conflicts and bulk import confirmation */}
      <AlertDialog open={showConflictDialog} onOpenChange={setShowConflictDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {conflictStudents.some(s => s.currentClassId) ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Students Already Assigned
                </>
              ) : (
                <>
                  <Users className="h-5 w-5 text-green-500" />
                  Confirm Bulk Import
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {conflictStudents.some(s => s.currentClassId) 
                ? "The following student(s) are already assigned to another class:"
                : `Confirm adding ${conflictStudents.length} student(s) to this class:`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {conflictStudents.map((student) => (
              <div key={student.studentId} className={`flex items-center gap-3 p-3 border rounded-lg ${
                student.currentClassId 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  student.currentClassId 
                    ? 'bg-orange-100' 
                    : 'bg-green-100'
                }`}>
                  <span className={`font-medium text-sm ${
                    student.currentClassId 
                      ? 'text-orange-700' 
                      : 'text-green-700'
                  }`}>
                    {student.name?.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {student.name}
                  </p>
                  <p className={`text-sm ${
                    student.currentClassId 
                      ? 'text-orange-600' 
                      : 'text-green-600'
                  }`}>
                    {student.currentClassId 
                      ? `Currently in: ${student.currentClassId || 'Unknown class'}`
                      : `ID: ${student.studentIdNumber || student.studentId}`
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConflictDialog(false)}>
              Cancel
            </AlertDialogCancel>
            {conflictStudents.some(s => s.currentClassId) ? (
              <AlertDialogAction
                onClick={() => {
                  const conflictIds = conflictStudents
                    .filter(s => s.currentClassId)
                    .map(s => s.studentId);
                  setSelected(prev => prev.filter(id => !conflictIds.includes(id)));
                  setShowConflictDialog(false);
                }}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Remove Conflicts from Selection
              </AlertDialogAction>
            ) : (
              <AlertDialogAction
                onClick={confirmBulkImport}
                className="bg-green-600 hover:bg-green-700"
                disabled={bulkImportMutation.isPending}
              >
                {bulkImportMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Import {conflictStudents.length} Student(s)
                  </>
                )}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

