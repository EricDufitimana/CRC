import { StudentManagementContent } from "@/components/dashboard/student-management/StudentManagementContent";
import { StudentManagementLoading } from "@/components/dashboard/student-management/StudentManagementLoading";
import { DashboardErrorBoundary } from "@/components/dashboard/DashboardErrorBoundary";
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { getServerContext } from '@/trpc/init';

export default async function StudentManagementPage() {
  const context = await getServerContext();
  
  // Only prefetch if we have a valid authenticated admin user
  if (context.user && context.role === 'admin' && context.user.id) {
    try {
      // Prefetch student management queries
      prefetch(trpc.studentManagement.getStudents.queryOptions(undefined));
      prefetch(trpc.studentManagement.getCrcClasses.queryOptions(undefined));
    } catch (error) {
      // Silently fail prefetch - data will load on client side
      console.warn('Prefetch failed, will load on client:', error);
    }
  }

  return (
    <HydrateClient>
      <DashboardErrorBoundary loadingFallback={<StudentManagementLoading />}>
        <StudentManagementContent />
      </DashboardErrorBoundary>
    </HydrateClient>
  );
}
