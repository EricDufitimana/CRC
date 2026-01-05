"use client";

import dynamic from 'next/dynamic';
import { DashboardErrorBoundary } from "@/components/dashboard/admin/DashboardErrorBoundary";
import {CrcClassManagementLoading} from "@/components/dashboard/admin/crc-class-management/CrcClassManagementLoading";

// Dynamically import CrcClassManagementContent to disable SSR
const CrcClassManagementContent = dynamic(
  () => import("@/components/dashboard/admin/crc-class-management/CrcClassManagementContent").then(mod => ({ 
    default: mod.CrcClassManagementContent 
  })), 
  {
    ssr: false,
    loading: () => <CrcClassManagementLoading/>
  }
);

export default function CrcClassGroupsPage() {
  return (
    <DashboardErrorBoundary loadingFallback={<CrcClassManagementLoading />}>
      <CrcClassManagementContent />
    </DashboardErrorBoundary>
  );
}
