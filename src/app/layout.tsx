import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CRC - Career Resources Center",
  description: "Career Resources Center Website",
  icons: {
    icon: "/images/logo/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true} className="!scroll-smooth">
      <body className={inter.className} suppressHydrationWarning={true}>
          {children}
      </body>
    </html>
  );
}
