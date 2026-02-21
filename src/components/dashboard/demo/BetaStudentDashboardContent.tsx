"use client";

import { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Briefcase, ClipboardCheck, FileText, Calendar, Send, ArrowRight, Bell, Folder } from "lucide-react";
import { AnimatedNumber } from "@/components/animation/AnimatedNumber";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { showToastError } from "@/components/toasts/ToastError";

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

export function BetaStudentDashboardContent() {
  const router = useRouter();

  const handleAction = () => {
    showToastError({
      headerText: "Action Restricted",
      paragraphText: "This action is not available in the preview session.",
      direction: "right"
    });
  };

  const statItems = [
    {
      label: "Assignments Not Done",
      value: 3,
      icon: ClipboardCheck,
      bgClass: "bg-statColors-1"
    },
    {
      label: "Essays Submitted",
      value: 12,
      icon: FileText,
      bgClass: "bg-statColors-2"
    },
    {
      label: "Opportunities Submitted",
      value: 5,
      icon: Briefcase,
      bgClass: "bg-statColors-3"
    },
  ];

  const recentAssignments = [
    { id: 1, title: "English Essay - Final Draft", type: "File upload", time: "2 hours ago" },
    { id: 2, title: "Math Weekly Problem Set", type: "Google link", time: "1 day ago" },
    { id: 3, title: "History Research Outline", type: "File upload", time: "3 days ago" },
  ];

  const announcements = [
    { id: 1, message: "Welcome to your CRC Student Dashboard!", time: "Today", category: "General" },
    { id: 2, message: "New workshops added for next week. Check them out!", time: "Yesterday", category: "Workshops" },
  ];

  const resources = [
    { id: 1, title: "Common App Guide 2026", type: "PDF", category: "Resources" },
    { id: 2, title: "Summer Internship List", type: "Excel", category: "Opportunities" },
  ];

  return (
    <div className="space-y-6 h-short:space-y-3 h-full flex flex-col overflow-hidden">
      {/* Greeting */}
      <h2 className="text-2xl font-semibold font-cal-sans flex-shrink-0">Dashboard</h2>

      {/* Top stats */}
      <div className="grid gap-4 h-short:gap-2 md:grid-cols-3 flex-shrink-0">
        {statItems.map(({ label, value, icon: Icon, bgClass }) => (
          <Card key={label} className="border-0 shadow-sm ring-1 ring-black/5 m-0.5">
            <CardContent className="p-5 h-short:p-4">
              <div className="flex flex-col items-start">
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

      {/* Main grid */}
      <div className="grid flex-1 gap-6 h-short:gap-3 lg:grid-cols-3 overflow-hidden min-h-0">
        <div className="lg:col-span-2 grid grid-rows-[auto_1fr] gap-6 h-short:gap-3 overflow-hidden min-h-0">
          {/* Quick Links Grid */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5 flex-shrink-0 m-0.5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-short:gap-2">
                <Button variant="outline" className="w-full justify-start h-auto py-4 h-short:py-3 rounded-xl gap-3 hover:shadow-sm transition-all" onClick={handleAction}>
                  <span className="h-10 w-10 h-short:h-9 h-short:w-9 rounded-full bg-yearcolors-ey grid place-items-center flex-shrink-0"><Calendar className="h-5 w-5" /></span>
                  <span className="text-sm font-medium">Request Session</span>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto py-4 h-short:py-3 rounded-xl gap-3 hover:shadow-sm transition-all" onClick={() => router.push('/demo/student/requests')}>
                  <span className="h-10 w-10 h-short:h-9 h-short:w-9 rounded-full bg-yearcolors-s5 grid place-items-center flex-shrink-0"><FileText className="h-5 w-5" /></span>
                  <span className="text-sm font-medium">Submit Essay</span>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto py-4 h-short:py-3 rounded-xl gap-3 hover:shadow-sm transition-all" onClick={() => router.push('/demo/student/requests')}>
                  <span className="h-10 w-10 h-short:h-9 h-short:w-9 rounded-full bg-yearcolors-s4 grid place-items-center flex-shrink-0"><Send className="h-5 w-5" /></span>
                  <span className="text-sm font-medium">Submit Opportunity</span>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto py-4 h-short:py-3 rounded-xl gap-3 hover:shadow-sm transition-all" onClick={() => router.push('/demo/student/assignments')}>
                  <span className="h-10 w-10 h-short:h-9 h-short:w-9 rounded-full bg-yearcolors-s6 grid place-items-center flex-shrink-0"><ClipboardCheck className="h-5 w-5" /></span>
                  <span className="text-sm font-medium">Submit Assignment</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* New assignments */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5 flex flex-col overflow-hidden min-h-0 m-0.5 h-[calc(100%-6px)]">
            <CardHeader className="pb-1 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">New assignments</CardTitle>
                <Link href="/demo/student/assignments">
                  <Button variant="ghost" size="sm" className="h-7">View all</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              <ScrollArea className="h-full px-6 py-3">
                <div className="space-y-3 h-short:space-y-2">
                  {recentAssignments.map((a) => (
                    <Link key={a.id} href="/demo/student/assignments" className="block">
                      <div className="flex items-start gap-3 rounded-xl border border-neutral-100 p-3 hover:bg-neutral-50">
                        <span className="h-8 w-8 rounded-full bg-yearcolors-ey grid place-items-center">
                          <ClipboardCheck className="h-4 w-4 text-neutral-900" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{a.title}</p>
                          <p className="text-xs text-neutral-500">{a.type} • {a.time}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right rail */}
        <div className="grid gap-6 h-short:gap-3 grid-rows-2 overflow-hidden min-h-0">
          {/* Announcements */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5 flex flex-col overflow-hidden min-h-0 m-0.5">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-base">Announcements</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              <ScrollArea className="h-full px-6 py-3">
                <div className="space-y-4">
                  {announcements.map((n) => (
                    <div key={n.id} className="rounded-xl border border-neutral-100 p-3 text-sm text-neutral-700">
                      <div className="flex items-start gap-3">
                        <span className="h-5 w-1 rounded-full bg-statColors-7 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="mb-1">
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-statColors-7 text-neutral-900">{n.category}</span>
                          </div>
                          <p className="text-sm text-neutral-800 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-neutral-400 font-medium uppercase mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* New content added */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5 flex flex-col overflow-hidden min-h-0 m-0.5 h-[calc(100%-6px)]">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-base">New content added</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              <ScrollArea className="h-full px-6 py-3">
                <div className="space-y-3">
                  {resources.map((res) => (
                    <div key={res.id} className="flex items-start gap-3 rounded-xl border border-neutral-100 p-3 hover:bg-neutral-50 transition-colors cursor-pointer" onClick={() => router.push('/demo/student/documents')}>
                      <span className={`h-8 w-8 rounded-full grid place-items-center ${res.category === 'Opportunities' ? 'bg-yearcolors-s4' : 'bg-yearcolors-ey'}`}>
                        {res.category === 'Opportunities' ? <Briefcase className="h-4 w-4 text-neutral-900" /> : <FileText className="h-4 w-4 text-neutral-900" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{res.title}</p>
                        <p className="text-xs text-neutral-500">{res.category} • 1 day ago</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
