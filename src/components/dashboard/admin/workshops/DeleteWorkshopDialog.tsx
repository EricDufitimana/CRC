"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/zenith/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/zenith/components/ui/dialog";
import { showToastSuccess, showToastError } from "@/components/toasts";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteWorkshopDialogProps {
  workshopId: string | null;
  onClose: () => void;
}

export function DeleteWorkshopDialog({ workshopId, onClose }: DeleteWorkshopDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const deleteWorkshopMutation = useMutation({
    ...trpc.workshopsManagement.deleteWorkshop.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['workshopsManagement', 'getWorkshopsByCategory']] });
      showToastSuccess({
        headerText: 'Workshop Deleted',
        paragraphText: 'The workshop has been removed successfully',
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
    if (workshopId) {
      deleteWorkshopMutation.mutate({ id: workshopId });
    }
  };

  return (
    <Dialog open={!!workshopId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle>Confirm Delete</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete this workshop? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteWorkshopMutation.isPending}
            className="rounded-xl bg-red-600 hover:bg-red-700 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(220,38,38,0.4)]"
          >
            {deleteWorkshopMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Delete Workshop
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
