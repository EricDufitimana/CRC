"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "../../../../../zenith/src/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardNotFound() {
  const pathname = usePathname();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      pathname
    );
  }, [pathname]);

  return (
    <div className="min-h-screen bg-dashboard-background flex w-full">
      <DashboardSidebar 
        isDarkTheme={true} 
      />
      <div className="flex-1 flex flex-col">
        <DashboardHeader isDarkTheme={true} onThemeToggle={() => {}} />
        <main className="flex-1 flex items-center justify-center bg-dashboard-card">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-dashboard-foreground">404</h1>
            <p className="text-xl text-dashboard-muted-foreground mb-4">Oops! Page not found</p>
            <Button asChild>
              <a href="/dashboard/admin">Return to Dashboard</a>
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
} 