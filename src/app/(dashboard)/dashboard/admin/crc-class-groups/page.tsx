"use client";

import dynamic from 'next/dynamic';
import { DashboardErrorBoundary } from "@/components/dashboard/admin/DashboardErrorBoundary";

// Dynamically import CrcClassManagementContent to disable SSR
const CrcClassManagementContent = dynamic(
  () => import("@/components/dashboard/admin/crc-class-management/CrcClassManagementContent").then(mod => ({ 
    default: mod.CrcClassManagementContent 
  })), 
  {
    ssr: false,
    loading: () => <div>Loading class management...</div>
  }
);

export default function CrcClassGroupsPage() {
  return (
    <DashboardErrorBoundary loadingFallback={<div>Loading class management...</div>}>
      <CrcClassManagementContent />
    </DashboardErrorBoundary>
  );
}
