"use client";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname , useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../../zenith/src/components/ui/avatar";
import { Skeleton } from "../../../../../zenith/src/components/ui/skeleton";
import { Button } from "../../../../../zenith/src/components/ui/button";
import { LayoutDashboard, ClipboardList, Briefcase, FileText, LogOut, Home } from "lucide-react";
import { useSupabase } from "@/hooks/useSupabase";
import { signOut } from "@/actions/signOut";
import { useUserData } from "@/hooks/useUserData";
import { Toaster } from "react-hot-toast";

export default function AspenLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;
  const router = useRouter();
  const { getUserId } = useSupabase();
  const { userId, studentId, isLoading: userDataLoading, error: userDataError } = useUserData();

  const [studentData, setStudentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch student profile data when userId is available
  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const resp = await fetch(`/api/studentId?userId=${userId}`);
        if (!resp.ok) throw new Error("Failed to fetch student data");
        
        const data = await resp.json();
        console.log('🔍 studentData:', data);
        setStudentData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error("Error fetching student data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStudentProfile();
  }, [userId]);

  const handleLogout = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        router.push('/');
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }
 
  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="mx-auto max-w-[1400px] px-2 py-0 md:py-0 bg-neutral-100">
        <div className="flex gap-6 h-[99vh] py-4 bg-neutral-100">
              {/* Sidebar */}
              <aside className="hidden shrink-0 md:block w-72 m-0.5">
                <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 h-full overflow-auto flex flex-col justify-center items-center">
                  <div className="p-6">
                   
                    <div className="mt-4 flex flex-col items-center gap-3">
                      <Avatar className="h-40 w-40 bg-statColors-10">
                        <AvatarImage src="/images/avatars/avatar-003.png" alt="Eric" className="object-contain mt-2" />
                        <AvatarFallback>
                          {studentData ? 
                            `${studentData.first_name?.charAt(0) || ''}${studentData.last_name?.charAt(0) || ''}` 
                            : '...'
                          }
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center">
                        {userDataLoading || isLoading ? (
                          <>
                            <Skeleton className="h-5 w-40 mx-auto mb-2" />
                            <Skeleton className="h-4 w-48 mx-auto" />
                          </>
                        ) : userDataError ? (
                          <>
                            <p className="text-sm text-red-500 mb-1">Authentication Error</p>
                            <p className="text-xs text-neutral-400">{userDataError}</p>
                          </>
                        ) : error ? (
                          <>
                            <p className="text-sm text-red-500 mb-1">Profile Error</p>
                            <p className="text-xs text-neutral-400">{error}</p>
                          </>
                        ) : studentData ? (
                          <>
                            <p className="text-lg font-medium">{studentData.full_name || 'Unknown Name'}</p>
                            <p className="text-sm text-neutral-500">{studentData.email || 'No email'}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-neutral-500">No profile data</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <nav className="p-3 pt-8">
                    <ul className="flex flex-col  space-y-4">
                      <li>
                        <Link
                          href="/dashboard/student"
                          className={`flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base ${
                            isActive('/dashboard/student')
                              ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                              : 'text-neutral-600 hover:bg-neutral-100'
                          }`} >
                          <LayoutDashboard className="h-5 w-5 text-neutral-500" />
                          Dashboard

                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/dashboard/student/assignments"
                          className={`flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base ${
                            isActive('/dashboard/student/assignments')
                              ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                              : 'text-neutral-600 hover:bg-neutral-100'
                          }`} >
                          <ClipboardList className="h-5 w-5 text-neutral-500" />
                          Assignments
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/dashboard/student/opportunities"
                          className={`flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base ${
                            isActive('/dashboard/student/opportunities')
                              ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                              : 'text-neutral-600 hover:bg-neutral-100'
                          }`} >
                          <Briefcase className="h-5 w-5 text-neutral-500" />
                          Opportunities
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/dashboard/student/essays"
                          className={`flex items-center justify-start text-left gap-3 rounded-xl px-3 py-2 text-base ${
                            isActive('/dashboard/student/essays')
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
              <main className="flex-1  h-full overflow-hidden m-0.5">
                {children}
              </main>
        </div>
      </div>
      
      {/* Global Toast Container */}
      <Toaster
        position="top-right"
        containerStyle={{
          marginTop: "20px",
          marginRight: "20px",
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: 'transparent',
            padding: 0,
            margin: 0,
            boxShadow: 'none',
          },
        }}
      />
    </div>
  );
}

