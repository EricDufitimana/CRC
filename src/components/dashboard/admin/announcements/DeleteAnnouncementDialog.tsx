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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <DialogTitle>Confirm Delete</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete this announcement? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteAnnouncementMutation.isPending}
            className="rounded-xl bg-red-600 hover:bg-red-700 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(220,38,38,0.4)]"
          >
            {deleteAnnouncementMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Delete Announcement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
