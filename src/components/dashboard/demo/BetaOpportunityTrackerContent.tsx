"use client";

import { useState } from "react";
import { OpportunityTrackerHeader } from "../admin/opportunity-tracker/OpportunityTrackerHeader";
import { OpportunityTrackerGrid } from "../admin/opportunity-tracker/OpportunityTrackerGrid";
import { Search, Inbox, CheckCircle, XCircle, Send } from "lucide-react";
import { Input } from "@/zenith/components/ui/input";
import { cn } from "@/zenith/lib/utils";
import { showToastError } from "@/components/toasts/ToastError";

const TABS = [
  { id: "requests", label: "New Opportunities", icon: Inbox },
  { id: "accepted", label: "Accepted", icon: CheckCircle },
  { id: "rejected", label: "Denied", icon: XCircle },
  { id: "referrals", label: "Referrals", icon: Send },
];

const dummyOpportunities = [
  {
    id: "o1",
    title: "Google Summer of Code",
    student_name: "Alex Johnson",
    status: "pending",
    created_at: new Date().toISOString(),
    deadline: new Date(Date.now() + 86400000 * 10).toISOString(),
    link: "#",
    referred: false
  },
  {
    id: "o2",
    title: "MIT Research Internship",
    student_name: "Sarah Williams",
    status: "accepted",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    deadline: new Date(Date.now() + 86400000 * 20).toISOString(),
    link: "#",
    referred: false
  }
];

export function BetaOpportunityTrackerContent() {
  const [activeTab, setActiveTab] = useState("requests");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOpportunities = dummyOpportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.student_name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === "requests") return opp.status === "pending";
    if (activeTab === "accepted") return opp.status === "accepted";
    if (activeTab === "rejected") return opp.status === "denied";
    return true;
  });

  const handleAction = () => {
    showToastError({
      headerText: "Demo Action",
      paragraphText: "This action is disabled in the demo dashboard.",
      direction: "right"
    });
  };

  return (
    <div className="space-y-8 p-8">
      <OpportunityTrackerHeader />

      <div className="flex flex-col gap-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search opportunity or student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-2xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all relative",
                  isActive ? "text-green-700 bg-white border-b-2 border-green-500" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
                )}
              >
                <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all", isActive ? "bg-green-50 text-green-700" : "text-gray-600")}>
                  <Icon className={cn("h-4 w-4", isActive ? "text-green-600" : "text-gray-400")} />
                  {tab.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full">
        <OpportunityTrackerGrid
          opportunities={filteredOpportunities as any}
          isFetching={false}
          onStatusChange={handleAction}
          onRefer={handleAction}
          activeTab={activeTab}
        />
      </div>
    </div>
  );
}
