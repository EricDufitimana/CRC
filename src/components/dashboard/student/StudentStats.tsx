"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/ContentSkeleton";
import { Briefcase, ClipboardCheck, FileText } from "lucide-react";
import { AnimatedNumber } from "@/components/animation/AnimatedNumber";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

function Number({ n }: { n: number }) {
  return (
    <AnimatedNumber
      value={n}
      duration={1.8}
      delay={0.3}
      ease="back.out(1.7)"
      triggerStart="top 90%"
      className="inline-block"
    />
  );
}

export function StudentStats() {
  const trpc = useTRPC();
  const { data: stats } = useSuspenseQuery(trpc.studentDashboard.getDashboardStats.queryOptions());

  const statItems = [
    {
      label: "Assignments Not Done",
      value: stats?.assignmentsNotDone ?? 0,
      icon: ClipboardCheck,
      tint: "bg-emerald-100 text-emerald-700",
      bgClass: "bg-statColors-1"
    },
    {
      label: "Essays Submitted",
      value: stats?.essaysSubmitted ?? 0,
      icon: FileText,
      tint: "bg-sky-100 text-sky-700",
      bgClass: "bg-statColors-2"
    },
    {
      label: "Opportunities Submitted",
      value: stats?.opportunitiesSubmitted ?? 0,
      icon: Briefcase,
      tint: "bg-violet-100 text-violet-700",
      bgClass: "bg-statColors-3"
    },
  ];

  return (
    <div className="grid gap-4 h-short:gap-2 md:grid-cols-3 flex-shrink-0">
      {statItems.map(({ label, value, icon: Icon, bgClass }, index) => (
        <Card key={label} className="border-0 shadow-sm ring-1 ring-black/5 m-0.5">
          <CardContent className="p-5 h-short:p-4">
            <div className="flex flex-col items-start text-center">
              <div className="flex items-center w-full justify-between mb-2 h-short:mb-1">
                <div className="text-2xl h-short:text-xl font-semibold text-neutral-900">
                  <Number n={value} />
                </div>
                <div className={`h-9 w-9 h-short:h-8 h-short:w-8 rounded-xl grid place-items-center text-neutral-900 flex-shrink-0 ${bgClass}`}>
                  <Icon size={18} className="h-short:w-4 h-short:h-4" />
                </div>
              </div>
              <p className="text-sm h-short:text-sm text-neutral-500 font-medium leading-tight">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
