"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, startOfWeek, endOfWeek, isWithinInterval, subWeeks } from "date-fns";
import { useUserData } from "@/hooks/useUserData";
import { DashboardHeader } from "./DashboardHeader";
import { AdminStatsCards } from "./AdminStatsCards";
import { AssignmentsSection } from "./AssignmentsSection";
import { AttentionNeededSection } from "./AttentionNeededSection";
import { AttendanceOverviewSection } from "./AttendanceOverviewSection";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

interface EssayRequest {
  id: bigint;
  title: string;
  description: string | null;
  deadline: Date | null;
  essay_link: string;
  word_count: bigint;
  student_id: bigint;
  admin_id: bigint;
  submitted_at: Date;
  completed_at: Date | null;
  status: string;
  referred: boolean;
  admin_name: string;
  student_name: string;
  admin_email: string | null;
  student_email: string | null;
  grade: string | null;
}

interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  deadline: Date | null;
  submitted_at: Date;
  status: 'pending' | 'in_review' | 'accepted' | 'denied' | 'completed';
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  submission_idate: Date;
  submission_style: any;
  created_at: Date;
  workshop_title: string | null;
  workshop_id: string | null;
  workshop_crc_class: string | null;
  crc_class_id: string | null;
  crc_class_name: string | null;
  total_submitted: number;
  total_students: number;
}

interface Announcement {
  id: string;
  message: string;
  created_at: string;
}

interface AttendanceRecord {
  id: number;
  workshop_title: string;
  class_name: string;
  present_count: number;
  total_count: number;
  date: string;
}

interface DashboardStats {
  essayRequestsThisWeek: number;
  essayRequestsLastWeek: number;
  opportunitiesAddedThisWeek: number;
  opportunitiesAddedLastWeek: number;
  newAnnouncements: number;
  newAnnouncementsLastWeek: number;
  attendanceTaken: number;
  attendanceTakenLastWeek: number;
  assignmentsThisWeek: number;
  assignmentsLastWeek: number;
}

interface AttentionItem {
  id?: string;
  title: string;
  type: 'workshop' | 'essay' | 'opportunity' | 'assignment';
  description: string;
  missingClasses?: string[];
  workshop?: any;
  assignment?: any;
}

