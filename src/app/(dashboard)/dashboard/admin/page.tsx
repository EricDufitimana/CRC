import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { DashboardErrorBoundary } from "@/components/dashboard/DashboardErrorBoundary";
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { getServerContext } from '@/trpc/init';

export default async function DashboardHome() {
  const context = await getServerContext();
  
  // Only prefetch if we have a valid authenticated admin user
  if (context.user && context.role === 'admin' && context.user.id) {
    const adminId = context.user.id.toString();
    
    // Only prefetch if adminId is a valid non-empty string
    if (adminId && adminId !== '0' && adminId !== '') {
      try {
        // Prefetch queries - adminId is now obtained from context
        prefetch(trpc.dashboardAdmin.getAssignments.queryOptions(undefined));
        prefetch(trpc.dashboardAdmin.getAttendanceRecords.queryOptions(undefined));
        prefetch(trpc.dashboardAdmin.getWorkshops.queryOptions(undefined));
        prefetch(trpc.dashboardAdmin.getEssayRequests.queryOptions(undefined));
        prefetch(trpc.dashboardAdmin.getOpportunities.queryOptions(undefined));
        prefetch(trpc.auth.getProfile.queryOptions());
      } catch (error) {
        // Silently fail prefetch - data will load on client side
        // This can happen if cookies aren't available during prefetch execution
        console.warn('Prefetch failed, will load on client:', error);
      }
    }
  }

  return (
    <HydrateClient>
      <DashboardErrorBoundary>
        <DashboardContent />
      </DashboardErrorBoundary>
    </HydrateClient>
  );
}
