"use client";

import { useState } from "react";
import { EssayRequestsHeader } from "../admin/essay-requests/EssayRequestsHeader";
import { EssayRequestsGrid } from "../admin/essay-requests/EssayRequestsGrid";
import { Search, Inbox, Clock, CheckCircle, Send } from "lucide-react";
import { Input } from "@/zenith/components/ui/input";
import { cn } from "@/zenith/lib/utils";
import { showToastError } from "@/components/toasts/ToastError";

const TABS = [
  { id: "requests", label: "New Requests", icon: Inbox },
  { id: "pending", label: "In Review", icon: Clock },
  { id: "done", label: "Completed", icon: CheckCircle },
  { id: "referrals", label: "Referrals", icon: Send },
];

const dummyRequests = [
  {
    id: "er1",
    title: "Common App Personal Statement",
    student_name: "John Doe",
    grade: "Senior 6",
    word_count: 650,
    deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: "pending",
    essay_link: "#",
    referred: false
  },
  {
    id: "er2",
    title: "Stanford Supplement",
    student_name: "Jane Smith",
    grade: "Senior 6",
    word_count: 250,
    deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
    status: "in_review",
    essay_link: "#",
    referred: false
  }
];

export function BetaEssayRequestsContent() {
  const [activeTab, setActiveTab] = useState("requests");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRequests = dummyRequests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.student_name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === "requests") return req.status === "pending";
    if (activeTab === "pending") return req.status === "in_review";
    if (activeTab === "done") return req.status === "completed";
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
      <EssayRequestsHeader />

      <div className="flex flex-col gap-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by student or title..."
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
        <EssayRequestsGrid
          requests={filteredRequests as any}
          isFetching={false}
          onView={handleAction}
          onRefer={handleAction}
          onMarkDone={handleAction}
          activeTab={activeTab}
        />
      </div>
    </div>
  );
}
