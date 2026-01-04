import { StudentDocumentsContent } from "@/components/dashboard/student/StudentDocumentsContent";
import { StudentDocumentsLoading } from "@/components/dashboard/student/StudentDocumentsLoading";
import { DashboardErrorBoundary } from "@/components/dashboard/admin/DashboardErrorBoundary";
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { getServerContext } from '@/trpc/init';

export const metadata = {
  title: "Documents | CRC Student",
  description: "Manage your academic documents and resume.",
};

export default async function StudentDocumentsPage() {
  const context = await getServerContext();

  // Prefetch documents if authenticated as student
  if (context.user && context.role === 'student') {
    try {
      prefetch(trpc.studentDashboard.getDocuments.queryOptions());
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  }

  return (
    <HydrateClient>
      <div className="h-full bg-neutral-100">
        <DashboardErrorBoundary loadingFallback={<StudentDocumentsLoading />}>
          <StudentDocumentsContent />
        </DashboardErrorBoundary>
      </div>
    </HydrateClient>
  );
}
