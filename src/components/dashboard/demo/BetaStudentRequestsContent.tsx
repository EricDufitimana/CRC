"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/zenith/components/ui/card";
import { Button } from "@/zenith/components/ui/button";
import { Input } from "@/zenith/components/ui/input";
import { ScrollArea } from "@/zenith/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/zenith/components/ui/select";
import { Search, Plus } from "lucide-react";
import { RequestCard } from "../student/requests/RequestCard";
import { showToastError } from "@/components/toasts/ToastError";

// Dummy data for Demo
const dummyOpportunities = [
  {
    id: "opp1",
    title: "Summer Research Program at MIT",
    description: "Looking for guidance on the application process and essay review.",
    status: "pending",
    created_at: "2026-02-20T10:30:00Z",
    type: "opportunity"
  },
  {
    id: "opp2",
    title: "Yale Young Global Scholars",
    description: "Successfully submitted the application with CRC support.",
    status: "approved",
    created_at: "2026-02-10T14:15:00Z",
    type: "opportunity"
  }
];

const dummyEssays = [
  {
    id: "ess1",
    title: "Common App Personal Statement",
    description: "Final review for my main college essay.",
    status: "reviewing",
    created_at: "2026-02-18T09:00:00Z",
    type: "essay",
    word_count: 642
  },
  {
    id: "ess2",
    title: "Stanford Supplemental Essay",
    description: "Why Stanford? draft 2.",
    status: "approved",
    created_at: "2026-02-15T16:45:00Z",
    type: "essay",
    word_count: 245
  }
];

interface BetaStudentRequestsContentProps {
  initialType?: "opportunities" | "essays";
}

export function BetaStudentRequestsContent({ initialType = "opportunities" }: BetaStudentRequestsContentProps) {
  const [query, setQuery] = useState("");
  const [requestType, setRequestType] = useState<"opportunities" | "essays">(initialType);

  const currentRows = requestType === "opportunities" ? dummyOpportunities : dummyEssays;

  const filteredRows = useMemo(() => {
    if (!query.trim()) return currentRows;
    const q = query.toLowerCase();
    return currentRows.filter((row) =>
      row.title.toLowerCase().includes(q) ||
      (row.description && row.description.toLowerCase().includes(q))
    );
  }, [currentRows, query]);

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
        <h2 className="text-2xl font-semibold font-cal-sans text-gray-800">Your Requests</h2>
      </div>

      <div className="flex-1 overflow-hidden min-h-0">
        <Card className="border-0 shadow-sm ring-1 ring-black/5 h-full flex flex-col overflow-hidden">
          <CardHeader className="pb-3 flex-shrink-0 border-b border-gray-100">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <CardTitle className="text-base">Submissions</CardTitle>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setRequestType("opportunities")}
                    className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${requestType === 'opportunities' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Opportunities
                  </button>
                  <button
                    onClick={() => setRequestType("essays")}
                    className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${requestType === 'essays' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Essays
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Search requests..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-10 pl-10 rounded-xl"
                  />
                </div>
                <Button onClick={handleAction} className="rounded-xl bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20">
                  <Plus className="h-4 w-4 mr-2" />
                  New {requestType === "opportunities" ? "Opportunity" : "Essay"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-0">
            <ScrollArea className="h-full px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRows.map((row) => (
                  <RequestCard
                    key={row.id}
                    {...row as any}
                    wordCount={'word_count' in row ? row.word_count : undefined}
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