export function DashboardContent() {
  const router = useRouter();
  const { userId, adminId, isLoading, error } = useUserData();
  const trpc = useTRPC();
  const {data: essayData = []} = useSuspenseQuery(trpc.dashboardAdmin.getEssayRequests.queryOptions(undefined));
  const {data: assignmentsData = []} = useSuspenseQuery(trpc.dashboardAdmin.getAssignments.queryOptions(undefined));
  const {data: attendanceRecordsData = []} = useSuspenseQuery(trpc.dashboardAdmin.getAttendanceRecords.queryOptions(undefined));
  const {data: workshopsData = []} = useSuspenseQuery(trpc.dashboardAdmin.getWorkshops.queryOptions(undefined));
  const {data: opportunitiesData = []} = useSuspenseQuery(trpc.dashboardAdmin.getOpportunities.queryOptions(undefined));

  // Calculate date ranges
  const now = new Date();
  const startOfThisWeek = startOfWeek(now, { weekStartsOn: 1 });
  const endOfThisWeek = endOfWeek(now, { weekStartsOn: 1 });
  const startOfLastWeek = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const endOfLastWeek = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  // Process all data using useMemo
  const processedData = useMemo(() => {
    // Process essay requests
    const thisWeekEssays = (essayData || []).filter((essay: EssayRequest) => {
      const essayDate = new Date(essay.submitted_at);
      return isWithinInterval(essayDate, { start: startOfThisWeek, end: endOfThisWeek });
    });
    const lastWeekEssays = (essayData || []).filter((essay: EssayRequest) => {
      const essayDate = new Date(essay.submitted_at);
      return isWithinInterval(essayDate, { start: startOfLastWeek, end: endOfLastWeek });
    });

    // Process assignments
    const thisWeekAssignments = (assignmentsData || []).filter((assignment: any) => {
      const dueDate = new Date(assignment.submission_idate);
      return isWithinInterval(dueDate, { start: startOfThisWeek, end: endOfThisWeek });
    });
    const lastWeekAssignments = (assignmentsData || []).filter((assignment: any) => {
      const dueDate = new Date(assignment.submission_idate);
      return isWithinInterval(dueDate, { start: startOfLastWeek, end: endOfLastWeek });
    });

    // Process attendance records
    const thisWeekAttendance = (attendanceRecordsData || []).filter((record: any) => {
      const recordDate = new Date(record.created_at);
      return isWithinInterval(recordDate, { start: startOfThisWeek, end: endOfThisWeek });
    });
    const lastWeekAttendance = (attendanceRecordsData || []).filter((record: any) => {
      const recordDate = new Date(record.created_at);
      return isWithinInterval(recordDate, { start: startOfLastWeek, end: endOfLastWeek });
    });

    const attendanceByWorkshop = thisWeekAttendance.reduce((acc: any, record: any) => {
      const key = `${record.workshop_title}-${record.class_name}`;
      if (!acc[key]) {
        acc[key] = {
          workshop_title: record.workshop_title || 'Unknown Workshop',
          class_name: record.class_name || 'Unknown Class',
          present_count: 0,
          total_count: 0,
          date: record.created_at
        };
      }
      acc[key].total_count++;
      if (record.status === 'present') {
        acc[key].present_count++;
      }
      return acc;
    }, {});

    // Process workshops for missing attendance
    const workshopsWithAttendance = new Set(
      Object.values(attendanceByWorkshop).map((record: any) => `${record.workshop_title}-${record.class_name}`)
    );
    const workshopsWithoutAttendance = (workshopsData || []).filter((workshop: any) => {
      if (!workshop.crc_classes || workshop.crc_classes.length === 0) {
        return true;
      }
      const missingAttendanceClasses = workshop.crc_classes.filter((crcClass: any) => {
        const workshopClassKey = `${workshop.title}-${crcClass.name}`;
        return !workshopsWithAttendance.has(workshopClassKey);
      });
      return missingAttendanceClasses.length > 0;
    });

    // Process opportunities
    const thisWeekOpportunities = (opportunitiesData || []).filter((opportunity: any) => {
      const opportunityDate = new Date(opportunity.submitted_at);
      return isWithinInterval(opportunityDate, { start: startOfThisWeek, end: endOfThisWeek });
    });
    const lastWeekOpportunities = (opportunitiesData || []).filter((opportunity: any) => {
      const opportunityDate = new Date(opportunity.submitted_at);
      return isWithinInterval(opportunityDate, { start: startOfLastWeek, end: endOfLastWeek });
    });

    // Generate attention needed items
    const weekAgo = subWeeks(new Date(), 1);
    const oldPendingEssays = (essayData || []).filter((essay: EssayRequest) => {
      const essayDate = new Date(essay.submitted_at);
      return essay.status === 'pending' && essayDate < weekAgo;
    });

    const dueThisWeek = (assignmentsData || []).filter((assignment: any) => {
      const dueDate = new Date(assignment.submission_idate);
      return dueDate <= new Date();
    });

    const oldPendingOpportunities = (opportunitiesData || []).filter((opportunity: any) => {
      const opportunityDate = new Date(opportunity.submitted_at);
      return opportunity.status === 'pending' && opportunityDate < weekAgo;
    });

    return {
      essayRequests: thisWeekEssays.slice(0, 5),
      assignments: thisWeekAssignments.slice(0, 5).map((a: any) => ({
        id: a.id,
        title: a.title,
        submission_idate: a.submission_idate.toISOString(),
        workshop_crc_class: a.workshop_crc_class || '',
        workshop_title: a.workshop_title || '',
        workshop_id: a.workshop_id || undefined,
        crc_class_id: a.crc_class_id || undefined,
        crc_class_name: a.crc_class_name || undefined,
      })),
      attendanceRecords: Object.values(attendanceByWorkshop) as AttendanceRecord[],
      attendanceByWorkshop,
      opportunities: thisWeekOpportunities.slice(0, 5),
      workshopsWithoutAttendance,
      essaysNeedingAttention: oldPendingEssays,
      assignmentsNeedingAttention: dueThisWeek.map((a: any) => ({
        id: a.id,
        title: a.title,
        submission_idate: a.submission_idate.toISOString(),
        workshop_crc_class: a.workshop_crc_class || '',
        workshop_title: a.workshop_title || '',
        workshop_id: a.workshop_id || undefined,
        crc_class_id: a.crc_class_id || undefined,
        crc_class_name: a.crc_class_name || undefined,
      })),
      opportunitiesNeedingAttention: oldPendingOpportunities,
      stats: {
        essayRequestsThisWeek: thisWeekEssays.length,
        essayRequestsLastWeek: lastWeekEssays.length,
        assignmentsThisWeek: thisWeekAssignments.length,
        assignmentsLastWeek: lastWeekAssignments.length,
        attendanceTaken: Object.keys(attendanceByWorkshop).length,
        attendanceTakenLastWeek: lastWeekAttendance.length > 0 ? 1 : 0,
        opportunitiesAddedThisWeek: thisWeekOpportunities.length,
        opportunitiesAddedLastWeek: lastWeekOpportunities.length,
        newAnnouncements: 0,
        newAnnouncementsLastWeek: 0,
      }
    };
  }, [essayData, assignmentsData, attendanceRecordsData, workshopsData, opportunitiesData, startOfThisWeek, endOfThisWeek, startOfLastWeek, endOfLastWeek]);

  const {data: profileData} = useSuspenseQuery(trpc.auth.getProfile.queryOptions());
  const adminName = profileData?.first_name + ' ' + profileData?.last_name;

  // Build attention needed items
  const attentionItems: AttentionItem[] = [
    ...processedData.workshopsWithoutAttendance.map((workshop) => {
      const missingClasses = workshop.crc_classes ? workshop.crc_classes.filter((crcClass: any) => {
        const workshopClassKey = `${workshop.title}-${crcClass.name}`;
        const hasAttendance = Object.values(processedData.attendanceByWorkshop || {}).some((record: any) => 
          `${record.workshop_title}-${record.class_name}` === workshopClassKey
        );
        return !hasAttendance;
      }).map((c: any) => c.name) : [];
      
      return {
        id: `workshop-${workshop.id}`,
        title: workshop.title,
        type: 'workshop' as const,
        description: 'Missing attendance',
        missingClasses,
        workshop,
      };
    }),
    ...processedData.essaysNeedingAttention.map((essay) => ({
      id: `essay-${essay.id}`,
      title: essay.title,
      type: 'essay' as const,
      description: 'Essay pending for over a week',
    })),
    ...processedData.opportunitiesNeedingAttention.map((opportunity) => ({
      id: `opportunity-${opportunity.id}`,
      title: opportunity.title,
      type: 'opportunity' as const,
      description: 'Opportunity pending for over a week',
    })),
    ...processedData.assignmentsNeedingAttention.map((assignment) => ({
      id: `assignment-${assignment.id}`,
      title: assignment.title,
      type: 'assignment' as const,
      description: 'Assignment due soon or overdue',
      assignment,
    })),
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader adminName={adminName} />
      
      <AdminStatsCards stats={processedData.stats} loading={false} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AssignmentsSection assignments={processedData.assignments} loading={false} />
        </div>

        <div className="space-y-6">
          <AttentionNeededSection items={attentionItems} loading={false} />
        </div>
      </div>

      <AttendanceOverviewSection records={processedData.attendanceRecords} loading={false} />
    </div>
  );
}

