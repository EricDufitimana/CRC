"use client";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "../../../zenith/src/components/ui/button";

import { Grid2x2, User, FileText, Calendar, Bell, Settings, Target } from "lucide-react";

interface DashboardSidebarProps {
  isDarkTheme: boolean;
}
const menuItems = [
  { icon: Grid2x2, label: "Dashboard", href: "/dashboard/admin" },
  { icon: FileText, label: "Essays", href: "/dashboard/admin/essay-requests" },
  { icon: User, label: "Student Management", href: "/dashboard/admin/student-management" },
  { icon: Settings, label: "Content Management", href: "/dashboard/admin/content-management" },
  { icon: Target, label: "Opportunity Tracker", href: "/dashboard/admin/opportunity-tracker" },
];
export function DashboardSidebar({ isDarkTheme }: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <div
      className={`transition-all duration-300 flex flex-col border-r ${isDarkTheme ? "bg-black border-gray-800" : "bg-white border-gray-200"} w-16 min-[1360px]:w-64`}
    >
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between ${isDarkTheme ? 'border-gray-800' : 'border-gray-200'}`}>
        <h2 className={`font-semibold text-lg hidden min-[1360px]:block ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Menu</h2>
      </div>
      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <Button
              key={item.label}
              variant="ghost"
              onClick={() => router.push(item.href)}
              className={`w-full justify-center min-[1360px]:justify-start p-3 h-12 transition-all duration-200 ${isDarkTheme ? "hover:bg-gray-800" : "hover:bg-gray-100"} ${pathname === item.href && (isDarkTheme ? "bg-gray-800 font-medium" : "bg-gray-100 font-medium")}`}
            >
              <Icon className={`h-5 w-5 min-[1360px]:mr-3 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`} />
              <span className={`hidden min-[1360px]:block ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{item.label}</span>
            </Button>
          );
        })}
      </nav>
    </div>
  );
} 