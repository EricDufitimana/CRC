"use client";
import { ThemeProvider } from "next-themes";

export default function TestingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      enableSystem={false}
      defaultTheme="light"
    >
      {children}
    </ThemeProvider>
  )
}
