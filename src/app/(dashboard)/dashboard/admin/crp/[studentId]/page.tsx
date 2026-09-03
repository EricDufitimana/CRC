import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { getServerContext } from "@/trpc/init";
import { CrpStudentDetailContent } from "@/components/crp/CrpStudentDetailContent";

export default async function AdminCrpStudentPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const context = await getServerContext();
  if (context.role === "admin") {
    try {
      prefetch(trpc.crpAdmin.getStudentDetail.queryOptions({ studentId }));
    } catch {
      /* falls back to client fetch */
    }
  }
  return (
    <HydrateClient>
      <CrpStudentDetailContent studentId={studentId} />
    </HydrateClient>
  );
}
