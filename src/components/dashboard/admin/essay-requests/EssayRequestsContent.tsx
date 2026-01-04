"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EssayRequestsHeader } from "./EssayRequestsHeader";
import { EssayRequestsGrid } from "./EssayRequestsGrid";
import { ReferEssayDialog } from "./ReferEssayDialog";
import { showToastSuccess, showToastError } from "@/components/toasts";
import { useUserData } from "@/hooks/useUserData";
import { Search, X, Inbox, Clock, CheckCircle, Send, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Input } from "@/zenith/components/ui/input";
import { cn } from "@/zenith/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/zenith/components/ui/select";

const TABS = [
  { id: "requests", label: "New Requests", icon: Inbox },
  { id: "pending", label: "In Review", icon: Clock },
  { id: "done", label: "Completed", icon: CheckCircle },
  { id: "referrals", label: "Referrals", icon: Send },
];

export function EssayRequestsContent() {
  const { adminId } = useUserData();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("requests");
  const [referralType, setReferralType] = useState("received"); // 'sent' or 'received'
  const [searchTerm, setSearchTerm] = useState("");
  const [isReferOpen, setIsReferOpen] = useState(false);
  const [selectedEssay, setSelectedEssay] = useState<any>(null);

  const { data: requests = [], isFetching } = useQuery({
    ...trpc.essayRequestsManagement.getEssayRequests.queryOptions({
      admin_id: adminId || undefined,
    }),
    enabled: !!adminId,
    refetchOnWindowFocus: false,
  });

  const { data: referrals = [] } = useQuery({
    ...trpc.essayRequestsManagement.getReferrals.queryOptions({
      admin_id: adminId || "",
      type: "all",
    }),
    enabled: !!adminId,
    refetchOnWindowFocus: false,
  });

  const statusMutation = useMutation({
    ...trpc.essayRequestsManagement.updateStatus.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["essayRequestsManagement", "getEssayRequests"]] });
      showToastSuccess({
        headerText: "Status Updated",
        paragraphText: "Essay status has been updated.",
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
  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.student_name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "requests") return req.status === "pending" && !req.referred;
    if (activeTab === "pending") return req.status === "in_review" && !req.referred;
    if (activeTab === "done") return req.status === "completed";
    if (activeTab === "referrals") return false; // Handled separately if needed

    return true;
  });

  // Map and filter referrals
  const referralItems = referrals
    .filter(ref => {
      if (activeTab !== "referrals") return false;
      const matchesSearch = ref.essayTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ref.studentName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // Filter by sent/received
      if (referralType === "sent") return ref.type === "sent";
      if (referralType === "received") return ref.type === "received";

      return true;
    })
    .map(ref => ({
      id: ref.id,
      essayId: ref.essayId,
      title: ref.essayTitle,
      student_name: ref.studentName,
      grade: null,
      word_count: ref.wordCount,
      deadline: ref.deadline,
      created_at: ref.submittedAt || ref.referredAt,
      status: ref.status, // 'completed' or 'pending'
      essay_link: ref.essayLink,
      isReferral: true,
      type: ref.type,
      referredBy: ref.referredBy,
      referredTo: ref.referredTo,
    }));

  const handleView = (request: any) => {
    if (request.status === "pending") {
      statusMutation.mutate({ id: request.id, status: "in_review" });
    }
    window.open(request.essay_link, "_blank");
  };

  const handleRefer = (request: any) => {
    setSelectedEssay(request);
    setIsReferOpen(true);
  };

  const handleMarkDone = (request: any) => {
    statusMutation.mutate({ id: request.id, status: "completed" });
  };

  const counts = {
    requests: requests.filter(r => r.status === "pending" && !r.referred).length,
    pending: requests.filter(r => r.status === "in_review" && !r.referred).length,
    done: requests.filter(r => r.status === "completed").length,
    referrals: referrals.length,
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <EssayRequestsHeader />
      </div>

      {/* Controls Section: Search and Tabs */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by student or title..."
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

          {/* Referral Type Selector (Only visible on Referrals tab) */}
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

        {/* Horizontal Tabs */}
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

      {/* Grid Content */}
      <div className="w-full">
        <EssayRequestsGrid
          requests={activeTab === "referrals" ? (referralItems as any) : filteredRequests}
          isFetching={isFetching}
          onView={handleView}
          onRefer={handleRefer}
          onMarkDone={handleMarkDone}
          activeTab={activeTab}
        />
      </div>

      <ReferEssayDialog
        open={isReferOpen}
        onOpenChange={setIsReferOpen}
        essay={selectedEssay}
        currentAdminId={adminId || ""}
      />
    </div>
  );
}
