import { getServerContext } from "@/trpc/init";
import type { StudentUser } from "@/trpc/init";
import { CrpDashboardHome } from "@/components/crp/CrpDashboardHome";

export default async function CrpDashboardPage() {
  const { user } = await getServerContext();
  const firstName = (user as StudentUser | null)?.first_name ?? "there";
  return <CrpDashboardHome firstName={firstName} />;
}
