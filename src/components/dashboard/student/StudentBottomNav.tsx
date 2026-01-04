"use client";

import type { ComponentType } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Briefcase,
  Folder,
  MoreHorizontal,
  Home,
  LogOut,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/zenith/components/ui/sheet";
import { Button } from "@/zenith/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  isActive: (pathname: string) => boolean;
};

export function StudentBottomNav() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const { signOut, isSigningOut } = useAuth();

  const isDashboard = (p: string) => p === "/dashboard/student";
  const isAssignments = (p: string) => p.startsWith("/dashboard/student/assignments");
  const isRequests = (p: string) => p.startsWith("/dashboard/student/requests");
  const isDocuments = (p: string) => p.startsWith("/dashboard/student/documents");

  const primaryPhone: NavItem[] = [
    { label: "Home", href: "/dashboard/student", icon: LayoutDashboard, isActive: isDashboard },
    { label: "Tasks", href: "/dashboard/student/assignments", icon: ClipboardList, isActive: isAssignments },
    { label: "Requests", href: "/dashboard/student/requests", icon: Briefcase, isActive: isRequests },
  ];

  const primaryTablet: NavItem[] = [
    { label: "Home", href: "/dashboard/student", icon: LayoutDashboard, isActive: isDashboard },
    { label: "Tasks", href: "/dashboard/student/assignments", icon: ClipboardList, isActive: isAssignments },
    { label: "Requests", href: "/dashboard/student/requests", icon: Briefcase, isActive: isRequests },
    { label: "Files", href: "/dashboard/student/documents", icon: Folder, isActive: isDocuments },
  ];

  const renderItem = (item: NavItem) => {
    const active = item.isActive(pathname);
    const Icon = item.icon;

    return (
      <button
        type="button"
        onClick={() => router.push(item.href)}
        className={
          "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 " +
          (active
            ? "text-white bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20"
            : "text-neutral-600 hover:bg-neutral-100")
        }
      >
        <Icon className="h-5 w-5" />
        <span className="text-[11px] leading-none font-medium">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="md:hidden fixed left-0 right-0 bottom-0 z-40">
      <div className="pointer-events-none absolute inset-x-0 bottom-full h-10 bg-gradient-to-t from-neutral-100 to-transparent" />

      <div className="border-t border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-xl px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
          <div className="grid grid-cols-4 gap-2">
            {primaryPhone.map(renderItem)}

            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 text-neutral-600 hover:bg-neutral-100"
                >
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="text-[11px] leading-none font-medium">More</span>
                </button>
              </SheetTrigger>

              <SheetContent side="bottom" className="p-0 bg-neutral-100 border-t border-black/5">
                <div className="max-w-xl mx-auto">
                  <SheetHeader className="px-6 pt-6">
                    <SheetTitle>Student Menu</SheetTitle>
                  </SheetHeader>

                  <div className="px-6 pb-6 pt-4 grid grid-cols-2 gap-3">
                    <Button
                      variant="ghost"
                      className="h-12 justify-start rounded-xl bg-white/60 hover:bg-white"
                      onClick={() => router.push("/dashboard/student/documents")}
                    >
                      <Folder className="h-4 w-4 mr-2" />
                      Documents
                    </Button>

                    <Button
                      variant="ghost"
                      className="h-12 justify-start rounded-xl bg-white/60 hover:bg-white"
                      onClick={() => (window.location.href = "/")}
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Home Page
                    </Button>

                    <Button
                      variant="ghost"
                      className="h-12 justify-start rounded-xl bg-white/60 hover:bg-white"
                      onClick={() => signOut()}
                      disabled={isSigningOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {isSigningOut ? "Signing out..." : "Sign out"}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StudentBottomNavTablet() {
  const router = useRouter();
  const pathname = usePathname() ?? "";

  const isDashboard = (p: string) => p === "/dashboard/student";
  const isAssignments = (p: string) => p.startsWith("/dashboard/student/assignments");
  const isRequests = (p: string) => p.startsWith("/dashboard/student/requests");
  const isDocuments = (p: string) => p.startsWith("/dashboard/student/documents");

  const primaryTablet: NavItem[] = [
    { label: "Home", href: "/dashboard/student", icon: LayoutDashboard, isActive: isDashboard },
    { label: "Tasks", href: "/dashboard/student/assignments", icon: ClipboardList, isActive: isAssignments },
    { label: "Requests", href: "/dashboard/student/requests", icon: Briefcase, isActive: isRequests },
    { label: "Files", href: "/dashboard/student/documents", icon: Folder, isActive: isDocuments },
  ];

  const renderItem = (item: NavItem) => {
    const active = item.isActive(pathname);
    const Icon = item.icon;

    return (
      <button
        type="button"
        onClick={() => router.push(item.href)}
        className={
          "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 " +
          (active
            ? "text-white bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20"
            : "text-neutral-600 hover:bg-neutral-100")
        }
      >
        <Icon className="h-5 w-5" />
        <span className="text-[11px] leading-none font-medium">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="hidden md:block lg:hidden fixed left-0 right-0 bottom-0 z-40">
      <div className="pointer-events-none absolute inset-x-0 bottom-full h-10 bg-gradient-to-t from-neutral-100 to-transparent" />
      <div className="border-t border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
          <div className="grid grid-cols-4 gap-2">{primaryTablet.map(renderItem)}</div>
        </div>
      </div>
    </div>
  );
}
