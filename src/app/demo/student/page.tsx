import { BetaStudentDashboardContent } from "@/components/dashboard/demo/BetaStudentDashboardContent";
import { DashboardErrorBoundary } from "@/components/dashboard/admin/DashboardErrorBoundary";
import { StudentDashboardLoading } from "@/components/dashboard/student/StudentDashboardLoading";

export const metadata = {
  title: "Demo | Student Dashboard",
  description: "Demo preview of the student dashboard.",
};

export default function DemoStudentPage() {
  return (
    <div className="h-full bg-white">
      <DashboardErrorBoundary loadingFallback={<StudentDashboardLoading />}>
        <BetaStudentDashboardContent />
      </DashboardErrorBoundary>
    </div>
  );
}
