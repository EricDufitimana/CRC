import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useLocation, useNavigate } from "react-router-dom";
import { Grid2x2, User, FileText, Calendar, Bell, Settings, ChevronLeft, ChevronRight, Target } from "lucide-react";
interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isDarkTheme: boolean;
}
const menuItems = [{
  icon: Grid2x2,
  label: "Dashboard",
  href: "/"
}, {
  icon: Calendar,
  label: "Sessions",
  href: "/sessions"
}, {
  icon: FileText,
  label: "Tasks",
  href: "/tasks"
}, {
  icon: FileText,
  label: "Essays",
  href: "/essays"
}, {
  icon: User,
  label: "Student Management",
  href: "/student-management"
}, {
  icon: Settings,
  label: "Content Management",
  href: "/content-management"
}, {
  icon: Target,
  label: "Opportunity Tracker",
  href: "/opportunity-tracker"
}];
export function DashboardSidebar({
  collapsed,
  onToggle,
  isDarkTheme
}: DashboardSidebarProps) {
  const [hovered, setHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isExpanded = !collapsed || hovered;
  return <div className={cn("transition-all duration-300 flex flex-col border-r", isDarkTheme ? "bg-black border-gray-800" : "bg-white border-gray-200", collapsed ? "w-16" : "w-64", hovered && collapsed && "w-64")} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {/* Welcome section */}
      {isExpanded}
      
      {/* Welcome Back Section */}
      {isExpanded}
      
      {/* Header with toggle */}
      <div className={`p-4 border-b flex items-center justify-between ${isDarkTheme ? 'border-gray-800' : 'border-gray-200'}`}>
        {isExpanded && <h2 className={`font-semibold text-lg animate-fade-in ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
            Menu
          </h2>}
        <Button variant="ghost" size="sm" onClick={onToggle} className={`p-2 ${isDarkTheme ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900'}`}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map(item => {
        const Icon = item.icon;
        if (collapsed && !hovered) {
          return <HoverCard key={item.label}>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" onClick={() => navigate(item.href)} className={cn("w-full justify-center p-3 h-12 transition-all duration-200", isDarkTheme ? "hover:bg-gray-800" : "hover:bg-gray-100", location.pathname === item.href && (isDarkTheme ? "bg-gray-800 border-l-4 border-primary" : "bg-gray-100 border-l-4 border-primary"))}>
                    <Icon className={`h-5 w-5 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`} />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent side="right" className="bg-popover border border-border shadow-lg">
                  <p className="text-sm font-medium">{item.label}</p>
                </HoverCardContent>
              </HoverCard>;
        }
        return <Button key={item.label} variant="ghost" onClick={() => navigate(item.href)} className={cn("w-full justify-start p-3 h-12 transition-all duration-200", isDarkTheme ? "hover:bg-gray-800" : "hover:bg-gray-100", location.pathname === item.href && (isDarkTheme ? "bg-gray-800 border-l-4 border-primary font-medium" : "bg-gray-100 border-l-4 border-primary font-medium"))}>
              <Icon className={`h-5 w-5 mr-3 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`} />
              {isExpanded && <span className={`animate-fade-in ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                  {item.label}
                </span>}
            </Button>;
      })}
      </nav>
    </div>;
}