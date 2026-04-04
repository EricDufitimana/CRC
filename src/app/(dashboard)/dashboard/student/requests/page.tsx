import { StudentRequestsContent } from "@/components/dashboard/student/StudentRequestsContent";
import { StudentRequestsLoading } from "@/components/dashboard/student/StudentRequestsLoading";
import { DashboardErrorBoundary } from "@/components/dashboard/admin/DashboardErrorBoundary";
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { getServerContext } from '@/trpc/init';
import { Suspense } from 'react';

export const metadata = {
  title: "Requests | CRC Student",
  description: "View and submit your essay and opportunity requests.",
};

export default async function StudentRequestsPage() {
  const context = await getServerContext();

  // Prefetch requests if authenticated as student
  if (context.user && context.role === 'student') {
    try {
      prefetch(trpc.studentDashboard.getOpportunities.queryOptions());
      prefetch(trpc.studentDashboard.getEssays.queryOptions());
      prefetch(trpc.studentDashboard.getFellows.queryOptions());
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  }

  return (
    <HydrateClient>
      <div className="h-full bg-neutral-100">
        <DashboardErrorBoundary loadingFallback={<StudentRequestsLoading />}>
          <Suspense fallback={<StudentRequestsLoading />}>
            <StudentRequestsContent />
          </Suspense>
        </DashboardErrorBoundary>
      </div>
    </HydrateClient>
  );
}
