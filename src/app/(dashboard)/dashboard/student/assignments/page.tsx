import { StudentAssignmentsContent } from "@/components/dashboard/student/StudentAssignmentsContent";
import { StudentAssignmentsLoading } from "@/components/dashboard/student/StudentAssignmentsLoading";
import { DashboardErrorBoundary } from "@/components/dashboard/admin/DashboardErrorBoundary";
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { getServerContext } from '@/trpc/init';

export const metadata = {
  title: "Assignments | CRC Student",
  description: "View and submit your assignments.",
};

export default async function StudentAssignmentsPage() {
  const context = await getServerContext();

  // Prefetch assignments if authenticated as student
  if (context.user && context.role === 'student') {
    try {
      prefetch(trpc.studentDashboard.getAssignments.queryOptions());
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  }

  return (
    <HydrateClient>
      <div className="h-full bg-neutral-100">
        <DashboardErrorBoundary loadingFallback={<StudentAssignmentsLoading />}>
          <StudentAssignmentsContent />
        </DashboardErrorBoundary>
      </div>
    </HydrateClient>
  );
}

