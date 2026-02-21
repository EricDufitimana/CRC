"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSuspenseQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useSearchParams, useRouter } from "next/navigation";
import { AssignmentsManagementHeader } from "./AssignmentsManagementHeader";
import { AssignmentsFilters } from "./AssignmentsFilters";
import { AssignmentsTable } from "./AssignmentsTable";
import { AssignmentsMetrics } from "./AssignmentsMetrics";
import { SubmissionDialog } from "./SubmissionDialog";
import { AssignmentDetailLoading } from "./AssignmentDetailLoading";
import { DeskIcon } from "@phosphor-icons/react";

export function AssignmentsManagementContent() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get URL params
  const selectedClass = searchParams?.get('crcClassId') || null;
  const selectedWorkshop = searchParams?.get('workshopId') || null;
  const assignmentId = searchParams?.get('assignmentId') || null;

  // Fetch data using tRPC
  const { data: classes = [] } = useSuspenseQuery(
    trpc.assignmentsManagement.getCrcClasses.queryOptions(undefined)
  );
  const { data: workshops = [] } = useSuspenseQuery(
    trpc.assignmentsManagement.getWorkshops.queryOptions({ useCase: 'assignment' })
  );
  const { data: assignmentsList } = useSuspenseQuery(
    trpc.assignmentsManagement.getAssignmentsForManagement.queryOptions(undefined)
  );

  // Fetch assignment detail if assignmentId is selected
  // Using useQuery for conditional fetching since useSuspenseQuery doesn't support enabled
  const { data: assignmentDetail, isLoading: isLoadingAssignmentDetail } = useQuery({
    ...trpc.assignmentsManagement.getAssignmentsForManagement.queryOptions({
      assignmentId: assignmentId || undefined,
      selectedClassId: selectedClass || undefined,
    }),
    enabled: !!assignmentId && !!selectedClass,
  });

  // State for UI
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loadingUrls, setLoadingUrls] = useState<Record<string, boolean>>({});
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Helper to group classes by grade_group
  const groupedClasses = useMemo(() => {
    const groupedByGrade: Record<string, typeof classes> = {};
    
    classes.forEach(c => {
      const gradeGroup = c.grade_group || 'Other';
      if (!groupedByGrade[gradeGroup]) {
        groupedByGrade[gradeGroup] = [];
      }
      groupedByGrade[gradeGroup].push(c);
    });
    
    const grouped = Object.entries(groupedByGrade).map(([gradeGroup, classList]) => ({
      id: gradeGroup === 'Other' ? 'other_group' : `${gradeGroup.toLowerCase().replace(/\s+/g, '_')}_group`,
      name: gradeGroup === 'Other' ? 'Other' : gradeGroup,
      isGroup: true,
      classes: classList
    }));
    
    const order = ['Enrichment Year', 'Senior 4', 'Senior 5', 'Senior 6'];
    grouped.sort((a, b) => {
      const aIndex = order.indexOf(a.name);
      const bIndex = order.indexOf(b.name);
      if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
    
    return grouped;
  }, [classes]);

  // Filter workshops by selected class
  const filteredWorkshops = useMemo(() => {
    if (!selectedClass) return workshops;
    return workshops.filter(workshop => 
      workshop.crc_classes.some(crcClass => crcClass.id === selectedClass)
    );
  }, [workshops, selectedClass]);

  // Filter assignments by selected workshop
  const assignments = (assignmentsList as any)?.assignments || [];
  const filteredAssignments = useMemo(() => {
    if (!selectedWorkshop) return assignments;
    return assignments.filter((assignment: any) => 
      assignment.workshop_title === selectedWorkshop
    );
  }, [assignments, selectedWorkshop]);

  // Update navigation
  const updateNavigation = useCallback((updates: {
    selectedClass?: string | null;
    selectedWorkshop?: string | null;
    assignmentId?: string | null;
  }) => {
    const params = new URLSearchParams();
    
    const newClass = updates.selectedClass !== undefined ? updates.selectedClass : selectedClass;
    const newWorkshop = updates.selectedWorkshop !== undefined ? updates.selectedWorkshop : selectedWorkshop;
    const newAssignment = updates.assignmentId !== undefined ? updates.assignmentId : assignmentId;
    
    let finalWorkshop = newWorkshop;
    let finalAssignment = newAssignment;
    
    if (updates.selectedClass !== undefined && updates.selectedClass !== selectedClass) {
      finalWorkshop = null;
      finalAssignment = null;
    }
    if (updates.selectedWorkshop !== undefined && updates.selectedWorkshop !== selectedWorkshop) {
      finalAssignment = null;
    }
    
    if (newClass) params.set('crcClassId', newClass);
    if (finalWorkshop) params.set('workshopId', finalWorkshop);
    if (finalAssignment) params.set('assignmentId', finalAssignment);
    
    router.push(`/dashboard/admin/assignments-management?${params.toString()}`);
  }, [selectedClass, selectedWorkshop, assignmentId, router]);

  // Get signed URL
  const getSignedUrl = useCallback(async (filePath: string, studentId: string) => {
    const urlKey = `${studentId}-${filePath}`;
    
    if (signedUrls[urlKey]) {
      return signedUrls[urlKey];
    }
    
    setLoadingUrls(prev => ({ ...prev, [urlKey]: true }));
    
    try {
      const data = await queryClient.fetchQuery(
        trpc.assignmentsManagement.getSignedUrl.queryOptions({ filePath })
      );
      
      if (data.signedUrl) {
        setSignedUrls(prev => ({ ...prev, [urlKey]: data.signedUrl }));
        return data.signedUrl;
      }
    } catch (error) {
      console.error('Error fetching signed URL:', error);
    } finally {
      setLoadingUrls(prev => ({ ...prev, [urlKey]: false }));
    }
  }, [signedUrls, queryClient, trpc]);

  // Clear signed URLs cache
  const clearSignedUrlsCache = useCallback(() => {
    setSignedUrls({});
    setLoadingUrls({});
    setSelectedSubmission(null);
    setDialogOpen(false);
  }, []);

  // Get rows from assignment detail
  const assignmentDetailData = assignmentDetail as any;
  const rows = assignmentDetailData?.rows || [];
  const assignmentData = assignmentDetailData?.assignment || null;
  const metrics = assignmentDetailData?.metrics || { total_students: 0, total_submitted: 0 };

  return (
    <div className="p-6">
      <div className="space-y-4">
        
        {/* Header / Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-cal-sans text-gray-800">Assignments</h1>
          </div>
          
          {/* Hierarchical Navigation */}
          <AssignmentsFilters
            classes={classes}
            groupedClasses={groupedClasses}
            workshops={workshops}
            filteredWorkshops={filteredWorkshops}
            assignments={assignments}
            filteredAssignments={filteredAssignments}
            selectedClass={selectedClass}
            selectedWorkshop={selectedWorkshop}
            assignmentId={assignmentId}
            onUpdateNavigation={updateNavigation}
            onClearCache={clearSignedUrlsCache}
          />
        </div>

        {/* Content Area */}
        {!assignmentId ? (
          /* Navigation Guide */
          <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50/50">
            <div className="flex items-center justify-center">

              <DeskIcon size={70} className="text-gray-500 text-center"/>

            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Select an Assignment</h3>
            <p className="text-gray-500 mb-4">
              Choose a class, then workshop, then assignment to view student submission data.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <span className="px-2 py-1 bg-white rounded border">Class</span>
              <span>→</span>
              <span className="px-2 py-1 bg-white rounded border">Workshop</span>
              <span>→</span>
              <span className="px-2 py-1 bg-white rounded border">Assignment</span>
            </div>
          </div>
        ) : isLoadingAssignmentDetail ? (
          /* Loading Skeleton */
          <AssignmentDetailLoading />
        ) : (
          <>
            {/* Metrics */}
            <AssignmentsMetrics 
              assignmentData={assignmentData}
              metrics={metrics}
            />

            {/* Table */}
            <AssignmentsTable
              rows={rows}
              signedUrls={signedUrls}
              loadingUrls={loadingUrls}
              onGetSignedUrl={getSignedUrl}
              onSelectSubmission={(row) => {
                setSelectedSubmission(row);
                setDialogOpen(true);
              }}
            />

            {/* Submission Dialog */}
            <SubmissionDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              submission={selectedSubmission}
              signedUrls={signedUrls}
              loadingUrls={loadingUrls}
            />
          </>
        )}
      </div>
    </div>
  );
}

