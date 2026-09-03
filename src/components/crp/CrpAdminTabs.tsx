"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function CrpAdminTabs() {
  const pathname = usePathname();
  const trpc = useTRPC();
  const { data: queue = [] } = useQuery(trpc.crpAdmin.getReviewQueue.queryOptions());

  const onReview = pathname.startsWith("/dashboard/admin/crp/review");
  const onOverview = pathname === "/dashboard/admin/crp";

  const base = "px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2";
  const active = "bg-gray-900 text-white";
  const idle = "text-gray-600 hover:bg-gray-100";

  return (
    <div className="flex gap-2">
      <Link href="/dashboard/admin/crp" className={`${base} ${onOverview ? active : idle}`}>
        Overview
      </Link>
      <Link href="/dashboard/admin/crp/review" className={`${base} ${onReview ? active : idle}`}>
        Review queue
        {queue.length > 0 && (
          <span
            className={`text-xs font-semibold rounded-full px-1.5 py-0.5 ${
              onReview ? "bg-white/20 text-white" : "bg-orange-500 text-white"
            }`}
          >
            {queue.length}
          </span>
        )}
      </Link>
    </div>
  );
}
