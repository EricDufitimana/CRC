"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "../../../zenith/src/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../../zenith/src/components/ui/hover-card";

import { 
  Grid2x2, 
  Calendar, 
  FileText, 
  BookOpen, 
  Target, 
  User, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  GraduationCap,
  Briefcase,
  TrendingUp
} from "lucide-react";

interface StudentSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isDarkTheme: boolean;
}

const studentMenuItems = [
  { icon: Grid2x2, label: "Dashboard", href: "/dashboard/student" },
  { icon: Calendar, label: "My Sessions", href: "/dashboard/student/sessions" },
  { icon: FileText, label: "My Essays", href: "/dashboard/student/essays" },
  { icon: BookOpen, label: "Resources", href: "/dashboard/student/resources" },
  { icon: TrendingUp, label: "Progress Tracker", href: "/dashboard/student/progress" },
  { icon: Briefcase, label: "Opportunities", href: "/dashboard/student/opportunities" },
  { icon: User, label: "Profile", href: "/dashboard/student/profile" },
];

export function StudentSidebar({ collapsed, onToggle, isDarkTheme }: StudentSidebarProps) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isExpanded = !collapsed || hovered;

  return (
    <div
      className={`transition-all duration-300 flex flex-col border-r ${
        isDarkTheme ? "bg-black border-gray-800" : "bg-white border-gray-200"
      } ${collapsed ? "w-16" : "w-64"} ${hovered && collapsed ? "w-64" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header with toggle */}
      <div className={`p-4 border-b flex items-center justify-between ${
        isDarkTheme ? 'border-gray-800' : 'border-gray-200'
      }`}>
        {isExpanded && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <h2 className={`font-semibold text-lg animate-fade-in ${
              isDarkTheme ? 'text-white' : 'text-gray-900'
            }`}>
              Student
            </h2>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggle} 
          className={`p-2 ${
            isDarkTheme ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900'
          }`}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {studentMenuItems.map(item => {
          const Icon = item.icon;
          if (collapsed && !hovered) {
            return (
              <HoverCard key={item.label}>
                <HoverCardTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() => router.push(item.href)}
                    className={`w-full justify-center p-3 h-12 transition-all duration-200 ${
                      isDarkTheme ? "hover:bg-gray-800" : "hover:bg-gray-100"
                    } ${
                      pathname === item.href && (
                        isDarkTheme ? "bg-gray-800" : "bg-gray-100"
                      )
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${
                      isDarkTheme ? 'text-white' : 'text-gray-900'
                    }`} />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent side="right" className="bg-popover border border-border shadow-lg">
                  <p className="text-sm font-medium">{item.label}</p>
                </HoverCardContent>
              </HoverCard>
            );
          }
          return (
            <Button
              key={item.label}
              variant="ghost"
              onClick={() => router.push(item.href)}
              className={`w-full justify-start p-3 h-12 transition-all duration-200 ${
                isDarkTheme ? "hover:bg-gray-800" : "hover:bg-gray-100"
              } ${
                pathname === item.href && (
                  isDarkTheme ? "bg-gray-800 font-medium" : "bg-gray-100 font-medium"
                )
              }`}
            >
              <Icon className={`h-5 w-5 mr-3 ${
                isDarkTheme ? 'text-white' : 'text-gray-900'
              }`} />
              {isExpanded && (
                <span className={`animate-fade-in ${
                  isDarkTheme ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.label}
                </span>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Student Status */}
      {isExpanded && (
        <div className={`p-4 border-t ${
          isDarkTheme ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className={`text-sm ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Active Student
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 