"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Search } from "lucide-react";
import Image from "next/image";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AssignmentCard } from "./assignments/AssignmentCard";
import { ContactSupportDialog } from "./assignments/ContactSupportDialog";
import { NoClassState } from "./assignments/NoClassState";

export function StudentAssignmentsContent() {
  const trpc = useTRPC();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [openFormFor, setOpenFormFor] = useState<string | null>(null);

  const { data, refetch } = useSuspenseQuery(trpc.studentDashboard.getAssignments.queryOptions());
  const { assignments, noClass } = data;

  const filteredAssignments = useMemo(() => {
    if (!query.trim()) return assignments;
    const q = query.toLowerCase();
    return assignments.filter(a => 
      a.title.toLowerCase().includes(q) || 
      (a.workshop?.title?.toLowerCase() || "").includes(q)
    );
  }, [assignments, query]);

  const paginatedAssignments = useMemo(() => {
    return filteredAssignments.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredAssignments, page]);

  const totalPages = Math.ceil(filteredAssignments.length / pageSize);

  if (noClass) {
    return (
      <>
        <NoClassState onOpenContact={() => setIsContactDialogOpen(true)} />
        <ContactSupportDialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen} />
      </>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden ">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0 group">
        <Link href="/dashboard/student">
          <Button variant="ghost" size="sm" className="h-8 px-2 hover:scale-110 hover:translate-x-[-2px] transition-all duration-200">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-semibold font-cal-sans">Assignments</h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden min-h-0 ">
        <Card className="border-0 shadow-sm ring-1 ring-black/5 m-0.5 h-[calc(100%-6px)] flex flex-col overflow-hidden min-h-0">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">All assignments</CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by title or workshop..."
                  className="pl-8 h-9 rounded-xl"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-0">
            <ScrollArea className="h-full px-6 py-3">
              {assignments.length === 0 ? (
                <div className="h-[40vh] w-full flex flex-col items-center justify-center py-8 h-short:pt-24 text-center">
                  <img src="/images/dashboard/empty-assignments.png" alt="No assignments" className="w-[260px] h-[260px] opacity-95" />
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedAssignments.map((a) => (
                    <AssignmentCard
                      key={a.id}
                      assignment={a}
                      isOpen={openFormFor === a.id}
                      onOpenForm={setOpenFormFor}
                      refetch={refetch}
                    />
                  ))}
                </div>
              )}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
                  <div className="text-xs text-neutral-500">
                    Page {page} of {totalPages}
                  </div>
                  <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <ContactSupportDialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen} />
    </div>
  );
}
