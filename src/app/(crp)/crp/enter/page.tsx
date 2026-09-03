import Link from "next/link";
import { getServerContext } from "@/trpc/init";
import type { StudentUser } from "@/trpc/init";

export const metadata = { title: "Choose your space | CRP" };

export default async function ChooseSpacePage() {
  const { user } = await getServerContext();
  const firstName = (user as StudentUser | null)?.first_name ?? "there";

  return (
    <div className="crp-chooser">
      <div className="crp-chooser-inner">
        <h1>Welcome back, {firstName}</h1>
        <p className="lead">Where would you like to go?</p>
        <div className="crp-choices">
          <Link href="/crp" className="crp-choice accent">
            <span className="ic">C</span>
            <span className="t">CRP Workspace</span>
            <span className="d">
              Manage your college list, essay pipeline, deadlines, and recommendations —
              and share progress with your CRC mentor.
            </span>
            <span className="go">Open workspace →</span>
          </Link>
          <Link href="/dashboard/student" className="crp-choice plain">
            <span className="ic">S</span>
            <span className="t">Student Dashboard</span>
            <span className="d">
              Your usual dashboard — workshops, assignments, essays, opportunities, and
              announcements.
            </span>
            <span className="go">Go to dashboard →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
