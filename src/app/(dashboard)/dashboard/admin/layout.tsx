"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "../../../../../zenith/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../../zenith/src/components/ui/avatar";
import { Badge } from "../../../../../zenith/src/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../../zenith/src/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "../../../../../zenith/src/components/ui/command";
import { format } from "date-fns";
import { 
  Search, 
  Bell, 
  Moon, 
  Sun 
} from "lucide-react";
import "../../../../../zenith/src/index.css";
import "../../../../../zenith/src/App.css";
import "../../../../styles/index.css";
import { supabase } from "@/lib/supabase";

const menuItems = [
  { label: "Dashboard", href: "/dashboard/admin" },
  { label: "Students", href: "/dashboard/admin/student-management" },
  { label: "Content", href: "/dashboard/admin/content-management" },
  { label: "Workshops", href: "/dashboard/admin/workshops" },
  { label: "Events", href: "/dashboard/admin/events-management" },
  { label: "Opportunities", href: "/dashboard/admin/opportunity-tracker" },
  { label: "Essays", href: "/dashboard/admin/essay-requests" },
  { label: "Notifications", href: "/dashboard/admin/notifications-management" },
];

export default function DashboardAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering theme-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const currentDate = new Date();
  const dayName = format(currentDate, "EEEE");
  const fullDate = format(currentDate, "MMMM d, yyyy");

  // Mock notifications
  const notifications = [
    { id: 1, message: "New essay submission from Sarah Chen", unread: true },
    { id: 2, message: "GPA report ready for review", unread: true },
    { id: 3, message: "Weekly meeting scheduled for tomorrow", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = async () => {
    try{
      const {error} = await supabase.auth.signOut();
      if(error){
        console.log("Failed To Logout", error)
      }
      router.push('/')
    }catch(error){
      console.log("Failed To Logout", error)
    }
  }

  return (
    <html lang="en" >
      <body suppressHydrationWarning={true} className={mounted && isDarkTheme ? "bg-black" : "bg-gray-50"}>
        <div className={`min-h-screen background-blur-2xl transition-colors duration-300 ${
          mounted && isDarkTheme ? "bg-black" : "bg-gray-50"
        }`}>
          {/* Sidebar as background foundation */}
          <div className={`fixed left-0 top-0 bottom-0 w-60 backdrop-blur-2xl  flex flex-col z-10 transition-colors duration-300 ${
            mounted && isDarkTheme 
              ? "bg-black/90 border-gray-800/30" 
              : "bg-gray-50 border-gray-200/30"
          }`}>
            {/* Navigation */}
            <nav className="flex-1 p-6 space-y-2">
              {menuItems.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Button
                    key={item.label}
                    variant="ghost"
                    onClick={() => router.push(item.href)}
                    className={`w-full h-12 px-4 justify-start text-left transition-all duration-300 rounded-xl group relative ${
                      isActive 
                        ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/25 font-medium hover:text-white' 
                        : mounted && isDarkTheme
                          ? 'hover:bg-gray-800/80 text-gray-300 hover:text-white'
                          : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    {/* Active indicator */}
                   
                    <span className="text-sm font-medium">{item.label}</span>
                  </Button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className={`p-6 space-y-3 border-t transition-colors duration-300 ${
              mounted && isDarkTheme ? 'border-gray-800/30' : 'border-gray-200/30'
            }`}>
              {/* Search */}
              <Button
                variant="ghost"
                onClick={() => setSearchOpen(true)}
                className={`w-full h-12 px-4 justify-start text-left transition-all duration-300 rounded-xl ${
                  mounted && isDarkTheme
                    ? 'hover:bg-gray-800/80 text-gray-300 hover:text-white'
                    : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                }`}
              >
                <Search className="h-4 w-4 mr-3" />
                <span className="text-sm">Search</span>
              </Button>

              {/* Theme Toggle */}
              <Button 
                variant="ghost" 
                onClick={() => setIsDarkTheme(!isDarkTheme)}
                className={`w-full h-12 px-4 justify-start text-left transition-all duration-300 rounded-xl ${
                  mounted && isDarkTheme
                    ? 'hover:bg-gray-800/80 text-gray-300 hover:text-white'
                    : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                }`}
              >
                {isDarkTheme ? <Sun className="h-4 w-4 mr-3" /> : <Moon className="h-4 w-4 mr-3" />}
                <span className="text-sm">Theme</span>
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={`w-full h-12 px-4 justify-start text-left transition-all duration-300 rounded-xl relative ${
                      mounted && isDarkTheme
                        ? 'hover:bg-gray-800/80 text-gray-300 hover:text-white'
                        : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <Bell className="h-4 w-4 mr-3" />
                    <span className="text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <Badge 
                        className="absolute top-2 right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="py-3">
                      <div className="flex items-start gap-2">
                        {notification.unread && (
                          <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                        )}
                        <span className={notification.unread ? "font-medium" : ""}>
                          {notification.message}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))} </DropdownMenuContent>
              </DropdownMenu>

              {/* User Avatar */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={`w-full h-12 px-4 justify-start text-left transition-all duration-300 rounded-xl ${
                      mounted && isDarkTheme
                        ? 'hover:bg-gray-800/80 text-gray-300 hover:text-white'
                        : 'hover:bg-gray-100/80 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <Avatar className="h-6 w-6 mr-3">
                      <AvatarImage src="/api/placeholder/32/32" alt="Admin" />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-xs">
                        EC
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">Eric Chen</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Eric Chen</DropdownMenuLabel>
                  <DropdownMenuLabel className="font-normal text-muted-foreground">
                    admin@school.edu
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Main content floating above sidebar */}
          <div className="relative z-20 ml-60 mr-6 mt-6 mb-6">
            <div className="bg-white backdrop-blur-sm border border-gray-200/30 rounded-2xl shadow-2xl max-w-7xl">
              {children}
            </div>
          </div>

          {/* Command Dialog for Search */}
          <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
            <CommandInput placeholder="Search students, essays, or settings..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Quick Actions">
                <CommandItem>
                  <span>Dashboard</span>
                </CommandItem>
                <CommandItem>
                  <span>Students</span>
                </CommandItem>
                <CommandItem>
                  <span>Essays</span>
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="Students">
                <CommandItem>
                  <span>Sarah Chen - Computer Science</span>
                </CommandItem>
                <CommandItem>
                  <span>Michael Johnson - Mathematics</span>
                </CommandItem>
                <CommandItem>
                  <span>Emily Davis - English Literature</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandDialog>
        </div>
      </body>
    </html>
  );
} 