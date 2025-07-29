"use client";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";

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
              
              <Header />
              <LoadingIndicator />
              {children}
              <Footer />
              
              <ScrollToTop />
            </ThemeProvider>
      </body>
    </html>
  );
}