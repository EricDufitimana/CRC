"use client";

import { Button } from "@/zenith/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/zenith/components/ui/dialog";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  deleteType: 'deactivate' | 'delete';
  isLoading?: boolean;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  deleteType,
  isLoading = false,
}: DeleteConfirmationDialogProps) {
  const isDelete = deleteType === 'delete';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-[33px] p-8 border-none shadow-[0_8px_40px_rgba(0,0,0,0.08)] bg-white ">
        <DialogHeader className="mb-4">
          <div className="flex flex-col items-center text-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full transition-transform duration-300 hover:scale-110 ${isDelete ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <AlertTriangle className="h-8 w-8" />
              )}
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Confirm {isDelete ? 'Delete' : 'Deactivate'}
              </DialogTitle>
              <DialogDescription className="text-[15px] text-gray-500 max-w-[320px] mx-auto leading-relaxed">
                Are you sure you want to {isDelete ? 'permanently delete' : 'deactivate'} this content? 
                {isDelete 
                  ? ' This action is permanent and cannot be undone.'
                  : ' It will be removed from the website but can be reactivated later.'
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-10 rounded-[10px] border border-[rgba(34,34,34,0.15)] bg-white text-[13px] font-semibold text-[rgb(34,34,34)] cursor-pointer transition-all duration-150 hover:bg-[rgba(34,34,34,0.04)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 flex-1 h-10 px-4 py-2 rounded-xl active:scale-95 text-white ${
              isDelete 
                ? 'bg-red-600 hover:bg-red-700 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(220,38,38,0.4)]' 
                : 'bg-amber-600 hover:bg-amber-700 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(217,119,6,0.4)]'
            }`}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isDelete ? 'Delete Permanently' : 'Deactivate Content'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

