import { BetaAdminSidebar } from "@/components/dashboard/demo/BetaAdminSidebar";
import { BetaAdminBottomNav } from "@/components/dashboard/demo/BetaAdminBottomNav";
import { ToastProvider } from "@/components/dashboard/admin/ToastProvider";
import "../../../../zenith/src/index.css";
import "../../../../zenith/src/App.css";
import "../../../styles/index.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  description: 'Demo | Admin Dashboard',
  icons: {
    icon: "/images/logo/logo.svg",
  },
};

export default function DemoAdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const adminName = "Demo Admin";
  const adminEmail = "demo@example.com";

  return (
    <div
      suppressHydrationWarning={true}
      className="min-h-screen background-blur-2xl transition-colors duration-300 bg-gray-50"
    >
      <div className="flex flex-col min-h-screen">
        <BetaAdminSidebar adminName={adminName} adminEmail={adminEmail} />
        <BetaAdminBottomNav adminName={adminName} adminEmail={adminEmail} />

        <div className="relative z-20 mx-3 mt-3 mb-[calc(env(safe-area-inset-bottom)+88px)] md:mx-6 md:mt-6 md:mb-6 lg:ml-60 lg:mr-6 lg:mt-6 lg:mb-6">
          <div className="backdrop-blur-sm border rounded-2xl shadow-2xl max-w-7xl transition-colors duration-300 bg-white border-gray-200/30">
            {children}
          </div>
        </div>

        <ToastProvider />
      </div>
    </div>
  );
}
