"use client";

import { useMemo } from "react";
import { startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { DashboardHeader } from "../admin/DashboardHeader";
import { AdminStatsCards } from "../admin/AdminStatsCards";
import { AssignmentsSection } from "../admin/AssignmentsSection";
import { AttentionNeededSection } from "../admin/AttentionNeededSection";
import { AttendanceOverviewSection } from "../admin/AttendanceOverviewSection";

export function BetaAdminDashboardContent() {
  const adminName = "Demo Admin";

  // Dummy data
  const processedData = useMemo(() => {
    return {
      assignments: [
        {
          id: "1",
          title: "English Essay - Peer Review",
          submission_idate: new Date().toISOString(),
          workshop_title: "English Writing Workshop",
          workshop_crc_class: "Grade 12A",
        },
        {
          id: "2",
          title: "Math Quiz - Final Prep",
          submission_idate: new Date().toISOString(),
          workshop_title: "Math Advanced",
          workshop_crc_class: "Grade 11B",
        }
      ],
      attendanceRecords: [
        {
          id: 1,
          workshop_title: "English Writing Workshop",
          class_name: "Grade 12A",
          present_count: 18,
          total_count: 20,
          date: new Date().toISOString()
        },
        {
          id: 2,
          workshop_title: "Math Advanced",
          class_name: "Grade 11B",
          present_count: 15,
          total_count: 15,
          date: new Date().toISOString()
        }
      ],
      stats: {
        essayRequestsThisWeek: 12,
        essayRequestsLastWeek: 8,
        assignmentsThisWeek: 5,
        assignmentsLastWeek: 4,
        attendanceTaken: 15,
        attendanceTakenLastWeek: 12,
        opportunitiesAddedThisWeek: 3,
        opportunitiesAddedLastWeek: 2,
        newAnnouncements: 2,
        newAnnouncementsLastWeek: 1,
      }
    };
  }, []);

  const attentionItems = [
    {
      id: "workshop-1",
      title: "History Workshop",
      type: "workshop" as const,
      description: "Missing attendance",
      missingClasses: ["Grade 10C"],
    },
    {
      id: "essay-1",
      title: "Common App Essay",
      type: "essay" as const,
      description: "Essay pending for over a week",
    },
    {
      id: "assignment-1",
      title: "Physics Lab Report",
      type: "assignment" as const,
      description: "Assignment due soon or overdue",
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader adminName={adminName} />

      <AdminStatsCards stats={processedData.stats} loading={false} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AssignmentsSection
            assignments={processedData.assignments as any}
            loading={false}
            basePath="/demo/admin"
          />
        </div>

        <div className="space-y-6">
          <AttentionNeededSection
            items={attentionItems as any}
            loading={false}
            basePath="/demo/admin"
          />
        </div>
      </div>

      <AttendanceOverviewSection records={processedData.attendanceRecords as any} loading={false} />
    </div>
  );
}
