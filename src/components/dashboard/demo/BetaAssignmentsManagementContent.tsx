"use client";

import { useState, useMemo } from "react";
import { FileText } from "lucide-react";
import { AssignmentsFilters } from "../admin/assignments-management/AssignmentsFilters";
import { AssignmentsTable } from "../admin/assignments-management/AssignmentsTable";
import { AssignmentsMetrics } from "../admin/assignments-management/AssignmentsMetrics";
import { SubmissionDialog } from "../admin/assignments-management/SubmissionDialog";
import { showToastError } from "@/components/toasts/ToastError";

// Dummy data for Demo
const dummyClasses = [
  { id: "class1", name: "CRC Alpha", grade_group: "Senior 6", num_students: 45 },
  { id: "class2", name: "CRC Beta", grade_group: "Senior 5", num_students: 38 },
];

const dummyWorkshops = [
  { 
    id: "w1", 
    title: "College Essay Workshop", 
    crc_classes: [{ id: "class1" }, { id: "class2" }],
    assignments: [
      { id: "a1", title: "Personal Statement Draft 1" }
    ]
  },
  { 
    id: "w2", 
    title: "Standardized Testing prep", 
    crc_classes: [{ id: "class1" }],
    assignments: [
      { id: "a2", title: "SAT Practice Test 1" }
    ]
  },
];

const dummyAssignments = [
  { 
    id: "a1", 
    title: "Personal Statement Draft 1", 
    workshop_id: "w1", 
    workshop_title: "College Essay Workshop",
    created_at: "2024-03-01T08:00:00Z",
    submission_idate: "2024-03-31T23:59:59Z"
  },
  { 
    id: "a2", 
    title: "SAT Practice Test 1", 
    workshop_id: "w2", 
    workshop_title: "Standardized Testing prep",
    created_at: "2024-03-15T09:00:00Z",
    submission_idate: "2024-04-15T23:59:59Z"
  },
];

const dummyRows = [
  {
    student_id: "s1",
    full_name: "John Doe",
    email: "john@example.com",
    status: "submitted",
    submission_date: "2024-03-20T10:00:00Z",
    file_path: "path/to/file.pdf"
  },
  {
    student_id: "s2",
    full_name: "Jane Smith",
    email: "jane@example.com",
    status: "pending",
    submission_date: null,
    file_path: null
  },
];

export function BetaAssignmentsManagementContent() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState<string | null>(null);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const groupedClasses = useMemo(() => {
    return [
      { id: "s6_group", name: "Senior 6", isGroup: true, classes: [dummyClasses[0]] },
      { id: "s5_group", name: "Senior 5", isGroup: true, classes: [dummyClasses[1]] },
    ];
  }, []);

  const filteredWorkshops = useMemo(() => {
    if (!selectedClass) return dummyWorkshops;
    return dummyWorkshops.filter(w => w.crc_classes.some(c => c.id === selectedClass));
  }, [selectedClass]);

  const filteredAssignments = useMemo(() => {
    if (!selectedWorkshop) return dummyAssignments;
    const workshop = dummyWorkshops.find(w => w.title === selectedWorkshop);
    if (!workshop) return [];
    return dummyAssignments.filter(a => a.workshop_id === workshop.id);
  }, [selectedWorkshop]);

  const updateNavigation = (updates: any) => {
    if (updates.selectedClass !== undefined) {
      setSelectedClass(updates.selectedClass);
      setSelectedWorkshop(null);
      setAssignmentId(null);
    } else if (updates.selectedWorkshop !== undefined) {
      setSelectedWorkshop(updates.selectedWorkshop);
      setAssignmentId(null);
    } else if (updates.assignmentId !== undefined) {
      setAssignmentId(updates.assignmentId);
    }
  };

  const handleAction = () => {
    showToastError({
      headerText: "Demo Action",
      paragraphText: "This action is disabled in the demo dashboard.",
      direction: "right"
    });
  };

  const assignmentData = useMemo(() => {
    return (dummyAssignments.find(a => a.id === assignmentId) || null) as any;
  }, [assignmentId]);

  const metrics = { total_students: 2, total_submitted: 1 };

  return (
    <div className="p-6">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h1 className="text-2xl font-bold font-cal-sans text-gray-800">Assignments (Demo)</h1>
          <AssignmentsFilters
            classes={dummyClasses as any}
            groupedClasses={groupedClasses as any}
            workshops={dummyWorkshops as any}
            filteredWorkshops={filteredWorkshops as any}
            assignments={dummyAssignments as any}
            filteredAssignments={filteredAssignments as any}
            selectedClass={selectedClass}
            selectedWorkshop={selectedWorkshop}
            assignmentId={assignmentId}
            onUpdateNavigation={updateNavigation}
            onClearCache={() => { }}
          />
        </div>

        {!assignmentId ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50/50">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Select an Assignment</h3>
            <p className="text-gray-500 mb-4">Choose a class, then workshop, then assignment to view dummy data.</p>
          </div>
        ) : (
          <>
            <AssignmentsMetrics assignmentData={assignmentData as any} metrics={metrics} />
            <AssignmentsTable
              rows={dummyRows as any}
              signedUrls={{}}
              loadingUrls={{}}
              onGetSignedUrl={async () => ""}
              onSelectSubmission={(row) => {
                setSelectedSubmission(row);
                setDialogOpen(true);
              }}
            />
            <SubmissionDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              submission={selectedSubmission}
              signedUrls={{}}
              loadingUrls={{}}
            />
          </>
        )}
      </div>
    </div>
  );
}
