"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/zenith/components/ui/card";
import { Input } from "@/zenith/components/ui/input";
import { ScrollArea } from "@/zenith/components/ui/scroll-area";
import { Search } from "lucide-react";
import { AssignmentCard } from "../student/assignments/AssignmentCard";
import { showToastError } from "@/components/toasts/ToastError";

// Dummy data for Demo
const dummyAssignments = [
  {
    id: "a1",
    title: "Personal Statement Draft 1",
    description: "Write your first draft of the personal statement. Aim for 650 words.",
    submission_idate: "2026-03-01T23:59:59Z",
    status: "pending",
    workshop: {
      title: "College Essay Workshop"
    },
    submissions: []
  },
  {
    id: "a2",
    title: "SAT Reading Practice",
    description: "Complete the reading section of Practice Test #3.",
    submission_idate: "2026-02-19T23:59:59Z",
    status: "submitted",
    workshop: {
      title: "Standardized Testing Prep"
    },
    submissions: [{ id: "sub1", status: "graded", feedback: "Excellent work!", score: 750 }]
  },
  {
    id: "a3",
    title: "Extracurricular List",
    description: "List your top 10 activities with descriptions.",
    submission_idate: "2026-02-25T23:59:59Z",
    status: "pending",
    workshop: {
      title: "Branding & Activities"
    },
    submissions: []
  }
];

export function BetaStudentAssignmentsContent() {
  const [query, setQuery] = useState("");

  const filteredAssignments = useMemo(() => {
    if (!query.trim()) return dummyAssignments;
    const q = query.toLowerCase();
    return dummyAssignments.filter(a =>
      a.title.toLowerCase().includes(q) ||
      (a.workshop?.title?.toLowerCase() || "").includes(q)
    );
  }, [query]);

  const handleAction = () => {
    showToastError({
      headerText: "Action Restricted",
      paragraphText: "This action is not available in the preview session.",
      direction: "right"
    });
  };

  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between flex-shrink-0">
        <h2 className="text-2xl font-semibold font-cal-sans text-gray-800">Your Assignments</h2>
      </div>

      <div className="flex-1 overflow-hidden min-h-0">
        <Card className="border-0 shadow-sm ring-1 ring-black/5 h-full flex flex-col overflow-hidden">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">All assignments</CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search assignments..."
                  className="pl-10 h-10 rounded-xl"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-0">
            <ScrollArea className="h-full px-6 py-3">
              <div className="space-y-4">
                {filteredAssignments.map((a) => (
                  <AssignmentCard
                    key={a.id}
                    assignment={a as any}
                    isOpen={false}
                    onOpenForm={handleAction}
                    refetch={async () => { }}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
