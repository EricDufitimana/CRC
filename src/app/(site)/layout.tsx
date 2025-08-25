"use client";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import StickyNotificationBanner from "@/components/Banner/StickyNotificationBanner";
import { usePathname } from "next/navigation";

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

  useEffect(() => {
    const timer = setTimeout(() => setFirstLoad(false), 1000)
    return () => clearTimeout(timer)
  },[])
  
  if (firstLoad) return (
  <html suppressHydrationWarning={true} className="!scroll-smooth" lang="en">
    <body suppressHydrationWarning={true}>
      <PreLoader />
    </body>
  </html>
)

  return (
    <html suppressHydrationWarning={true} className="!scroll-smooth" lang="en">
      <head />
      <body suppressHydrationWarning={true}>
            <ThemeProvider
              attribute="class"
              enableSystem={false}
              defaultTheme="light"
            >
              {pathname === "/" && <StickyNotificationBanner />}
              <div style={{ paddingTop: "var(--banner-height, 0px)", transition: "padding-top 200ms ease" }}>
                <Header />
                <LoadingIndicator />
                {children}
                <Footer />
              </div>
              
              <ScrollToTop />
            </ThemeProvider>
      </body>
    </html>
  );
}