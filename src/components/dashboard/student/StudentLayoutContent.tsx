"use client";

import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import StudentSidebar from "@/components/dashboard/student/StudentSidebar";
import { usePathname } from "next/navigation";
import StudentSidebarWrapper from "@/components/dashboard/student/studentSidebarWrapper"
import { StudentBottomNav, StudentBottomNavTablet } from "@/components/dashboard/student/StudentBottomNav";

interface StudentLayoutContentProps {
  children: ReactNode;
}

export function StudentLayoutContent({ children }: StudentLayoutContentProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-neutral-100">
      <StudentBottomNav />
      <StudentBottomNavTablet />

      <div className="mx-auto max-w-[1400px] px-2 py-0 md:py-0 bg-neutral-100">
        <div className="flex gap-4 h-[99vh] py-4 bg-neutral-100">
          {/* Sidebar */}
          <StudentSidebarWrapper />

          {/* Main */}
          <main className="flex-1 h-full overflow-hidden m-0.5">
            {children}
          </main>
        </div>
      </div>

      {/* Global Toast Container */}
      <Toaster
        position="top-right"
        containerStyle={{
          marginTop: "20px",
          marginRight: "20px",
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: 'transparent',
            padding: 0,
            margin: 0,
            boxShadow: 'none',
          },
        }}
      />
    </div>
  );
}
