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
import {
  Users,
  Clock,
  UserX,
  AlertCircle,
  UserCheck,
  ChevronDown,
  Loader2,
  CheckCheck,
  X,
} from "lucide-react";
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

type AttendanceStatus = "present" | "absent" | "late" | "excused";

const STATUS_CONFIG: Record<
  AttendanceStatus,
  {
    label: string;
    icon: React.ElementType;
    rowClass: string;
    badgeClass: string;
    dotClass: string;
  }
> = {
  present: {
    label: "Present",
    icon: UserCheck,
    rowClass: "bg-green-50 border-green-200 text-green-700",
    badgeClass: "text-green-700",
    dotClass: "bg-green-500",
  },
  late: {
    label: "Late",
    icon: Clock,
    rowClass: "bg-orange-50 border-orange-200 text-orange-700",
    badgeClass: "text-orange-700",
    dotClass: "bg-orange-500",
  },
  absent: {
    label: "Absent",
    icon: UserX,
    rowClass: "bg-red-50 border-red-200 text-red-700",
    badgeClass: "text-red-700",
    dotClass: "bg-red-500",
  },
  excused: {
    label: "Excused",
    icon: AlertCircle,
    rowClass: "bg-blue-50 border-blue-200 text-blue-700",
    badgeClass: "text-blue-700",
    dotClass: "bg-blue-500",
  },
};

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
  const [selectedStudents, setSelectedStudents] = useState<
    Record<string, AttendanceStatus>
  >({});

  const { data: allWorkshops = [], isLoading: loadingWorkshops } = useQuery({
    ...trpc.assignmentsManagement.getWorkshops.queryOptions(undefined),
    enabled: open,
  });

  const workshops = useMemo(() => {
    if (!selectedClassId) return [];
    return allWorkshops.filter((workshop) =>
      workshop.crc_classes.some((cc) => cc.id === selectedClassId)
    );
  }, [allWorkshops, selectedClassId]);

  const { data: classData, isLoading: loadingStudents } = useQuery({
    ...trpc.crcClassManagement.getCrcClassStudents.queryOptions({
      classId: selectedClassId || "",
    }),
    enabled: !!selectedClassId && open,
  });

  const students = classData?.students || [];

  const recordAttendanceMutation = useMutation({
    ...trpc.attendanceManagement.recordAttendance.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [["attendanceManagement", "getAttendanceRecords"]],
      });
      onOpenChange(false);
      resetState();
    },
  });

  const resetState = () => {
    setSelectedClass("all");
    setSelectedClassId(null);
    setSelectedWorkshop("");
    setSelectedStudents({});
  };

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

    const attendanceRecords = Object.entries(selectedStudents).map(
      ([studentId, status]) => ({ studentId, status })
    );

    if (attendanceRecords.length === 0) return;

    const promise = recordAttendanceMutation.mutateAsync({
      workshopId: selectedWorkshop,
      classId: selectedClassId,
      attendanceRecords,
    });

    showToastPromise({
      promise,
      loadingText: "Recording attendance...",
      successText: "This record will appear in your history.",
      successHeaderText: "Attendance Recorded Successfully",
      errorText: "Please try again.",
      errorHeaderText: "Failed to record attendance",
      direction: "right",
    });
  };

  const setStudentStatus = (
    studentId: string,
    status: AttendanceStatus | null
  ) => {
    setSelectedStudents((prev) => {
      const next = { ...prev };
      if (status === null || prev[studentId] === status) {
        delete next[studentId];
      } else {
        next[studentId] = status;
      }
      return next;
    });
  };

  useEffect(() => {
    if (!open) resetState();
  }, [open]);

  const groupedStudents = useMemo(
    () =>
      students.reduce(
        (groups, student) => {
          const major = student.major_short || "Other";
          if (!groups[major]) groups[major] = [];
          groups[major].push(student);
          return groups;
        },
        {} as Record<string, typeof students>
      ),
    [students]
  );

  const sortedMajors = Object.keys(groupedStudents).sort();

  // Footer stats
  const markedCount = Object.keys(selectedStudents).length;
  const statusCounts = Object.values(selectedStudents).reduce(
    (acc, s) => ({ ...acc, [s]: (acc[s] || 0) + 1 }),
    {} as Record<AttendanceStatus, number>
  );

  const showStudentList =
    selectedWorkshop && selectedClass !== "all";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 ">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Record Student Attendance
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 mt-0.5">
            Select a workshop and class, then mark attendance for each student.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col px-6">
          {/* Class + Workshop selectors */}
          <div className="grid grid-cols-2 gap-4 py-5 border-b border-gray-100">
            <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class
              </Label>
              <Select value={selectedClass} onValueChange={handleClassChange}>
                <SelectTrigger className="rounded-xl h-10">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {groupedClasses.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-400">
                      No classes available
                    </div>
                  ) : (
                    groupedClasses.map(({ groupName, classes: groupClasses }) => (
                      <div key={groupName}>
                        <div className="px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                          {groupName}
                        </div>
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

            <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Workshop
              </Label>
              <Select
                value={selectedWorkshop}
                onValueChange={setSelectedWorkshop}
                disabled={selectedClass === "all" || loadingWorkshops}
              >
                <SelectTrigger className="rounded-xl h-10">
                  <SelectValue
                    placeholder={
                      loadingWorkshops
                        ? "Loading workshops..."
                        : "Select workshop"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {loadingWorkshops ? (
                    <div className="flex items-center justify-center p-4 gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                      <span className="text-sm text-gray-400">
                        Loading workshops...
                      </span>
                    </div>
                  ) : selectedClass === "all" ? (
                    <div className="p-4 text-center text-sm text-gray-400">
                      Select a class first
                    </div>
                  ) : workshops.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-400">
                      No workshops for this class
                    </div>
                  ) : (
                    workshops.map((workshop) => (
                      <SelectItem
                        key={workshop.id}
                        value={workshop.id.toString()}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{workshop.title}</span>
                          {workshop.date && (
                            <span className="text-xs text-gray-400">
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

          {/* Student list */}
          {showStudentList && (
            <div className="flex-1 overflow-hidden flex flex-col pt-4">
              {/* Section header + quick actions */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-800">
                  Student Attendance
                </h3>

                {/* ✨ THE IMPROVED QUICK ACTIONS */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const allPresent = students.reduce(
                        (acc, s) => ({ ...acc, [s.id]: "present" as const }),
                        {} as Record<string, AttendanceStatus>
                      );
                      setSelectedStudents(allPresent);
                    }}
                    disabled={loadingStudents || students.length === 0}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                               bg-green-50 text-green-700 border border-green-200
                               hover:bg-green-100 hover:border-green-300
                               disabled:opacity-40 disabled:cursor-not-allowed
                               transition-all duration-150"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark All Present
                  </button>

                  <button
                    onClick={() => setSelectedStudents({})}
                    disabled={loadingStudents || markedCount === 0}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                               text-gray-500 border border-gray-200
                               hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300
                               disabled:opacity-40 disabled:cursor-not-allowed
                               transition-all duration-150"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear
                  </button>
                </div>
              </div>

              {/* Scrollable student list */}
              <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl">
                {loadingStudents ? (
                  <div className="flex flex-col items-center justify-center p-12 gap-3">
                    <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
                    <p className="text-sm text-gray-400">Loading students...</p>
                  </div>
                ) : students.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-300" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-500">
                        No students found
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        No students are enrolled in this class
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {sortedMajors.map((major) => (
                      <div key={major}>
                        {/* Major group header */}
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50/70 sticky top-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                            {major}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            · {groupedStudents[major].length} students
                          </span>
                        </div>

                        {/* Students */}
                        <div className="px-3 py-1.5 space-y-1.5">
                          {groupedStudents[major]
                            .sort((a, b) =>
                              a.first_name.localeCompare(b.first_name)
                            )
                            .map((student) => {
                              const status = selectedStudents[student.id];
                              const cfg = status
                                ? STATUS_CONFIG[status]
                                : null;
                              const StatusIcon = cfg?.icon;

                              return (
                                <div
                                  key={student.id}
                                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all duration-150 bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50`}
                                >
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8 shrink-0">
                                      <AvatarFallback
                                        className={`text-xs font-medium ${
                                          cfg
                                            ? cfg.badgeClass
                                            : "text-gray-600 bg-gray-100"
                                        }`}
                                      >
                                        {student.first_name[0]}
                                        {student.last_name[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="text-sm font-medium leading-tight">
                                        {student.first_name} {student.last_name}
                                      </div>
                                      <div className="text-xs mt-0.5 text-gray-400">
                                        {student.grade} · {student.major_short}
                                      </div>
                                    </div>
                                  </div>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 min-w-[120px] justify-between ${
                                          cfg
                                            ? `${cfg.rowClass} hover:opacity-80`
                                            : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                                        }`}
                                      >
                                        <span className="flex items-center gap-1.5">
                                          {StatusIcon && (
                                            <StatusIcon className="h-3.5 w-3.5" />
                                          )}
                                          {cfg ? cfg.label : "Set status"}
                                        </span>
                                        <ChevronDown className="h-3.5 w-3.5 opacity-60 shrink-0" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-36 p-1"
                                    >
                                      {(
                                        Object.entries(
                                          STATUS_CONFIG
                                        ) as Array<
                                          [AttendanceStatus, (typeof STATUS_CONFIG)[AttendanceStatus]]
                                        >
                                      ).map(([s, config]) => {
                                        const Icon = config.icon;
                                        return (
                                          <DropdownMenuItem
                                            key={s}
                                            onClick={() =>
                                              setStudentStatus(student.id, s)
                                            }
                                            className={`flex items-center gap-2 rounded-md text-xs px-2 py-1.5 cursor-pointer ${
                                              status === s
                                                ? `${config.rowClass} font-medium`
                                                : ""
                                            }`}
                                          >
                                            <Icon className={`h-3.5 w-3.5 ${config.badgeClass}`} />
                                            {config.label}
                                          </DropdownMenuItem>
                                        );
                                      })}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            {/* Status summary */}
            <div className="flex items-center gap-3">
              {markedCount === 0 ? (
                <span className="text-xs text-gray-400">No students marked</span>
              ) : (
                <>
                  <span className="text-xs text-gray-500 font-medium">
                    {markedCount} marked
                  </span>
                  <div className="flex items-center gap-2">
                    {(
                      Object.entries(statusCounts) as Array<
                        [AttendanceStatus, number]
                      >
                    ).map(([s, count]) => (
                      <span
                        key={s}
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${STATUS_CONFIG[s].rowClass}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[s].dotClass}`}
                        />
                        {count} {STATUS_CONFIG[s].label}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="rounded-xl text-gray-500 hover:text-gray-800 h-9 px-4"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRecordAttendance}
                disabled={
                  !selectedWorkshop ||
                  selectedClass === "all" ||
                  loadingStudents ||
                  students.length === 0 ||
                  markedCount === 0 ||
                  recordAttendanceMutation.isPending
                }
                className="rounded-xl h-9 px-5 bg-orange-500 hover:bg-orange-600 text-white
                           shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_4px_rgba(234,88,12,0.3)]
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
              >
                {recordAttendanceMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
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