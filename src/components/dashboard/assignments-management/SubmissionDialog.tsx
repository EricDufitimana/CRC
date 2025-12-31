"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../zenith/src/components/ui/dialog";
import { FileText } from "lucide-react";

interface SubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: {
    student_id: string;
    name: string;
    email: string;
    submitted_at: string | null;
    file_upload_link?: string | null;
  } | null;
  signedUrls: Record<string, string>;
  loadingUrls: Record<string, boolean>;
}

export function SubmissionDialog({
  open,
  onOpenChange,
  submission,
  signedUrls,
  loadingUrls,
}: SubmissionDialogProps) {
  if (!submission) return null;

  const urlKey = `${submission.student_id}-${submission.file_upload_link}`;
  const signedUrl = signedUrls[urlKey];
  const isLoading = loadingUrls[urlKey];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {submission.name}&apos;s Submission
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                {submission.name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{submission.name}</p>
                <p className="text-xs text-gray-600">{submission.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Submitted</p>
              <p className="text-xs font-medium text-gray-700">
                {submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="flex-1 min-h-0 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                <span className="ml-3 text-gray-600">Loading image...</span>
              </div>
            ) : !signedUrl ? (
              <div className="flex items-center justify-center p-8 text-gray-500">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No image available</p>
                </div>
              </div>
            ) : (
              <img
                src={signedUrl}
                alt={`${submission.name || 'Student'}'s submission`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const errorDiv = target.nextElementSibling as HTMLDivElement;
                  if (errorDiv) {
                    errorDiv.style.display = 'flex';
                  }
                }}
              />
            )}
            <div className="hidden w-full h-full items-center justify-center text-gray-500">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Failed to load image</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

