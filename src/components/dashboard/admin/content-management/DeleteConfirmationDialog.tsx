"use client";

import { Button } from "@/zenith/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/zenith/components/ui/dialog";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  deleteType: 'deactivate' | 'delete';
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  deleteType,
}: DeleteConfirmationDialogProps) {
  const isDelete = deleteType === 'delete';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm {isDelete ? 'Delete' : 'Deactivate'}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-500 text-md">
            Are you sure you want to {isDelete ? 'permanently delete' : 'deactivate'} this content? 
            {isDelete 
              ? ' This action cannot be undone and will remove all data permanently.'
              : ' It will be removed from the website but can be reactivated later.'
            }
          </p>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {isDelete ? 'Delete Permanently' : 'Deactivate'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

