import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { getServerContext } from '@/trpc/init';
import Head from "../(site)/head";

export const dynamic = 'force-dynamic';

export default async function SetupLayout({ children }: { children: ReactNode }) {
  const context = await getServerContext();

  // Prefetch setup data when user accesses setup page
  if (context.user && context.user.user_id) {
    try {
      // Prefetch student data for setup
      prefetch(trpc.setup.getStudentData.queryOptions({ userId: context.user.user_id }));
      
      // Prefetch avatars for profile picture selection
      prefetch(trpc.studentSidebar.getAvatarsWithSignedUrls.queryOptions());
      
      console.log('🚀 [Setup Layout] Prefetched tRPC queries for user:', context.user.user_id);
    } catch (error) {
      // Silently fail prefetch - data will load on client side
      console.warn('Setup layout prefetch failed, will load on client:', error);
    }
  }

  return (
    <HydrateClient>
      <ThemeProvider
        attribute="class"
        enableSystem={false}
        defaultTheme="light"
      >
        {Head("Setup - Career Resources Center")}
        {children}
      </ThemeProvider>
    </HydrateClient>
  );
}
