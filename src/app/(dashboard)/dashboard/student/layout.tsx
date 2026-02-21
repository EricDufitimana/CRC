import { ReactNode } from "react";
import Head from "../../../(site)/head";
import { StudentLayoutContent } from "@/components/dashboard/student/StudentLayoutContent";
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { getServerContext } from '@/trpc/init';
import { getDashboardTitle } from "@/utils/dashboard-titles";
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const context = await getServerContext();

  // Prefetch common data used across student pages
  if (context.user && context.role === 'student' && context.user.id) {
    try {
      // Prefetch fellows and workshops as they're used in multiple dialogs across pages
      prefetch(trpc.studentDashboard.getFellows.queryOptions());
      prefetch(trpc.studentDashboard.getAvailableWorkshops.queryOptions());
      prefetch(trpc.studentSidebar.getAvatarsWithSignedUrls.queryOptions());
      prefetch(trpc.studentSidebar.getStudentData.queryOptions());
    } catch (error) {
      // Silently fail prefetch - data will load on client side
      console.warn('Layout prefetch failed, will load on client:', error);
    }
  }
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';
  
  return (
    <HydrateClient>
      {Head(getDashboardTitle(pathname, 'student'))}
      <StudentLayoutContent>
        {children}
      </StudentLayoutContent>
    </HydrateClient>
  );
}