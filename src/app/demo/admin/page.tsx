import { BetaAdminDashboardContent } from "@/components/dashboard/demo/BetaAdminDashboardContent";
import { DashboardErrorBoundary } from "@/components/dashboard/admin/DashboardErrorBoundary";

export const metadata = {
  title: "Demo | Admin Dashboard",
  description: "Demo preview of the admin dashboard.",
};

export default function DemoAdminPage() {
  return (
    <DashboardErrorBoundary>
      <BetaAdminDashboardContent />
    </DashboardErrorBoundary>
  );
}
