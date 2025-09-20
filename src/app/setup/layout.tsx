"use client";
import { ThemeProvider } from "next-themes";
import Head from "../(site)/head"
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
      {Head("Setup - Career Resources Center")}
      {children}
    </ThemeProvider>
  )
}
