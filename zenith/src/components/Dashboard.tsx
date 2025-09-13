import { useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { StudentTable } from "./StudentTable";
import { StatsCards } from "./StatsCards";
import { TasksList } from "./TasksList";
import { DashboardCalendar } from "./DashboardCalendar";
export function Dashboard({ children }: { children?: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  return <div className="min-h-screen bg-background flex w-full">
      <DashboardSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isDarkTheme={isDarkTheme}
      />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader 
          isDarkTheme={isDarkTheme}
          onThemeToggle={() => setIsDarkTheme(!isDarkTheme)}
        />
        
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full rounded-tl-md relative bg-gray-50">
          {children ? children : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2/3 - Stats and Student Table */}
              <div className="lg:col-span-2 space-y-6 flex flex-col">
                
                 <div className="mb-6 rounded-tl-md">
                   <div className="text-3xl font-bold text-foreground mb-2">
                     Welcome back, Eric 👋
                   </div>
                  <p className="text-sm text-muted-foreground">
                    Here's what's happening with your students today
                  </p>
                </div>
                
                <StatsCards />
                
                <div className="flex-1">
                  <StudentTable />
                </div>
              </div>
              
              {/* Right 1/3 - Tasks and Calendar */}
              <div className="space-y-6">
                <TasksList />
                <DashboardCalendar />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>;
}