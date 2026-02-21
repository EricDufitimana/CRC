"use client";

import { usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export function BetaPlaceholderPage() {
  const pathname = usePathname();
  const pageName = pathname?.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Page";

  return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full border-0 shadow-none bg-transparent text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
            <Construction size={32} />
          </div>
          <CardTitle className="text-2xl font-bold font-cal-sans">{pageName} (Demo)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            This part of the demo dashboard is currently under preview. 
            We are working on bringing dummy data for {pageName} soon!
          </p>
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100 inline-block">
            <p className="text-xs font-mono text-gray-400">Path: {pathname}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
