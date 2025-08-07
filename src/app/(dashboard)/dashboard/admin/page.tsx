"use client";

import { useState, useEffect } from "react";
import { StudentTable } from "../../../../components/dashboard/StudentTable";
import { StatsCards } from "../../../../components/dashboard/StatsCards";
import { DashboardCalendar } from "../../../../components/dashboard/DashboardCalendar";
import { useUserData } from "@/hooks/useUserData";

export default function DashboardHome() {
  const { userId, adminId, isLoading, error } = useUserData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-4xl font-bold  font-cal-sans text-gray-800 mb-3">
            Welcome back, <span className="font-cal-sans font-bold">Eric</span> 👋
          </div>
          <p className="text-md text-gray-600 ">
            Here's what's happening with your students today
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2/3 - Stats and Student Table */}
          <div className="lg:col-span-2 space-y-8">
            <StatsCards />
            
            <div className="flex-1">
              <StudentTable />
            </div>
          </div>
          
          {/* Right 1/3 - Calendar */}
          <div className="space-y-8">
            <DashboardCalendar />
          </div>
        </div>
      </div>
    </div>
  );
} 