"use client";

import { useState } from "react";
import { StudentSidebar } from "../../../../../components/dashboard/StudentSidebar";
import { DashboardHeader } from "../../../../../components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../zenith/src/components/ui/card";
import { Button } from "../../../../../../zenith/src/components/ui/button";
import { Badge } from "../../../../../../zenith/src/components/ui/badge";
import { Calendar, Clock, User, Video, MapPin } from "lucide-react";

export default function StudentSessions() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex w-full">
      <StudentSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isDarkTheme={isDarkTheme}
      />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader 
          isDarkTheme={isDarkTheme}
          onThemeToggle={() => setIsDarkTheme(!isDarkTheme)}
        />
        
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Sessions</h1>
            <p className="text-gray-600">Manage your academic sessions and book new ones</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Upcoming Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No upcoming sessions</p>
                    <p className="text-sm">Book your first session to get started!</p>
                    <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                      Book a Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Book New Session
                  </Button>
                  <Button variant="outline" className="w-full">
                    View Past Sessions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 