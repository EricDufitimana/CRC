import { StudentDashboardContent } from "@/components/dashboard/student/StudentDashboardContent";
import { StudentDashboardLoading } from "@/components/dashboard/student/StudentDashboardLoading";
import { DashboardErrorBoundary } from "@/components/dashboard/admin/DashboardErrorBoundary";
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { getServerContext } from '@/trpc/init';
import { Suspense } from 'react';

export const metadata = {
  title: "Dashboard | CRC Student",
  description: "Student dashboard for CRC.",
};

export default async function StudentDashboard() {
  const context = await getServerContext();

  // Only prefetch if we have a valid authenticated student user
  if (context.user && context.role === 'student' && context.user.id) {
    try {
      // Prefetch all student dashboard queries for instant page load
      prefetch(trpc.studentDashboard.getDashboardStats.queryOptions());
      prefetch(trpc.studentDashboard.getLatestAssignments.queryOptions({ limit: 5 }));
      prefetch(trpc.studentDashboard.getAnnouncements.queryOptions());
      prefetch(trpc.studentDashboard.getRecentResources.queryOptions());
      prefetch(trpc.studentDashboard.getFellows.queryOptions());
      prefetch(trpc.studentDashboard.getAvailableWorkshops.queryOptions());
    } catch (error) {
      // Silently fail prefetch - data will load on client side
      console.warn('Prefetch failed, will load on client:', error);
    }
  }

  return (
    <HydrateClient>
      <div className="h-full bg-neutral-100">
        <DashboardErrorBoundary loadingFallback={<StudentDashboardLoading />}>
          <Suspense fallback={<StudentDashboardLoading />}>
            <StudentDashboardContent />
          </Suspense>
        </DashboardErrorBoundary>
      </div>
    </HydrateClient>
  );
}
