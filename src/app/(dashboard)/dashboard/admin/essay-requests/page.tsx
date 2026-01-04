import { EssayRequestsContent } from "@/components/dashboard/admin/essay-requests/EssayRequestsContent";
import { EssayRequestsLoading } from "@/components/dashboard/admin/essay-requests/EssayRequestsLoading";
import { DashboardErrorBoundary } from "@/components/dashboard/admin/DashboardErrorBoundary";
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { getServerContext } from '@/trpc/init';

export const metadata = {
  title: "Essay Requests | CRC Admin",
  description: "Review and manage student essay submissions.",
};

export default async function EssayRequestsPage() {
  const context = await getServerContext();
  
  if (context.user && context.role === 'admin' && context.user.id) {
    try {
      const adminIdString = context.user.id.toString();
      // Prefetch requests for the current admin
      prefetch(trpc.essayRequestsManagement.getEssayRequests.queryOptions({
        admin_id: adminIdString
      }));
      // Prefetch admins for the refer dialog
      prefetch(trpc.essayRequestsManagement.getAdmins.queryOptions());
      // Prefetch referrals
      prefetch(trpc.essayRequestsManagement.getReferrals.queryOptions({
        admin_id: adminIdString,
        type: "all"
      }));
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  }

  return (
    <HydrateClient>
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
        <DashboardErrorBoundary loadingFallback={<EssayRequestsLoading />}>
          <EssayRequestsContent />
        </DashboardErrorBoundary>
      </div>
    </HydrateClient>
  );
}