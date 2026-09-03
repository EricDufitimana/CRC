import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { getServerContext } from "@/trpc/init";
import { CrpCohortContent } from "@/components/crp/CrpCohortContent";

export default async function AdminCrpPage() {
  const context = await getServerContext();
  if (context.role === "admin") {
    try {
      prefetch(trpc.crpAdmin.getCohortOverview.queryOptions());
      prefetch(trpc.crpAdmin.getReviewQueue.queryOptions());
    } catch {
      /* falls back to client fetch */
    }
  }
  return (
    <HydrateClient>
      <CrpCohortContent />
    </HydrateClient>
  );
}
