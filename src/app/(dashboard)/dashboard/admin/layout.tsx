import Head from "../../../(site)/head";
import { AdminSidebar } from "@/components/dashboard/admin/AdminSidebar";
import { AdminBottomNav } from "@/components/dashboard/admin/AdminBottomNav";
import { ToastProvider } from "@/components/dashboard/admin/ToastProvider";
import { getServerContext } from "@/trpc/init";
import "../../../../../zenith/src/index.css";
import "../../../../../zenith/src/App.css";
import "../../../../styles/index.css";
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

function getTitle(pathname: string | null) {
  if (pathname?.includes("student-management")) return "Student Management | Admin Dashboard"
  else if (pathname?.includes("assignments-management")) return "Assignments Management | Admin Dashboard"
  else if (pathname?.includes("announcements-management")) return "Announcements Management | Admin Dashboard"
  else if (pathname?.includes("events-management")) return "Events Management | Admin Dashboard"
  else if (pathname?.includes("content-management")) return "Content Management | Admin Dashboard"
  else if (pathname?.includes("workshops")) return "Workshops | Admin Dashboard"
  else if (pathname?.includes("attendance")) return "Attendance | Admin Dashboard"
  else if (pathname?.includes("crc-class-groups")) return "CRC Class Groups | Admin Dashboard"
  else if (pathname?.includes("testing")) return "Testing | Admin Dashboard"
  else return "Admin Dashboard | Career Resources Center"
}

export const dynamic = 'force-dynamic';


async function getAdminProfile() {
  const context = await getServerContext();

  if (!context.user || context.role !== 'admin') {
    return {
      adminName: 'Admin',
      adminEmail: 'admin@school.edu'
    };
  }

  // Use context data directly since we already have the admin user
  // Type assertion is safe because we checked role === 'admin'
  const adminUser = context.user as { honorific: string | null; first_name: string; last_name: string; email: string | null };
  const fullName = [
    adminUser.honorific,
    adminUser.first_name,
    adminUser.last_name
  ]
    .filter(Boolean)
    .join(' ');

  return {
    adminName: fullName || 'Admin',
    adminEmail: adminUser.email || 'admin@school.edu'
  };
}

export default async function DashboardAdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { adminName, adminEmail } = await getAdminProfile();

  return (
    <>
      {Head(getTitle(null))}
      <div
        suppressHydrationWarning={true}
        className="min-h-screen background-blur-2xl transition-colors duration-300 bg-gray-50"
      >
        <div className="flex flex-col min-h-screen">

          {/* Sidebar as background foundation */}
          <AdminSidebar adminName={adminName} adminEmail={adminEmail} />

          {/* Bottom navigation for tablet + phone */}
          <AdminBottomNav adminName={adminName} adminEmail={adminEmail} />

          {/* Main content floating above sidebar */}
          <div className="relative z-20 mx-3 mt-3 mb-[calc(env(safe-area-inset-bottom)+88px)] md:mx-6 md:mt-6 md:mb-6 lg:ml-60 lg:mr-6 lg:mt-6 lg:mb-6">
            <div className="backdrop-blur-sm border rounded-2xl shadow-2xl max-w-7xl transition-colors duration-300 bg-white border-gray-200/30">
              {children}
            </div>
          </div>

          {/* Global Toast Container - Top Right */}
          <ToastProvider />
        </div>
      </div>
    </>
  );
} 
