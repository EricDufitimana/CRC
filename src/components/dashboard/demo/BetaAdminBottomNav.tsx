"use client";

import type { ComponentType } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Layers,
  MoreHorizontal,
  CalendarDays,
  Megaphone,
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  BriefcaseBusiness,
} from "lucide-react";

import { Button } from "@/zenith/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/zenith/components/ui/sheet";
import { AdminHeader } from "../admin/AdminHeader";

interface BetaAdminBottomNavProps {
  adminName: string;
  adminEmail: string;
}

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  isActive: (pathname: string) => boolean;
};

export function BetaAdminBottomNav({ adminName, adminEmail }: BetaAdminBottomNavProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "";

  const isActive = (path: string) => {
    if (path === '/demo/admin') return pathname === path;
    return pathname?.startsWith(path);
  };

  const primaryItemsPhone: NavItem[] = [
    { label: "Home", href: "/demo/admin", icon: LayoutDashboard, isActive: (p) => p === "/demo/admin" },
    { label: "Students", href: "/demo/admin", icon: Users, isActive: (p) => p.startsWith("/demo/admin/student-management") },
    { label: "Content", href: "/demo/admin", icon: Layers, isActive: (p) => p.startsWith("/demo/admin/content-management") },
  ];

  const primaryItemsTablet: NavItem[] = [
    { label: "Home", href: "/demo/admin", icon: LayoutDashboard, isActive: (p) => p === "/demo/admin" },
    { label: "Students", href: "/demo/admin", icon: Users, isActive: (p) => p.startsWith("/demo/admin/student-management") },
    { label: "Tasks", href: "/demo/admin", icon: ClipboardList, isActive: (p) => p.startsWith("/demo/admin/assignments-management") },
    { label: "Content", href: "/demo/admin", icon: Layers, isActive: (p) => p.startsWith("/demo/admin/content-management") },
  ];

  const renderItem = (item: NavItem) => {
    const active = item.isActive(pathname);
    const Icon = item.icon;

    return (
      <button
        key={item.label}
        type="button"
        onClick={() => router.push(item.href)}
        className={
          "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 " +
          (active
            ? "text-white bg-gradient-to-r from-orange-400 to-orange-500 shadow-lg shadow-orange-500/20"
            : "text-gray-600 hover:bg-gray-100/70")
        }
      >
        <Icon className="h-5 w-5" />
        <span className="text-[11px] leading-none font-medium">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="lg:hidden fixed left-0 right-0 bottom-0 z-40">
      <div className="pointer-events-none absolute inset-x-0 bottom-full h-10 bg-gradient-to-t from-gray-50 to-transparent" />

      <div className="border-t border-gray-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
          <div className="grid grid-cols-4 gap-2 md:hidden">
            {primaryItemsPhone.map((item) => renderItem(item))}

            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 text-gray-600 hover:bg-gray-100/70"
                >
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="text-[11px] leading-none font-medium">More</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="p-0 bg-gray-50 border-t border-gray-200/60">
                <div className="max-w-2xl mx-auto">
                  <SheetHeader className="px-6 pt-6">
                    <SheetTitle>Admin Navigation (Demo)</SheetTitle>
                  </SheetHeader>

                  <div className="px-6 pb-6 pt-4 grid grid-cols-2 gap-3">
                    <Button variant="ghost" className="h-12 justify-start rounded-xl bg-white/60 hover:bg-white" onClick={() => router.push("/demo/admin")}>
                      <ClipboardList className="h-4 w-4 mr-2" /> Assignments
                    </Button>
                    <Button variant="ghost" className="h-12 justify-start rounded-xl bg-white/60 hover:bg-white" onClick={() => router.push("/demo/admin")}>
                      <ClipboardCheck className="h-4 w-4 mr-2" /> Attendance
                    </Button>
                    <Button variant="ghost" className="h-12 justify-start rounded-xl bg-white/60 hover:bg-white" onClick={() => router.push("/demo/admin")}>
                      <GraduationCap className="h-4 w-4 mr-2" /> CRC Classes
                    </Button>
                    <Button variant="ghost" className="h-12 justify-start rounded-xl bg-white/60 hover:bg-white" onClick={() => router.push("/demo/admin")}>
                      <BookOpen className="h-4 w-4 mr-2" /> Workshops
                    </Button>
                    <Button variant="ghost" className="h-12 justify-start rounded-xl bg-white/60 hover:bg-white" onClick={() => router.push("/demo/admin")}>
                      <CalendarDays className="h-4 w-4 mr-2" /> Events
                    </Button>
                    <Button variant="ghost" className="h-12 justify-start rounded-xl bg-white/60 hover:bg-white" onClick={() => router.push("/demo/admin")}>
                      <Megaphone className="h-4 w-4 mr-2" /> Announcements
                    </Button>
                  </div>

                  <AdminHeader adminName={adminName} adminEmail={adminEmail} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden md:grid grid-cols-5 gap-2">
            {primaryItemsTablet.map((item) => renderItem(item))}

            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 text-gray-600 hover:bg-gray-100/70"
                >
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="text-[11px] leading-none font-medium">More</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="p-0 bg-gray-50 border-t border-gray-200/60">
                <div className="max-w-2xl mx-auto">
                  <SheetHeader className="px-6 pt-6">
                    <SheetTitle>Quick Access (Demo)</SheetTitle>
                  </SheetHeader>

                  <div className="px-6 pb-6 pt-4 grid grid-cols-3 gap-3">
                    <Button variant="ghost" className="h-12 justify-start rounded-xl bg-white/60 hover:bg-white" onClick={() => router.push("/demo/admin")}>
                      <ClipboardCheck className="h-4 w-4 mr-2" /> Attendance
                    </Button>
                    <Button variant="ghost" className="h-12 justify-start rounded-xl bg-white/60 hover:bg-white" onClick={() => router.push("/demo/admin")}>
                      <GraduationCap className="h-4 w-4 mr-2" /> Classes
                    </Button>
                    <Button variant="ghost" className="h-12 justify-start rounded-xl bg-white/60 hover:bg-white" onClick={() => router.push("/demo/admin")}>
                      <ClipboardCheck className="h-4 w-4 mr-2" /> Essays
                    </Button>
                  </div>

                  <AdminHeader adminName={adminName} adminEmail={adminEmail} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}
