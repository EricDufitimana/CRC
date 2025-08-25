"use client";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname , useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../../zenith/src/components/ui/avatar";
import { Skeleton } from "../../../../../zenith/src/components/ui/skeleton";
import { Button } from "../../../../../zenith/src/components/ui/button";
import { LayoutDashboard, ClipboardList, Briefcase, FileText, LogOut, Home } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupabase } from "@/hooks/useSupabase";

export default function AspenLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;
  const router = useRouter();
  const { getUserId } = useSupabase();

  const [studentData, setStudentData] = useState<any>(null);
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const userId = await getUserId();
      if (userId) {
        const resp = await fetch(`/api/studentId?userId=${userId}`);
        if (!resp.ok) throw new Error("Failed to fetch student data");
        const data = await resp.json();
        setStudentData(data);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleLogout = async () => {
    try{
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }
 
  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="mx-auto max-w-[1400px] px-2 py-0 md:py-0 bg-neutral-100">
        <div className="flex gap-6 min-h-screen bg-neutral-100">
              {/* Sidebar */}
              <aside className="hidden shrink-0 md:block w-72">
                <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 sticky top-6 h-[95vh] overflow-auto flex flex-col justify-center items-center">
                  <div className="p-6">
                   
                    <div className="mt-4 flex flex-col items-center gap-3">
                      <Avatar className="h-40 w-40">
                        <AvatarImage src="/images/team/graham.jpg" alt="Eric" />
                        <AvatarFallback>{studentData?.first_name.charAt(0)}{studentData?.last_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="text-center">
                        {studentData ? (
                          <>
                            <p className="text-lg font-medium">{studentData.full_name}</p>
                            <p className="text-sm text-neutral-500">{studentData.email}</p>
                          </>
                        ) : (
                          <>
                            <Skeleton className="h-5 w-40 mx-auto mb-2" />
                            <Skeleton className="h-4 w-48 mx-auto" />
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <nav className="p-3 pt-8">
                    <ul className="flex flex-col  space-y-4">
                      <li>
                        <Link
                          href="/dashboard/student/aspen"
                          className={`flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base ${
                            isActive('/dashboard/student/aspen')
                              ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                              : 'text-neutral-600 hover:bg-neutral-100'
                          }`} >
                          <LayoutDashboard className="h-5 w-5 text-neutral-500" />
                          Dashboard

                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/dashboard/student/aspen/assignments"
                          className={`flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base ${
                            isActive('/dashboard/tudent/aspen/assignments')
                              ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                              : 'text-neutral-600 hover:bg-neutral-100'
                          }`} >
                          <ClipboardList className="h-5 w-5 text-neutral-500" />
                          Assignments
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/dashboard/student/aspen/opportunities"
                          className={`flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base ${
                            isActive('/dashboard/student/aspen/opportunities')
                              ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                              : 'text-neutral-600 hover:bg-neutral-100'
                          }`} >
                          <Briefcase className="h-5 w-5 text-neutral-500" />
                          Opportunities
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/dashboard/student/aspen/essays"
                          className={`flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base ${
                            isActive('/dashboard/student/aspen/essays')
                              ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                              : 'text-neutral-600 hover:bg-neutral-100'
                          }`} >
                          <FileText className="h-5 w-5 text-neutral-500" />
                          Essays
                        </Link>
                      </li>
                    </ul>
                  </nav>

                  <div className="p-3 mt-auto">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-base text-neutral-600 hover:text-neutral-900"
                        onClick={() => window.location.href = '/'}
                      >
                        <Home className="h-5 w-5" />
                        Home
                      </Button>
                      <span className="text-neutral-400">|</span>
                      <Button
                        variant="ghost"
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-base text-neutral-600 hover:text-neutral-900"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-5 w-5" />
                        Sign out
                      </Button>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main */}
              <main className="flex-1 max-h-[95vh] md:pt-6">
                {children}
              </main>
        </div>
      </div>
    </div>
  );
}

