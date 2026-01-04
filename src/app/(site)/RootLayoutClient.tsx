"use client";

import { useEffect, useState } from "react";
import PreLoader from "@/components/Common/PreLoader";
import LoadingIndicator from "@/components/Common/LoadingIndicator";
import { ThemeProvider } from "next-themes";

export default function RootLayoutClient({
  children,
  pathname,
}: {
  children: React.ReactNode;
  pathname: string;
}) {
  const [firstLoad, setFirstLoad] = useState(true);

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
  
  if (firstLoad) return <PreLoader />

  return (
    <ThemeProvider
      attribute="class"
      enableSystem={false}
      defaultTheme="light"
    >
      <LoadingIndicator />
      {children}
    </ThemeProvider>
  );
}
