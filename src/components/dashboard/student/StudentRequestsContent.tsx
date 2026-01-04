"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../zenith/src/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { RequestCard } from "./requests/RequestCard";
import { SubmitOpportunityDialog } from "./requests/SubmitOpportunityDialog";
import { SubmitEssayDialog } from "./requests/SubmitEssayDialog";
import NoOpportunitiesFound from "@/components/NotFound/NoOpportunitiesFound";
import NoEssaysFound from "@/components/NotFound/NoEssaysFound";

type RequestType = "opportunities" | "essays";

export function StudentRequestsContent() {
  const trpc = useTRPC();
  const [query, setQuery] = useState("");
  const [requestType, setRequestType] = useState<RequestType>("opportunities");
  const [submitOpportunityOpen, setSubmitOpportunityOpen] = useState(false);
  const [submitEssayOpen, setSubmitEssayOpen] = useState(false);

  const { data: opportunities, refetch: refetchOpportunities } = useSuspenseQuery(
    trpc.studentDashboard.getOpportunities.queryOptions()
  );
  const { data: essays, refetch: refetchEssays } = useSuspenseQuery(
    trpc.studentDashboard.getEssays.queryOptions()
  );
  const { data: fellows } = useSuspenseQuery(
    trpc.studentDashboard.getFellows.queryOptions()
  );

  const currentRows = requestType === "opportunities" ? opportunities : essays;

  const filteredRows = useMemo(() => {
    if (!query.trim()) return currentRows;
    const q = query.toLowerCase();
    return currentRows.filter((row) => 
      row.title.toLowerCase().includes(q) ||
      (row.description && row.description.toLowerCase().includes(q))
    );
  }, [currentRows, query]);

  const handleRefetch = () => {
    if (requestType === "opportunities") {
      refetchOpportunities();
    } else {
      refetchEssays();
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 flex-shrink-0 group">
        <Link href="/dashboard/student">
          <Button variant="ghost" size="sm" className="h-8 px-2 hover:scale-110 hover:translate-x-[-2px] transition-all duration-200">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-semibold font-cal-sans">Requests</h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        <Card className="border-0 shadow-sm ring-1 ring-black/5 m-0.5 h-[calc(100%-6px)] flex flex-col overflow-hidden min-h-0">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Your submissions</CardTitle>
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Search requests..." 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  className="h-9 w-64 rounded-xl" 
                />
                <Select value={requestType} onValueChange={(value: RequestType) => setRequestType(value)}>
                  <SelectTrigger className="w-40 h-9 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opportunities">Opportunities</SelectItem>
                    <SelectItem value="essays">Essays</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => {
                    if (requestType === "opportunities") {
                      setSubmitOpportunityOpen(true);
                    } else {
                      setSubmitEssayOpen(true);
                    }
                  }} 
                  className={`${
                    requestType === "opportunities" 
                      ? "bg-statColors-1 hover:bg-statColors-1/90 text-neutral-900 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)]"
                      : "bg-orange-500 hover:bg-orange-600 text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(240,139,81,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(240,139,81,0.1)]"
                  } text-sm rounded-xl h-9 transition duration-200`}
                >
                  Submit {requestType === "opportunities" ? "opportunity" : "essay"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-0">
            <ScrollArea className="h-full px-6 py-3">
              {filteredRows.length === 0 ? (
                <div className="h-full w-full flex flex-col items-center justify-center py-12 text-center">
                  {requestType === "opportunities" ? (
                    <NoOpportunitiesFound />
                  ) : (
                    <NoEssaysFound />
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRows.map((row) => (
                    <RequestCard
                      key={row.id}
                      {...row}
                      wordCount={'word_count' in row ? row.word_count : undefined}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Submit Opportunity Dialog */}
      <SubmitOpportunityDialog
        open={submitOpportunityOpen}
        onOpenChange={setSubmitOpportunityOpen}
        fellows={fellows}
        onSuccess={handleRefetch}
      />

      {/* Submit Essay Dialog */}
      <SubmitEssayDialog
        open={submitEssayOpen}
        onOpenChange={setSubmitEssayOpen}
        fellows={fellows}
        onSuccess={handleRefetch}
      />
    </div>
  );
}
