"use client";

import { useState } from "react";
import { Button } from "@/zenith/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/zenith/components/ui/popover";
import { Input } from "@/zenith/components/ui/input";
import { ChevronsUpDown, Check } from "lucide-react";

type CRCClass = { id: string; name: string; grade_group: string | null; num_students: number };
type Workshop = { id: string; title: string; crc_classes: Array<{ id: string; name: string }>; assignments: Array<{ id: string; title: string }> };
type Assignment = { id: string; title: string; workshop_id: string | null };

interface AssignmentsFiltersProps {
  classes: Array<CRCClass>;
  groupedClasses: Array<{ id: string; name: string; isGroup: boolean; classes: Array<CRCClass> }>;
  workshops: Array<Workshop>;
  filteredWorkshops: Array<Workshop>;
  assignments: Array<Assignment>;
  filteredAssignments: Array<Assignment>;
  selectedClass: string | null;
  selectedWorkshop: string | null;
  assignmentId: string | null;
  onUpdateNavigation: (updates: {
    selectedClass?: string | null;
    selectedWorkshop?: string | null;
    assignmentId?: string | null;
  }) => void;
  onClearCache: () => void;
}

export function AssignmentsFilters({
  classes,
  groupedClasses,
  workshops,
  filteredWorkshops,
  assignments,
  filteredAssignments,
  selectedClass,
  selectedWorkshop,
  assignmentId,
  onUpdateNavigation,
  onClearCache,
}: AssignmentsFiltersProps) {
  const [workshopPopoverOpen, setWorkshopPopoverOpen] = useState(false);
  const [assignmentPopoverOpen, setAssignmentPopoverOpen] = useState(false);
  const [workshopSearch, setWorkshopSearch] = useState("");

  const selectedClassObj = classes.find(c => c.id === selectedClass);
  const selectedWorkshopObj = filteredWorkshops.find(w => w.title === selectedWorkshop);
  const selectedAssignmentObj = filteredAssignments.find(a => a.id === assignmentId);

  return (
    <div className="flex items-center gap-3">
      {/* Step 1: Class Selection */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-48 justify-between">
            <span className="truncate text-left">
              {selectedClassObj?.name || "Select Class"}
            </span>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          <div className="space-y-1">
            {groupedClasses.length === 0 ? (
              <div className="py-6 text-center text-sm text-neutral-500">
                No classes found
              </div>
            ) : (
              groupedClasses.map((classGroup) => (
                <div key={classGroup.id} className="space-y-1">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-left">
                    <span className="font-medium text-gray-700">{classGroup.name}</span>
                  </div>
                  {classGroup.classes && classGroup.classes.length > 0 && (
                    <div className="pl-4 space-y-0.5">
                      {classGroup.classes.map((cls) => (
                        <button
                          key={cls.id}
                          onClick={() => {
                            onUpdateNavigation({ selectedClass: cls.id });
                            onClearCache();
                          }}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-neutral-50 rounded-md ${selectedClass === cls.id ? 'bg-neutral-50' : ''}`}
                        >
                          <Check className={`h-4 w-4 ${selectedClass === cls.id ? 'opacity-100' : 'opacity-0'}`} />
                          <span className="flex-1">{cls.name}</span>
                          <span className="text-xs text-gray-500">
                            ({cls.num_students})
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Step 2: Workshop Selection */}
      <Popover open={workshopPopoverOpen} onOpenChange={setWorkshopPopoverOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-48 justify-between" 
            disabled={!selectedClass}
          >
            <span className="truncate text-left">
              {selectedWorkshopObj?.title || "Select Workshop"}
            </span>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-2">
          <div className="p-2">
            <Input
              placeholder="Search workshops..."
              value={workshopSearch}
              onChange={(e) => setWorkshopSearch(e.target.value)}
            />
          </div>
          <div className="space-y-1 max-h-72 overflow-auto">
            {!selectedClass ? (
              <div className="py-6 text-center text-sm text-neutral-500">
                Select a class first
              </div>
            ) : filteredWorkshops.length === 0 ? (
              <div className="py-6 text-center text-sm text-neutral-500">
                No workshops found for this class
              </div>
            ) : (
              filteredWorkshops
                .filter((workshop) => workshop.title.toLowerCase().includes(workshopSearch.toLowerCase()))
                .map((workshop) => (
                  <button
                    key={workshop.id}
                    onClick={() => {
                      onUpdateNavigation({ selectedWorkshop: workshop.title });
                      setWorkshopPopoverOpen(false);
                      onClearCache();
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-neutral-50 rounded-md ${selectedWorkshop === workshop.title ? 'bg-neutral-50' : ''}`}
                  >
                    <Check className={`h-4 w-4 flex-shrink-0 ${selectedWorkshop === workshop.title ? 'opacity-100' : 'opacity-0'}`} />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="break-words font-normal leading-relaxed">{workshop.title}</span>
                    </div>
                  </button>
                ))
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Step 3: Assignment Selection */}
      <Popover open={assignmentPopoverOpen} onOpenChange={setAssignmentPopoverOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-64 justify-between" 
            disabled={!selectedWorkshop}
          >
            <span className="truncate text-left">
              {selectedAssignmentObj?.title || "Select Assignment"}
            </span>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-2">
          <div className="space-y-1 max-h-72 overflow-auto">
            {!selectedWorkshop ? (
              <div className="py-6 text-center text-sm text-neutral-500">Select a workshop first</div>
            ) : !selectedWorkshopObj ? (
              <div className="py-6 text-center text-sm text-neutral-500">Workshop not found</div>
            ) : selectedWorkshopObj.assignments.length === 0 ? (
              <div className="py-6 text-center text-sm text-neutral-500">No assignments found</div>
            ) : (
              selectedWorkshopObj.assignments.map((assignment) => (
                <button
                  key={assignment.id}
                  onClick={() => {
                    onUpdateNavigation({ assignmentId: assignment.id });
                    setAssignmentPopoverOpen(false);
                    onClearCache();
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-neutral-50 rounded-md ${assignmentId === assignment.id ? 'bg-neutral-50' : ''}`}
                >
                  <Check className={`h-4 w-4 ${assignmentId === assignment.id ? 'opacity-100' : 'opacity-0'}`} />
                  <span className="truncate">{assignment.title}</span>
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

