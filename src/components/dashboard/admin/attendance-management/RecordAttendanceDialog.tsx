"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/zenith/components/ui/dialog";
import { Button } from "@/zenith/components/ui/button";
import { Label } from "@/zenith/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/zenith/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/zenith/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/zenith/components/ui/avatar";
import { Users, Clock, UserX, AlertCircle, UserCheck, ChevronDown, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { showToastPromise } from "@/components/toasts";

interface CRCClass {
  id: string;
  name: string;
  grade_group: string | null;
}

interface Workshop {
  id: string;
  title: string;
  date: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  major_short: string;
  grade: string;
}

interface RecordAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: CRCClass[];
  groupedClasses: Array<{ groupName: string; classes: CRCClass[] }>;
}

export function RecordAttendanceDialog({
  open,
  onOpenChange,
  classes,
  groupedClasses,
}: RecordAttendanceDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>("");
  const [selectedStudents, setSelectedStudents] = useState<{[key: string]: 'present' | 'absent' | 'late' | 'excused'}>({});

  // Fetch all workshops
  const { data: allWorkshops = [], isLoading: loadingWorkshops } = useQuery({
    ...trpc.assignmentsManagement.getWorkshops.queryOptions(undefined),
    enabled: open,
  });

  // Filter workshops by selected class
  const workshops = useMemo(() => {
    if (!selectedClassId) return [];
    return allWorkshops.filter(workshop => 
      workshop.crc_classes.some(cc => cc.id === selectedClassId)
    );
  }, [allWorkshops, selectedClassId]);

  // Fetch students for selected class
  const { data: classData, isLoading: loadingStudents } = useQuery({
    ...trpc.crcClassManagement.getCrcClassStudents.queryOptions({
      classId: selectedClassId || '',
    }),
    enabled: !!selectedClassId && open,
  });

  const students = classData?.students || [];

  const recordAttendanceMutation = useMutation({
    ...trpc.attendanceManagement.recordAttendance.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['attendanceManagement', 'getAttendanceRecords']] });
      onOpenChange(false);
      setSelectedClass("all");
      setSelectedClassId(null);
      setSelectedWorkshop("");
      setSelectedStudents({});
    },
  });

  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    if (value === "all") {
      setSelectedClassId(null);
      setSelectedWorkshop("");
      setSelectedStudents({});
    } else {
      setSelectedClassId(value);
    }
  };

  const handleRecordAttendance = () => {
    if (!selectedWorkshop || !selectedClassId) return;

    const attendanceRecords = Object.entries(selectedStudents)
      .filter(([_, status]) => status)
      .map(([studentId, status]) => ({
        studentId,
        status
      }));

    if (attendanceRecords.length === 0) return;

    const promise = recordAttendanceMutation.mutateAsync({
      workshopId: selectedWorkshop,
      classId: selectedClassId,
      attendanceRecords,
    });

    showToastPromise({
      promise,
      loadingText: 'Recording attendance...',
      successText: 'This record will appear in your history.',
      successHeaderText: 'Attendance Recorded Successfully',
      errorText: 'Please try again.',
      errorHeaderText: 'Failed to record attendance',
      direction: 'right'
    });
  };

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedClass("all");
      setSelectedClassId(null);
      setSelectedWorkshop("");
      setSelectedStudents({});
    }
  }, [open]);

  // Group students by major
  const groupedStudents = students.reduce((groups, student) => {
    const major = student.major_short || 'Other';
    if (!groups[major]) {
      groups[major] = [];
    }
    groups[major].push(student);
    return groups;
  }, {} as Record<string, typeof students>);

  const sortedMajors = Object.keys(groupedStudents).sort();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Record Student Attendance</DialogTitle>
          <DialogDescription>
            Select a workshop and class, then mark attendance for each student.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Selection Controls */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="class" className="text-sm font-medium">Class</Label>
              <Select value={selectedClass} onValueChange={handleClassChange}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {groupedClasses.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No classes available</div>
                  ) : (
                    groupedClasses.map(({ groupName, classes: groupClasses }) => (
                      <div key={groupName}>
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {groupName}</div>
                        {groupClasses.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id.toString()}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="workshop" className="text-sm font-medium">Workshop</Label>
              <Select value={selectedWorkshop} onValueChange={setSelectedWorkshop} disabled={selectedClass === "all" || loadingWorkshops}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue placeholder={loadingWorkshops ? "Loading workshops..." : "Select workshop"}>
                    {selectedWorkshop && workshops.find(w => w.id.toString() === selectedWorkshop)?.title || "Select workshop"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {loadingWorkshops ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin h-5 w-5 border-2 border-orange-600 border-t-transparent rounded-full"></div>
                      <span className="ml-2 text-sm text-gray-500">Loading workshops...</span>
                    </div>
                  ) : selectedClass === "all" ? (
                    <div className="p-4 text-center text-gray-500">Select a class first</div>
                  ) : workshops.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No available workshops for this class</div>
                  ) : (
                    workshops.map((workshop) => (
                      <SelectItem key={workshop.id} value={workshop.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{workshop.title}</span>
                          {workshop.date && (
                            <span className="text-xs text-gray-500">
                              {format(new Date(workshop.date), "MMM dd, yyyy")}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Student List */}
          {selectedWorkshop && selectedClass !== "all" && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Student Attendance</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Quick Actions:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const allPresent = students.reduce((acc, student) => {
                        acc[student.id] = 'present';
                        return acc;
                      }, {} as typeof selectedStudents);
                      setSelectedStudents(allPresent);
                    }}
                    disabled={loadingStudents || students.length === 0}
                  >
                    Mark All Present
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedStudents({})}
                    disabled={loadingStudents}
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto border rounded-lg">
                {loadingStudents ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="animate-spin h-8 w-8 border-2 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading students...</p>
                    </div>
                  </div>
                ) : students.length === 0 ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 mb-2">No students found</p>
                      <p className="text-sm text-gray-400">There are no students enrolled in this class</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-4">
                    {sortedMajors.map((major) => (
                      <div key={major} className="space-y-2">
                        <div className="flex items-center space-x-2 py-2 border-gray-200">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <h4 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                            {major} ({groupedStudents[major].length} students)
                          </h4>
                        </div>
                        <div className="space-y-2 ml-4">
                          {groupedStudents[major]
                            .sort((a, b) => a.first_name.localeCompare(b.first_name))
                            .map((student) => (
                              <div key={student.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {student.first_name[0]}{student.last_name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium text-sm">{student.first_name} {student.last_name}</div>
                                    <div className="text-xs text-gray-500">{student.grade} • {student.major_short}</div>
                                  </div>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={`w-32 justify-between px-3 ${
                                        selectedStudents[student.id] === 'present' ? 'bg-green-50 border-green-300 text-green-700' :
                                        selectedStudents[student.id] === 'late' ? 'bg-orange-50 border-orange-300 text-orange-700' :
                                        selectedStudents[student.id] === 'absent' ? 'bg-red-50 border-red-300 text-red-700' :
                                        selectedStudents[student.id] === 'excused' ? 'bg-blue-50 border-blue-300 text-blue-700' :
                                        'border-gray-300'
                                      }`}
                                    >
                                      <div className="flex items-center">
                                        {selectedStudents[student.id] === 'present' && <UserCheck className="h-4 w-4 mr-2" />}
                                        {selectedStudents[student.id] === 'late' && <Clock className="h-4 w-4 mr-2" />}
                                        {selectedStudents[student.id] === 'absent' && <UserX className="h-4 w-4 mr-2" />}
                                        {selectedStudents[student.id] === 'excused' && <AlertCircle className="h-4 w-4 mr-2" />}
                                        <span className="truncate">{selectedStudents[student.id] || 'Select Status'}</span>
                                      </div>
                                      <ChevronDown className="h-4 w-4 mr-2 flex-shrink-0" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-32">
                                    <DropdownMenuItem
                                      onClick={() => setSelectedStudents(prev => {
                                        const newState = { ...prev };
                                        if (selectedStudents[student.id] === 'present') {
                                          delete newState[student.id];
                                        } else {
                                          newState[student.id] = 'present';
                                        }
                                        return newState;
                                      })}
                                      className="flex items-center"
                                    >
                                      <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                                      Present
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setSelectedStudents(prev => {
                                        const newState = { ...prev };
                                        if (selectedStudents[student.id] === 'late') {
                                          delete newState[student.id];
                                        } else {
                                          newState[student.id] = 'late';
                                        }
                                        return newState;
                                      })}
                                      className="flex items-center"
                                    >
                                      <Clock className="h-4 w-4 mr-2 text-orange-600" />
                                      Late
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setSelectedStudents(prev => {
                                        const newState = { ...prev };
                                        if (selectedStudents[student.id] === 'absent') {
                                          delete newState[student.id];
                                        } else {
                                          newState[student.id] = 'absent';
                                        }
                                        return newState;
                                      })}
                                      className="flex items-center"
                                    >
                                      <UserX className="h-4 w-4 mr-2 text-red-600" />
                                      Absent
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setSelectedStudents(prev => {
                                        const newState = { ...prev };
                                        if (selectedStudents[student.id] === 'excused') {
                                          delete newState[student.id];
                                        } else {
                                          newState[student.id] = 'excused';
                                        }
                                        return newState;
                                      })}
                                      className="flex items-center"
                                    >
                                      <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
                                      Excused
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600">
              {Object.values(selectedStudents).filter(status => status).length === 0 ? (
                <span>No students marked</span>
              ) : (
                <span>
                  {loadingStudents ? "Loading..." : `${Object.values(selectedStudents).filter(status => status).length} students marked`}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRecordAttendance}
                disabled={!selectedWorkshop || selectedClass === "all" || loadingStudents || students.length === 0 || Object.values(selectedStudents).filter(status => status).length === 0 || recordAttendanceMutation.isPending}
                className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200"
              >
                {recordAttendanceMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  "Record Attendance"
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

