"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/zenith/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/zenith/components/ui/dialog";
import { showToastSuccess, showToastError } from "@/components/toasts";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteAnnouncementDialogProps {
  announcement: any | null;
  onClose: () => void;
}

export function DeleteAnnouncementDialog({ announcement, onClose }: DeleteAnnouncementDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const deleteAnnouncementMutation = useMutation({
    ...trpc.announcementsManagement.deleteAnnouncement.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["announcementsManagement", "getAnnouncements"]] });
      showToastSuccess({
        headerText: 'Announcement Deleted',
        paragraphText: 'The announcement has been removed successfully',
        direction: 'right'
      });
      onClose();
    },
    onError: (error) => {
      showToastError({
        headerText: 'Delete Failed',
        paragraphText: error.message,
        direction: 'right'
      });
    }
  });

  const handleDelete = () => {
    if (announcement) {
      deleteAnnouncementMutation.mutate({ id: announcement.id });
    }
  };

  return (
    <Dialog open={!!announcement} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] rounded-[32px] p-8 border-none shadow-2xl bg-white">
        <DialogHeader className="mb-4">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 transition-transform duration-300 hover:scale-110">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-gray-900">Confirm Deletion</DialogTitle>
              <DialogDescription className="text-[15px] text-gray-500 max-w-[320px] mx-auto leading-relaxed">
                Are you sure you want to delete this announcement? This action is permanent and cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 h-12 rounded-2xl border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteAnnouncementMutation.isPending}
            className="flex-1 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg shadow-red-200 transition-all duration-200 disabled:opacity-70"
          >
            {deleteAnnouncementMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : null}
            Delete Announcement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
