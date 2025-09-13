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
import { Toaster, ToastBar } from "react-hot-toast";
import "../../styles/index.css";
import { Boxes } from "@/components/ui/background-boxes";
import Head from "../(site)/head";


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
    <>
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
                <div className="items-center hidden w-full h-full lg:w-1/2 lg:grid auth-background overflow-hidden p-1">
                  <div className="relative w-full h-full overflow-hidden bg-slate-900 rounded-2xl">
                    <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none rounded-3xl" />
                    <Boxes />
                    <div className="absolute z-50 inset-0 flex flex-col items-center justify-center text-white  px-4 pointer-events-none text-center ">
                      <p className="text-white/80 drop-shadow-2xl text-7xl font-cal-sans">
                        CRC Platform
                      </p>
                      <p className=" drop-shadow-2xl  text-lg font-light text-gray-700 max-w-lg">
                      Securely log in to access your personalized dashboard, resources, and the latest updates from CRC.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
                </div>
              </div>
            <ScrollToTop />
          </div>
          
          {/* Global Toast Container */}
          <Toaster
            position="top-left"
            containerStyle={{
              // Custom positioning - move toast down and to the right
              marginTop: "80px",
              marginLeft: "5px",
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
          >
            {(t) => (
              <ToastBar
                toast={t}
                style={{
                  ...t.style,
                  animation: t.visible
                    ? "slide-in-left 0.4s ease-out"
                    : "slide-out-left 0.4s ease-in forwards",
                }}
              />
            )}
          </Toaster>

          </ThemeProvider>
      )}
    </>
  );
}