import { StudentManagementContent } from "@/components/dashboard/admin/student-management/StudentManagementContent";
import { StudentManagementLoading } from "@/components/dashboard/admin/student-management/StudentManagementLoading";
import { DashboardErrorBoundary } from "@/components/dashboard/admin/DashboardErrorBoundary";
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { getServerContext } from '@/trpc/init';
import { Suspense } from 'react';

export default async function StudentManagementPage() {
  const context = await getServerContext();
  
  // Get admin email for Gmail authuser parameter
  const adminEmail = context.role === 'admin' && context.user 
    ? (context.user as { email: string | null }).email 
    : null;
  
  // Only prefetch if we have a valid authenticated admin user
  if (context.user && context.role === 'admin' && context.user.id) {
    try {
      // Prefetch student management queries
      prefetch(trpc.studentManagement.getStudents.queryOptions(undefined));
      prefetch(trpc.studentManagement.getCrcClasses.queryOptions(undefined));
    } catch (error) {
      // Silently fail prefetch - data will load on client
      console.warn('Prefetch failed, will load on client:', error);
    }
  }

  return (
    <HydrateClient>
      <DashboardErrorBoundary loadingFallback={<StudentManagementLoading />}>
        <Suspense fallback={<StudentManagementLoading />}>
          <StudentManagementContent adminEmail={adminEmail} />
        </Suspense>
      </DashboardErrorBoundary>
    </HydrateClient>
  );
}
