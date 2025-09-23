"use client";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import StudentSidebar from "@/components/dashboard/StudentSidebar";
import Head from "../../../(site)/head";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function AspenLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const[title, setTitle] = useState("Loading...");
  const getTitle = () => {
    if (pathname?.includes("assignments")) setTitle("Assignments - Student Dashboard")
    else if (pathname?.includes("documents")) setTitle("Documents - Student Dashboard")
    else if (pathname?.includes("requests")) setTitle("Requests - Student Dashboard")
    else setTitle("Student Dashboard - Career Resources Center")
  }

  return (
    <>
      {Head(title)}
      <div className="min-h-screen bg-neutral-100">
      <div className="mx-auto max-w-[1400px] px-2 py-0 md:py-0 bg-neutral-100">
        <div className="flex gap-4 h-[99vh] py-4 bg-neutral-100">
          {/* Sidebar */}
          <StudentSidebar />

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
    </>
  );
}