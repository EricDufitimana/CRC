import { AttendanceManagementContent } from "@/components/dashboard/attendance-management/AttendanceManagementContent";
import { AttendanceManagementLoading } from "@/components/dashboard/attendance-management/AttendanceManagementLoading";
import { DashboardErrorBoundary } from "@/components/dashboard/DashboardErrorBoundary";
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { getServerContext } from '@/trpc/init';

export default async function AttendancePage() {
  const context = await getServerContext();
  
  // Only prefetch if we have a valid authenticated admin user
  if (context.user && context.role === 'admin' && context.user.id) {
    try {
      // Prefetch attendance records
      prefetch(trpc.attendanceManagement.getAttendanceRecords.queryOptions(undefined));
      // Prefetch CRC classes
      prefetch(trpc.crcClassManagement.getCrcClasses.queryOptions(undefined));
      } catch (error) {
      // Silently fail prefetch - data will load on client side
      console.warn('Prefetch failed, will load on client:', error);
    }
  }

    return (
    <HydrateClient>
      <DashboardErrorBoundary loadingFallback={<AttendanceManagementLoading />}>
        <AttendanceManagementContent />
      </DashboardErrorBoundary>
    </HydrateClient>
  );
}
