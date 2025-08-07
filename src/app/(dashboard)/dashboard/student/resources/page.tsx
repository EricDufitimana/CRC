"use client";

import { useState } from "react";
import { StudentSidebar } from "../../../../../components/dashboard/StudentSidebar";
import { DashboardHeader } from "../../../../../components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../zenith/src/components/ui/card";
import { Button } from "../../../../../../zenith/src/components/ui/button";
import { BookOpen, Search, Filter, Download } from "lucide-react";

export default function StudentResources() {
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
            <h1 className="text-4xl font-bold font-cal-sans text-gray-800 mb-3">Learning Resources</h1>
            <p className="text-gray-600">Access study materials, templates, and learning guides</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Available Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Resources coming soon</p>
                    <p className="text-sm">Check back later for learning materials!</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Study Guides
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Templates
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="h-4 w-4 mr-2" />
                    Research Tools
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