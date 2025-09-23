"use client";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import StickyNotificationBanner from "@/components/Banner/StickyNotificationBanner";
import { usePathname } from "next/navigation";
import Head from "./head";

import { ThemeProvider } from "next-themes";
import "../../styles/index.css"
import "../../styles/prism-vsc-dark-plus.css";
import { useEffect, useState } from "react";
import PreLoader from "@/components/Common/PreLoader";
import LoadingIndicator from "@/components/Common/LoadingIndicator";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const[firstLoad, setFirstLoad] = useState(true);
  const pathname = usePathname();
  const[title, setTitle] = useState("Loading...");

  useEffect(() => {
    // Reduce preloader time for better perceived performance
    const timer = setTimeout(() => setFirstLoad(false), 300)
    return () => clearTimeout(timer)
  },[])

  // Reset banner height when not on home page
  useEffect(() => {
    if (pathname !== "/") {
      document.documentElement.style.setProperty("--banner-height", "0px");
    }
  }, [pathname])

  // Set page title based on pathname
  useEffect(() => {
    if (pathname?.includes("resources")) setTitle("Resources - Career Resourcces Center")
    else if (pathname?.includes("previous-events")) setTitle("Previous Events - Career Resources Center")
    else if (pathname?.includes("upcoming-events"	)) setTitle("Upcoming Events - Career Resources Center")
    else if(pathname?.includes("workshops")) setTitle("Workshops - Career Resources Center")
    else setTitle("Home - Career Resources Center")
  }, [pathname])
  
  if (firstLoad) return <PreLoader />

  

  return (
    <ThemeProvider
      attribute="class"
      enableSystem={false}
      defaultTheme="light"
    >
      {Head(title)}
      {pathname === "/" && <StickyNotificationBanner />}
      <div style={{ paddingTop: "var(--banner-height, 0px)", transition: "padding-top 200ms ease" }}>
        <Header/>
        <LoadingIndicator />
        {children}
        <Footer />
      </div>
      
      <ScrollToTop />
    </ThemeProvider>
  );
}