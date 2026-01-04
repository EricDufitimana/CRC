"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OpportunityTrackerHeader } from "./OpportunityTrackerHeader";
import { OpportunityTrackerGrid } from "./OpportunityTrackerGrid";
import { ReferOpportunityDialog } from "./ReferOpportunityDialog";
import { showToastSuccess, showToastError } from "@/components/toasts";
import { useUserData } from "@/hooks/useUserData";
import { Search, X, Inbox, Clock, CheckCircle, XCircle, Send, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Input } from "@/zenith/components/ui/input";
import { cn } from "@/zenith/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/zenith/components/ui/select";

const TABS = [
  { id: "requests", label: "New Opportunities", icon: Inbox },
  { id: "accepted", label: "Accepted", icon: CheckCircle },
  { id: "rejected", label: "Denied", icon: XCircle },
  { id: "referrals", label: "Referrals", icon: Send },
];

export function OpportunityTrackerContent() {
  const { adminId } = useUserData();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("requests");
  const [referralType, setReferralType] = useState("received"); // 'sent' or 'received'
  const [searchTerm, setSearchTerm] = useState("");
  const [isReferOpen, setIsReferOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);

  const { data: opportunities = [], isFetching } = useQuery({
    ...trpc.opportunityRequestsManagement.getOpportunityRequests.queryOptions({
      admin_id: adminId || undefined,
    }),
    enabled: !!adminId,
    refetchOnWindowFocus: false,
  });

  const { data: referrals = [] } = useQuery({
    ...trpc.opportunityRequestsManagement.getReferrals.queryOptions({
      admin_id: adminId || "",
      type: "all",
    }),
    enabled: !!adminId,
    refetchOnWindowFocus: false,
  });

  const statusMutation = useMutation({
    ...trpc.opportunityRequestsManagement.updateStatus.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["opportunityRequestsManagement", "getOpportunityRequests"]] });
      showToastSuccess({
        headerText: "Status Updated",
        paragraphText: "Opportunity status has been updated.",
        direction: "right"
      });
    },
    onError: (error) => {
      showToastError({
        headerText: "Update Failed",
        paragraphText: error.message,
        direction: "right"
      });
    }
  });

  // Filter based on tab
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.student_name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "requests") return opp.status === "pending" && !opp.referred;
    if (activeTab === "accepted") return opp.status === "accepted";
    if (activeTab === "rejected") return opp.status === "rejected";
    if (activeTab === "referrals") return false;

    return true;
  });

  // Map and filter referrals
  const referralItems = referrals
    .filter(ref => {
      if (activeTab !== "referrals") return false;
      const matchesSearch = ref.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ref.studentName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (referralType === "sent") return ref.type === "sent";
      if (referralType === "received") return ref.type === "received";

      return true;
    })
    .map(ref => ({
      ...ref,
      id: ref.id,
      title: ref.title,
      student_name: ref.studentName,
      status: ref.status === 'completed' ? 'accepted' : 'pending', // Infer status or rely on ref.status
      created_at: ref.submittedAt,
      deadline: ref.deadline,
      link: ref.link,
      isReferral: true,
      type: ref.type,
      referredBy: ref.referredBy,
      referredTo: ref.referredTo,
      ai_category: ref.ai_category,
    }));

  const handleStatusChange = (id: string, status: string) => {
    statusMutation.mutate({ id, status });
  };

  const handleRefer = (opp: any) => {
    setSelectedOpportunity(opp);
    setIsReferOpen(true);
  };

  const counts = {
    requests: opportunities.filter(o => o.status === "pending" && !o.referred).length,
    accepted: opportunities.filter(o => o.status === "accepted").length,
    rejected: opportunities.filter(o => o.status === "rejected").length,
    referrals: referrals.length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <OpportunityTrackerHeader />
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search opportunity or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 bg-white border-gray-200 shadow-none rounded-2xl focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:border-gray-300 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {activeTab === "referrals" && (
            <div className="w-full md:w-48 animate-in fade-in slide-in-from-left-4 duration-300">
              <Select value={referralType} onValueChange={setReferralType}>
                <SelectTrigger className="w-full rounded-2xl border-gray-200 shadow-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="received">
                    <div className="flex items-center gap-2">
                      <ArrowDownLeft className="h-4 w-4 text-green-600" />
                      <span>Received</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="sent">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4 text-orange-500" />
                      <span>Sent</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = counts[tab.id as keyof typeof counts];

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all relative outline-none focus:outline-none ring-0 focus:ring-0",
                  isActive
                    ? "text-green-700 bg-white border-b-2 border-green-500"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
                )}
                style={{ marginBottom: '-1px' }}
              >
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all",
                  isActive ? "bg-green-50 text-green-700" : "text-gray-600"
                )}>
                  <Icon className={cn("h-4 w-4", isActive ? "text-green-600" : "text-gray-400")} />
                  {tab.label}
                  {count > 0 && (
                    <span className={cn(
                      "ml-1 text-[10px] px-1.5 py-0.5 rounded-full",
                      isActive ? "bg-green-200 text-green-800" : "bg-gray-100 text-gray-500"
                    )}>
                      {count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full">
        <OpportunityTrackerGrid
          opportunities={activeTab === "referrals" ? (referralItems as any) : filteredOpportunities}
          isFetching={isFetching}
          onStatusChange={handleStatusChange}
          onRefer={handleRefer}
          activeTab={activeTab}
        />
      </div>

      <ReferOpportunityDialog
        open={isReferOpen}
        onOpenChange={setIsReferOpen}
        opportunity={selectedOpportunity}
        currentAdminId={adminId || ""}
      />
    </div>
  );
}
