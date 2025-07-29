"use client";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { ThemeProvider } from "next-themes";
import "../../styles/index.css";
import "../../styles/prism-vsc-dark-plus.css";
import { useEffect, useState } from "react";
import PreLoader from "@/components/Common/PreLoader";
import Link from "next/link";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html suppressHydrationWarning={true} className="!scroll-smooth" lang="en">
      <head />
      <body suppressHydrationWarning={true}>
        {loading ? (
          <PreLoader />
        ) : (
            <ThemeProvider
              attribute="class"
              enableSystem={false}
              defaultTheme="light"
            >
              <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0 no-scrollbar overflow-y-scroll">
                <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
                  {children}
                  <div className="items-center hidden w-full h-full lg:w-1/2 bg-secondary dark:bg-white/5 lg:grid auth-background">
                    <div className="relative flex items-center justify-center z-1">
                      <div className="flex flex-col items-center max-w-xs">
                        
                      </div>
                    </div>
                  </div>
                  <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
                  </div>
                </div>
              <ScrollToTop />
            </div>
            </ThemeProvider>
        )}
      </body>
    </html>
  );
}