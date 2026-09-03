import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { getServerContext } from "@/trpc/init";
import { CrpReviewQueueContent } from "@/components/crp/CrpReviewQueueContent";

export default async function AdminCrpReviewPage() {
  const context = await getServerContext();
  if (context.role === "admin") {
    try {
      prefetch(trpc.crpAdmin.getReviewQueue.queryOptions());
    } catch {
      /* falls back to client fetch */
    }
  }
  return (
    <HydrateClient>
      <CrpReviewQueueContent />
    </HydrateClient>
  );
}
