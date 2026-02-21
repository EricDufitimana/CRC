import type { Metadata } from "next";
import "../../styles/index.css";
import { Suspense } from "react";
import PreLoader from "@/components/Common/PreLoader";

export const metadata: Metadata = {
  description: 'Career Resources Center Dashboard',
  icons: {
    icon: "/images/logo/logo.svg",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div suppressHydrationWarning={true}>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <PreLoader />
        </div>
      }>
        {children}
      </Suspense>
    </div>
  )
}
