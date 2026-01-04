import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { getServerContext } from '@/trpc/init';
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import StickyNotificationBanner from "@/components/Banner/StickyNotificationBanner";
import { headers } from "next/headers";
import Head from "./head";

import { ThemeProvider } from "next-themes";
import "../../styles/index.css"
import "../../styles/prism-vsc-dark-plus.css";
import RootLayoutClient from "./RootLayoutClient";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';

  // Prefetch events and workshops data for better UX
  try {
    prefetch(trpc.events.getPreviousEvents.queryOptions());
    prefetch(trpc.events.getUpcomingEvents.queryOptions());
    prefetch(trpc.workshops.getAllWorkshops.queryOptions());
  } catch (error) {
    // Silently fail prefetch - data will load on client side
    console.warn('Prefetch failed, will load on client:', error);
  }

  // Set page title based on pathname
  const getTitle = () => {
    if (pathname?.includes("newopportunities")) return "New Opportunities | CRC Platform"
    else if (pathname?.includes("recurringopportunities")) return "Recurring Opportunities | CRC Platform"
    else if (pathname?.includes("templates")) return "Templates | CRC Platform"
    else if (pathname?.includes("crp")) return "CRP | CRC Platform"
    else if (pathname?.includes("internships")) return "Internships | CRC Platform"
    else if (pathname?.includes("ell")) return "English Language Learning | CRC Platform"
    else if (pathname?.includes("approved")) return "Approved Universities | CRC Platform"
    else if (pathname?.includes("previous-events")) return "Previous Events | CRC Platform"
    else if (pathname?.includes("upcoming-events")) return "Upcoming Events | CRC Platform"
    else if(pathname?.includes("workshops")) return "Workshops - Career Resources Center"
    else return "Home - Career Resources Center"
  }

  return (
    <HydrateClient>
      <RootLayoutClient pathname={pathname}>
        {Head(getTitle())}
        {pathname === "/" && <StickyNotificationBanner />}
        <div style={{ paddingTop: "var(--banner-height, 0px)", transition: "padding-top 200ms ease" }}>
          <Header/>
          {children}
          <Footer />
        </div>
        <ScrollToTop />
      </RootLayoutClient>
    </HydrateClient>
  );
}
