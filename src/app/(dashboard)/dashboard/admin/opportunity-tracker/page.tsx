import { OpportunityTrackerContent } from "@/components/dashboard/admin/opportunity-tracker/OpportunityTrackerContent";
import { OpportunityTrackerLoading } from "@/components/dashboard/admin/opportunity-tracker/OpportunityTrackerLoading";
import { DashboardErrorBoundary } from "@/components/dashboard/admin/DashboardErrorBoundary";
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { getServerContext } from '@/trpc/init';

export const metadata = {
  title: "Opportunity Tracker | CRC Admin",
  description: "Monitor and manage student engagement with external opportunities.",
};

export default async function OpportunityTrackerPage() {
  const context = await getServerContext();

  if (context.user && context.role === 'admin' && context.user.id) {
    try {
      // Prefetch opportunity requests for the current admin
      prefetch(trpc.opportunityRequestsManagement.getOpportunityRequests.queryOptions({
        admin_id: context.user.id.toString()
      }));
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  }

  return (
    <HydrateClient>
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
        <DashboardErrorBoundary loadingFallback={<OpportunityTrackerLoading />}>
          <OpportunityTrackerContent />
        </DashboardErrorBoundary>
      </div>
    </HydrateClient>
  );
}