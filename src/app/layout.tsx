import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MobileOverflowWrapper from "@/components/MobileOverflowWrapper";

const inter = Inter({ subsets: ["latin"] });



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true} className="!scroll-smooth">
      <body className={inter.className} suppressHydrationWarning={true}>
        <MobileOverflowWrapper>
          {children}
        </MobileOverflowWrapper>
      </body>
    </html>
  );
}
