"use client";

import dynamic from 'next/dynamic';
import { DashboardErrorBoundary } from "@/components/dashboard/admin/DashboardErrorBoundary";

// Dynamically import AttendanceManagementContent to disable SSR
const AttendanceManagementContent = dynamic(
  () => import("@/components/dashboard/admin/attendance-management/AttendanceManagementContent").then(mod => ({ 
    default: mod.AttendanceManagementContent 
  })), 
  {
    ssr: false,
    loading: () => <div>Loading attendance management...</div>
  }
);

export default function AttendancePage() {
  return (
    <DashboardErrorBoundary loadingFallback={<div>Loading attendance management...</div>}>
      <AttendanceManagementContent />
    </DashboardErrorBoundary>
  );
}
