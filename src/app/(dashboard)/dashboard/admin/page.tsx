"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "../../../../components/dashboard/DashboardHeader";
import { DashboardSidebar } from "../../../../components/dashboard/DashboardSidebar";
import { StudentTable } from "../../../../components/dashboard/StudentTable";
import { StatsCards } from "../../../../components/dashboard/StatsCards";
import { DashboardCalendar } from "../../../../components/dashboard/DashboardCalendar";
import { useUserData } from "@/hooks/useUserData";

export default function DashboardHome() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const { userId, adminId, isLoading, error } = useUserData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dashboard-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-dashboard-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dashboard-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  console.log(adminId)

  return (
    <div className="min-h-screen bg-dashboard-background flex w-full">
      <DashboardSidebar 
        isDarkTheme={isDarkTheme}
      />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader 
          isDarkTheme={isDarkTheme}
          onThemeToggle={() => setIsDarkTheme(!isDarkTheme)}
        />
        
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full bg-dashboard-card">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2/3 - Stats and Student Table */}
            <div className="lg:col-span-2 space-y-6 flex flex-col">
              <div className="mb-6">
                <div className="text-3xl font-bold text-dashboard-foreground mb-2">
                  Welcome back, Eric 👋
                </div>
                <p className="text-sm text-dashboard-muted-foreground">
                  Here's what's happening with your students today
                </p>
              </div>
              
              <StatsCards />
              
              <div className="flex-1">
                <StudentTable />
              </div>
            </div>
            
            {/* Right 1/3 - Calendar */}
            <div className="space-y-6">
              <DashboardCalendar />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 