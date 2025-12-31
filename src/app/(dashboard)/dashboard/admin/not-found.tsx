"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "../../../../../zenith/src/components/ui/button";

export default function DashboardNotFound() {
  const pathname = usePathname();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      pathname
    );
  }, [pathname]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <Button asChild>
          <a href="/dashboard/admin">Return to Dashboard</a>
        </Button>
      </div>
    </div>
  );
} 