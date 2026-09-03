import { redirect } from "next/navigation";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { getServerContext } from "@/trpc/init";
import { prisma } from "@/lib/prisma";
import type { StudentUser } from "@/trpc/init";
import "@/components/crp/crp.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-bricolage",
});

export const metadata = {
  title: "CRP Workspace",
  description: "College Readiness Program — track your college applications.",
};

export default async function CrpLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await getServerContext();

  // Only signed-in students can be in CRP.
  if (!user || role !== "student") {
    redirect("/dashboard");
  }

  const student = user as StudentUser;
  let participant = null;
  try {
    participant = await prisma.crp_participants.findFirst({
      where: { student_id: student.id, active: true },
      select: { id: true },
    });
  } catch {
    // Table may not exist yet (migration not applied).
    participant = null;
  }

  // Not appointed → back to the normal student dashboard.
  if (!participant) {
    redirect("/dashboard/student");
  }

  return (
    <div className={`${geist.variable} ${geistMono.variable} ${bricolage.variable} crp-root`}>
      {children}
    </div>
  );
}
