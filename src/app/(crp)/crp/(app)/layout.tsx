import { getServerContext } from "@/trpc/init";
import type { StudentUser } from "@/trpc/init";
import { CrpTopNav } from "@/components/crp/CrpTopNav";

export default async function CrpAppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getServerContext();
  const student = user as StudentUser | null;
  const initials = [student?.first_name, student?.last_name]
    .filter(Boolean)
    .map((n) => n![0])
    .join("")
    .toUpperCase();

  return (
    <div className="crp-shell">
      <CrpTopNav initials={initials} />
      {children}
    </div>
  );
}
