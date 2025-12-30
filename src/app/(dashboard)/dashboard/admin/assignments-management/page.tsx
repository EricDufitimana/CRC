import { AssignmentsManagementContent } from "@/components/dashboard/assignments-management/AssignmentsManagementContent";
import { AssignmentsManagementLoading } from "@/components/dashboard/assignments-management/AssignmentsManagementLoading";
import { DashboardErrorBoundary } from "@/components/dashboard/DashboardErrorBoundary";
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { getServerContext } from '@/trpc/init';

export default async function AssignmentsManagementPage() {
  const context = await getServerContext();
  
  // Only prefetch if we have a valid authenticated admin user
  if (context.user && context.role === 'admin' && context.user.id) {
    try {
      // Prefetch assignments management queries
      prefetch(trpc.assignmentsManagement.getCrcClasses.queryOptions(undefined));
      prefetch(trpc.assignmentsManagement.getWorkshops.queryOptions({ useCase: 'assignment' }));
      prefetch(trpc.assignmentsManagement.getAssignmentsForManagement.queryOptions(undefined));
    } catch (error) {
      // Silently fail prefetch - data will load on client side
      console.warn('Prefetch failed, will load on client:', error);
    }
  }

  return (
    <HydrateClient>
      <DashboardErrorBoundary loadingFallback={<AssignmentsManagementLoading />}>
        <AssignmentsManagementContent />
      </DashboardErrorBoundary>
    </HydrateClient>
  );
}
