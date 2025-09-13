import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "./ui/command";
import { Search, Bell, User, Grid2x2, FileText, Moon, Sun } from "lucide-react";

interface DashboardHeaderProps {
  isDarkTheme: boolean;
  onThemeToggle: () => void;
}

export function DashboardHeader({ isDarkTheme, onThemeToggle }: DashboardHeaderProps) {
  const [open, setOpen] = useState(false);
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

  return (
    <>
      <header className={`border-b px-6 py-4 ${isDarkTheme ? 'border-gray-800 bg-black' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center justify-between">
          {/* Left side - Welcome message and search */}
          <div className="flex items-center gap-6 min-w-0 flex-1">
            <div className="min-w-0">
              <h1 className={`text-xl font-semibold whitespace-nowrap ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                Hello, Eric! Today is {dayName}, {fullDate}
              </h1>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setOpen(true)}
              className={`w-64 justify-start flex-shrink-0 ${isDarkTheme ? 'text-gray-400 border-gray-700 bg-gray-900 hover:bg-gray-800' : 'text-gray-600 border-gray-300 bg-gray-100 hover:bg-gray-200'}`}
            >
              <Search className="mr-2 h-4 w-4" />
              Search...
            </Button>
          </div>

          {/* Right side - Theme Toggle, Notifications and Avatar */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onThemeToggle}
              className={`hover:bg-gray-800 ${isDarkTheme ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}
            >
              {isDarkTheme ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className={`relative ${isDarkTheme ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}>
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs"
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
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Avatar and Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`relative h-10 w-10 rounded-full ${isDarkTheme ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/api/placeholder/32/32" alt="Admin" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      EC
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Eric Chen</DropdownMenuLabel>
                <DropdownMenuLabel className="font-normal text-muted-foreground">
                  admin@school.edu
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Command Dialog for Search */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search students, essays, or settings..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            <CommandItem>
              <Grid2x2 className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              <span>Students</span>
            </CommandItem>
            <CommandItem>
              <FileText className="mr-2 h-4 w-4" />
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
    </>
  );
}