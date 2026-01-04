"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/zenith/components/ui/dialog";
import { Button } from "@/zenith/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showToastSuccess, showToastError } from "@/components/toasts";
import { Loader2, User, Check, Send } from "lucide-react";

interface ReferEssayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  essay: any;
  currentAdminId: string;
}

export function ReferEssayDialog({ open, onOpenChange, essay, currentAdminId }: ReferEssayDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);

  const { data: admins = [], isFetching } = useQuery({
    ...trpc.essayRequestsManagement.getAdmins.queryOptions(),
    enabled: open,
  });

  const mutation = useMutation({
    ...trpc.essayRequestsManagement.deferTo.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["essayRequestsManagement", "getEssayRequests"]] });
      queryClient.invalidateQueries({ queryKey: [["essayRequestsManagement", "getReferrals"]] });
      showToastSuccess({
        headerText: "Essay Referred",
        paragraphText: "The essay has been successfully referred.",
        direction: "right"
      });
      onOpenChange(false);
      setSelectedAdminId(null);
    },
    onError: (error) => {
      showToastError({
        headerText: "Referral Failed",
        paragraphText: error.message,
        direction: "right"
      });
    }
  });

  const handleRefer = () => {
    if (!selectedAdminId || !essay) return;
    mutation.mutate({
      essay_id: essay.id,
      from_admin_id: currentAdminId,
      to_admin_id: selectedAdminId,
    });
  };

  const filteredAdmins = admins.filter(a => a.id !== currentAdminId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6 border-gray-100 shadow-none">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold  flex items-center gap-2 text-gray-900">
            Refer Essay Request
          </DialogTitle>
          {essay && (
            <DialogDescription className="text-gray-500 mt-1">
              Select a team member to review &quot;{essay.title}&quot;
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {isFetching ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-50 animate-pulse rounded-2xl" />
              ))
            ) : filteredAdmins.length === 0 ? (
              <p className="text-center py-8 text-gray-400 text-sm italic">No other reviewers available.</p>
            ) : (
              filteredAdmins.map((admin) => (
                <button
                  key={admin.id}
                  onClick={() => setSelectedAdminId(admin.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 ${
                    selectedAdminId === admin.id
                      ? "bg-green-50 border-green-200"
                      : "bg-white border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${selectedAdminId === admin.id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      <User className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className={`text-sm font-normal ${selectedAdminId === admin.id ? 'text-green-900' : 'text-gray-900'}`}>{admin.name}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-light">{admin.role}</div>
                    </div>
                  </div>
                  {selectedAdminId === admin.id && (
                    <Check className="h-5 w-5 text-green-600" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="pt-6 flex gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl font-medium border border-dark/40 text-dark flex-1 h-11 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRefer}
            disabled={!selectedAdminId || mutation.isPending}
            className="bg-secondary hover:bg-secondary/80 text-white rounded-xl font-bold shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] flex-[1.5] h-11 transition-all active:scale-95"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Referring...
              </>
            ) : (
              "Confirm Referral"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
