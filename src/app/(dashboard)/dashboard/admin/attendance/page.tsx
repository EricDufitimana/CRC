"use client";

import dynamic from 'next/dynamic';
import { DashboardErrorBoundary } from "@/components/dashboard/admin/DashboardErrorBoundary";
import { AttendanceManagementLoading } from '@/components/dashboard/admin/attendance-management/AttendanceManagementLoading';

// Dynamically import AttendanceManagementContent to disable SSR
const AttendanceManagementContent = dynamic(
  () => import("@/components/dashboard/admin/attendance-management/AttendanceManagementContent").then(mod => ({ 
    default: mod.AttendanceManagementContent 
  })), 
  {
    ssr: false,
    loading: () => <AttendanceManagementLoading />     
  }
);

export default function AttendancePage() {
  return (
    <DashboardErrorBoundary loadingFallback={<AttendanceManagementLoading />}>
      <AttendanceManagementContent />
    </DashboardErrorBoundary>
  );
}
