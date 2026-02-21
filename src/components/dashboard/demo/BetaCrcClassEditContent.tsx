"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/zenith/components/ui/button";
import { Input } from "@/zenith/components/ui/input";
import { Checkbox } from "@/zenith/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/zenith/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/zenith/components/ui/alert-dialog";
import { Users, Plus, X, Check, ChevronDown, Upload } from "lucide-react";
import { BetaCrcClassEditHeader } from "./BetaCrcClassEditHeader";
import { showToastError } from "@/components/toasts";

// Dummy data for Demo
const dummyClasses = [
  { id: "class1", name: "CRC Alpha", grade_group: "Senior 6", created_by_name: "Admin User" },
  { id: "class2", name: "CRC Beta", grade_group: "Senior 5", created_by_name: "Admin User" },
  { id: "class3", name: "CRC Gamma", grade_group: "Senior 4", created_by_name: "Admin User" },
];

const dummyStudents = [
  { id: "s1", first_name: "Alice", last_name: "Smith", grade: "Senior 6", major_short: "MCB", crc_class_id: "class1" },
  { id: "s2", first_name: "Bob", last_name: "Jones", grade: "Senior 6", major_short: "MCB", crc_class_id: "class1" },
  { id: "s3", first_name: "Charlie", last_name: "Brown", grade: "Senior 6", major_short: "PCM", crc_class_id: null },
  { id: "s4", first_name: "Diana", last_name: "Prince", grade: "Senior 6", major_short: "HEG", crc_class_id: null },
  { id: "s5", first_name: "Edward", last_name: "Norton", grade: "Senior 5", major_short: "PCB", crc_class_id: null },
];

export function BetaCrcClassEditContent() {
  const params = useParams();
  const groupId = String(params?.groupId || "class1");

  const classData = dummyClasses.find(c => c.id === groupId) || dummyClasses[0];
  const classStudents = dummyStudents.filter(s => s.crc_class_id === groupId);
  
  // State
  const [selected, setSelected] = useState<string[]>([]);
  const [availableQuery, setAvailableQuery] = useState("");
  const [membersQuery, setMembersQuery] = useState("");
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [selectedToRemove, setSelectedToRemove] = useState<string[]>([]);

  // Available students (exact copy of original logic but with dummyStudents)
  const availableStudents = useMemo(() => {
    const memberIds = new Set(classStudents.map((s) => s.id));
    const q = availableQuery.trim().toLowerCase();
    const matchingGrade = classData.grade_group;
    
    return dummyStudents.filter((s) => {
      if (memberIds.has(s.id)) return false;
      if (s.crc_class_id !== null) return false;
      if (matchingGrade && s.grade !== matchingGrade) return false;
      if (!q) return true;
      const name = `${s.first_name || ""} ${s.last_name || ""}`.trim().toLowerCase();
      const className = `${s.grade || ""} ${s.major_short || ""}`.trim().toLowerCase();
      return [name, className].some((v) => v.toLowerCase().includes(q));
    });
  }, [classData, availableQuery, classStudents]);

  // Grouped for Dropdown
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
    if (!q) return classStudents;
    return classStudents.filter((s) => {
      const name = `${s.first_name || ""} ${s.last_name || ""}`.trim().toLowerCase();
      const className = `${s.grade || ""} ${s.major_short || ""}`.trim().toLowerCase();
      return [name, className].some((v) => v.toLowerCase().includes(q));
    });
  }, [classStudents, membersQuery]);

  const handleAction = () => {
    showToastError({
      headerText: "Demo Action",
      paragraphText: "This action is disabled in the demo dashboard.",
      direction: "right"
    });
  };

  const selectAllFromClass = (className: string) => {
    const classStudentsList = studentsByClass[className] || [];
    const classStudentIds = classStudentsList.map(s => s.id);
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

  const selectAllMembers = () => {
    const memberIds = filteredMembers.map((s) => s.id);
    const allSelected = memberIds.every((id) => selectedToRemove.includes(id));
    if (allSelected) {
      setSelectedToRemove(prev => prev.filter(id => !memberIds.includes(id)));
    } else {
      setSelectedToRemove(prev => {
        const newSelected = [...prev];
        memberIds.forEach((id) => {
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
      <BetaCrcClassEditHeader group={classData as any} />

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
                <DropdownMenuItem onClick={() => setSelected([])} className="font-medium text-red-600">
                  Clear Selection
                </DropdownMenuItem>
                <div className="border-t my-1"></div>
                {Object.keys(studentsByClass).map((className) => (
                  <DropdownMenuItem
                    key={className}
                    onClick={(e) => { e.preventDefault(); selectAllFromClass(className); }}
                    className="flex items-center justify-between"
                  >
                    <span>{className} ({studentsByClass[className].length})</span>
                    {studentsByClass[className].every(s => selected.includes(s.id)) && <Check className="h-4 w-4 text-green-600" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="gap-2" onClick={handleAction}>
              <Upload className="h-4 w-4" />
              Bulk Import
            </Button>
            <Button onClick={handleAction} disabled={selected.length === 0} className="bg-primary hover:bg-primary/80 text-white">
              <Plus className="h-4 w-4 mr-1" />
              Add Selected ({selected.length})
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-neutral-500">Available Students</div>
              {classData.grade_group && (
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
              {availableStudents.map((s) => (
                <div key={s.id} className="flex items-center gap-2 text-sm hover:bg-gray-50 p-1 rounded">
                  <Checkbox
                    checked={selected.includes(s.id)}
                    onCheckedChange={() => setSelected(prev =>
                      prev.includes(s.id) ? prev.filter(v => v !== s.id) : [...prev, s.id]
                    )}
                    className="border-black data-[state=checked]:text-white data-[state=checked]:border-white data-[state=checked]:bg-orange-500"
                  />
                  <div className="flex-1 truncate">
                    <span className="font-medium">{s.first_name} {s.last_name}</span>
                    <span className="text-neutral-500 ml-2">— {s.grade} {s.major_short}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-neutral-500">Current Members</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={selectAllMembers} className="text-xs h-6 px-2">
                  Select All
                </Button>
                {selectedToRemove.length > 0 && (
                  <Button variant="destructive" size="sm" onClick={handleAction} className="text-xs h-6 px-2">
                    Remove ({selectedToRemove.length})
                  </Button>
                )}
              </div>
            </div>
            <Input
              placeholder="Search current members..."
              value={membersQuery}
              onChange={(e) => setMembersQuery(e.target.value)}
              className="mb-3 h-8 text-sm"
            />
            <div className="max-h-64 overflow-auto space-y-1">
              {filteredMembers.map((s) => (
                <div key={s.id} className="flex items-center gap-2 text-sm hover:bg-gray-50 p-1 rounded">
                  <Checkbox
                    checked={selectedToRemove.includes(s.id)}
                    onCheckedChange={() => setSelectedToRemove(prev =>
                      prev.includes(s.id) ? prev.filter(v => v !== s.id) : [...prev, s.id]
                    )}
                    className="border-black data-[state=checked]:text-white data-[state=checked]:border-white data-[state=checked]:bg-orange-500"
                  />
                  <div className="flex-1 truncate">
                    <span className="font-medium">{s.first_name} {s.last_name}</span>
                    <span className="text-neutral-500 ml-2">— {s.grade} {s.major_short}</span>
                  </div>
                  <button onClick={handleAction} className="text-red-600 hover:text-red-700 ml-2">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
