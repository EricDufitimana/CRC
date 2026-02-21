import { BetaStudentSidebar } from "@/components/dashboard/demo/BetaStudentSidebar";
import { BetaStudentBottomNav, BetaStudentBottomNavTablet } from "@/components/dashboard/demo/BetaStudentBottomNav";
import { ToastProvider } from "@/components/dashboard/admin/ToastProvider";
import "../../../../zenith/src/index.css";
import "../../../../zenith/src/App.css";
import "../../../styles/index.css";

export default function DemoStudentLayout({
  children
}: {
  children: React.ReactNode
}) {
  const studentName = "Alex Johnson";
  const studentEmail = "alex.johnson@example.com";

  return (
    <div
      suppressHydrationWarning={true}
      className="min-h-screen bg-neutral-100"
    >
      <BetaStudentBottomNav />
      <BetaStudentBottomNavTablet />

      <div className="mx-auto max-w-[1400px] px-2 py-0 md:py-0">
        <div className="flex gap-4 h-[99vh] py-4">
          <BetaStudentSidebar studentName={studentName} studentEmail={studentEmail} />

          <main className="flex-1 h-full overflow-hidden m-0.5 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>

      <ToastProvider />
    </div>
  );
}
