"use client";
import NotFound from "@/components/NotFound";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { ThemeProvider } from "next-themes";

const GlobalNotFound = () => {
  return (
    <ThemeProvider
      attribute="class"
      enableSystem={false}
      defaultTheme="light"
    >
      <div style={{ paddingTop: "0px" }}>
        <div className="pt-20"></div>
        <NotFound />
      </div>
      <ScrollToTop />
    </ThemeProvider>
  );
};

export default GlobalNotFound;
