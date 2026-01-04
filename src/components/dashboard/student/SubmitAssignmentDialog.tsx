"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputWithRing } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ClipboardCheck, ArrowRight, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useTRPC } from "@/trpc/client";
import { showToastPromise } from "@/components/toasts";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "../../../../zenith/src/components/ui/command";
import { FileUpload } from "../../../../zenith/src/components/ui/file-upload";
import { z } from "zod";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

const googleLinkSchema = z.string().url("Please enter a valid URL").refine(
  (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('google.com') || urlObj.hostname.includes('docs.google.com');
    } catch {
      return false;
    }
  },
  { message: "Please enter a valid Google Docs link" }
);

export function SubmitAssignmentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const trpc = useTRPC();
  const [step, setStep] = useState<'select-workshop' | 'select-assignment' | 'submit'>('select-workshop');
  const [selectedWorkshop, setSelectedWorkshop] = useState<any | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [googleDocLink, setGoogleDocLink] = useState("");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [googleLinkError, setGoogleLinkError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: workshops } = useSuspenseQuery(trpc.studentDashboard.getAvailableWorkshops.queryOptions());

  const getUploadUrlMutation = useMutation(trpc.studentDashboard.getAssignmentUploadUrl.mutationOptions());
  const submitGoogleMutation = useMutation(trpc.studentDashboard.submitAssignmentGoogleLink.mutationOptions());
  const submitFileMutation = useMutation(trpc.studentDashboard.submitAssignmentFile.mutationOptions());

  const assignments = selectedWorkshop?.assignments || [];

  const resetForm = () => {
    setStep('select-workshop');
    setSelectedWorkshop(null);
    setSelectedAssignment(null);
    setGoogleDocLink("");
    setFileToUpload(null);
    setGoogleLinkError(null);
    setFileError(null);
    setUploading(false);
  };

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    if (selectedAssignment.submission_style === 'google_link') {
      // Validate
      const validation = googleLinkSchema.safeParse(googleDocLink);
      if (!validation.success) {
        setGoogleLinkError(validation.error.errors[0].message);
        return;
      }

      const promise = submitGoogleMutation.mutateAsync({
        assignmentId: selectedAssignment.id,
        googleDocLink
      });

      showToastPromise({
        promise,
        loadingText: 'Submitting assignment...',
        successText: 'Assignment submitted successfully',
        errorText: 'Failed to submit assignment',
        successHeaderText: 'Success',
        errorHeaderText: 'Error',
        direction: 'right'
      });

      try {
        await promise;
        onOpenChange(false);
      } catch (err) {
        console.error(err);
      }

    } else {
      // File upload
      if (!fileToUpload) {
        setFileError("Please select a file");
        return;
      }

      setUploading(true);
      // 1. Get Signed URL
      try {
        const { signedUrl, path } = await getUploadUrlMutation.mutateAsync({
          assignmentId: selectedAssignment.id,
          filename: fileToUpload.name,
          fileType: fileToUpload.type
        });

        // 2. Upload File
        const uploadRes = await fetch(signedUrl, {
          method: 'PUT',
          body: fileToUpload,
          headers: {
            'Content-Type': fileToUpload.type
          }
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload file');
        }

        // 3. Submit Metadata
        const promise = submitFileMutation.mutateAsync({
          assignmentId: selectedAssignment.id,
          filePath: path
        });

        showToastPromise({
          promise,
          loadingText: 'Finalizing submission...',
          successText: 'Assignment submitted successfully',
          errorText: 'Failed to finalize submission',
          successHeaderText: 'Success',
          errorHeaderText: 'Error',
          direction: 'right'
        });

        await promise;
        onOpenChange(false);

      } catch (err) {
        console.error(err);
        setFileError("Failed to upload assignment. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  const isSubmitting = submitGoogleMutation.isPending || submitFileMutation.isPending || getUploadUrlMutation.isPending || uploading;

  // Eye ref logic (omitted for brevity but can be added if needed)
  const anchorRef = useRef<HTMLDivElement | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl  [&>button]:!top-8 [&>button]:!hidden    bg-white rounded-2xl shadow-2xl border-0">
        <div className="relative">
          <div ref={anchorRef} className="absolute top-0 right-0 w-4 h-4"></div>
          {/* Decorative images omitted to keep code clean, user can add back logic if needed or I can copy from page.tsx */}
        </div>

        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl pb-4 font-bold text-gray-900 text-center">
            {step === 'select-workshop' && 'Select workshop'}
            {step === 'select-assignment' && 'Select assignment'}
            {step === 'submit' && 'Submit assignment'}
          </DialogTitle>
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className={`flex items-center ${step === 'select-workshop' ? '' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step === 'select-workshop' ? 'bg-yearcolors-s6 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
              <span className="ml-2 text-sm font-medium">Workshop</span>
            </div>
            <div className={`w-6 h-px ${step === 'select-assignment' ? 'bg-yearcolors-s6' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step === 'select-assignment' ? '' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step === 'select-assignment' ? 'bg-yearcolors-s6 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
              <span className="ml-2 text-sm font-medium">Assignment</span>
            </div>
            <div className={`w-6 h-px bg-gray-200`}></div>
            <div className={`flex items-center ${step === 'submit' ? '' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step === 'submit' ? 'bg-yearcolors-s6 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
              <span className="ml-2 text-sm font-medium">Submit</span>
            </div>
          </div>
        </DialogHeader>

        {step === 'select-workshop' && (
          <div className="">
            <div className="rounded-xl border bg-white">
              <Command className="bg-transparent">
                <CommandInput placeholder="Search workshops..." />
                <CommandList className=" overflow-visible">
                  {workshops?.length === 0 ? (
                    <CommandEmpty>No workshops found.</CommandEmpty>
                  ) : (
                    <CommandGroup heading="Available workshops" className="pb-4">
                      {workshops?.map((w) => (
                        <CommandItem
                          key={w.id}
                          onSelect={() => setSelectedWorkshop(w)}
                          value={`${w.title} ${w.date ?? ''}`}
                          className={`flex items-center gap-3 rounded-md transition-colors duration-150  bg-transparent ${selectedWorkshop?.id === w.id ? 'bg-transparent' : ''
                            }`}
                        >
                          <span className="h-8 w-8 rounded-full bg-yearcolors-s6 grid place-items-center flex-shrink-0">
                            <ClipboardCheck className="h-4 w-4 text-neutral-900" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">{w.title}</div>
                            <div className="flex items-center gap-2 mt-1">
                              {w.date && (
                                <div className="text-xs text-neutral-500">
                                  {new Date(w.date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                          {selectedWorkshop?.id === w.id && (
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </div>
            <div className="flex justify-between p-3 ">
              <Button variant="outline" className="rounded-xl px-8 text-sm" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button
                onClick={() => setStep('select-assignment')}
                disabled={!selectedWorkshop}
                className="bg-yearcolors-s6 hover:bg-yearcolors-s6/80 rounded-xl px-8 text-sm text-neutral-900 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'select-assignment' && (
          <div className="space-y-6">
            <div className="flex justify-start">
              {assignments.length === 0 ? (
                <div className="text-center py-12 w-full">
                  <p className="text-gray-500 text-sm">No assignments available for this workshop.</p>
                </div>
              ) : (
                assignments.map((a: any) => (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAssignment(a)}
                    className={`w-full max-w-md p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedAssignment?.id === a.id ? 'border-yearcolors-s6 bg-yearcolors-s6/10 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="h-8 w-8 rounded-full bg-yearcolors-s6 grid place-items-center flex-shrink-0">
                        <ClipboardCheck className="h-4 w-4 text-neutral-900" />
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{a.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">Submission style: {a.submission_style === 'google_link' ? 'Google link' : 'File upload'}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="outline" className="rounded-xl px-8 text-sm" onClick={() => setStep('select-workshop')}>Back</Button>
              <Button
                onClick={() => setStep('submit')}
                disabled={!selectedAssignment}
                className="bg-yearcolors-s6 hover:bg-yearcolors-s6/80 rounded-xl px-8 text-sm text-neutral-900 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'submit' && selectedAssignment && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{selectedWorkshop?.title}</p>
                  <p className="text-xs text-gray-500">{selectedAssignment.title}</p>
                </div>
                <span className="h-8 w-8 rounded-full bg-yearcolors-s6 grid place-items-center">
                  <ClipboardCheck className="h-4 w-4 text-neutral-900" />
                </span>
              </div>
            </div>
            {selectedAssignment.submission_style === 'google_link' ? (
              <div>
                <Label htmlFor="assignment-google-link">Google Docs Link</Label>
                <InputWithRing
                  id="assignment-google-link"
                  type="url"
                  placeholder="https://docs.google.com/document/..."
                  value={googleDocLink}
                  onChange={(e) => setGoogleDocLink(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className={`border transition-colors duration-200 ease-in-out rounded-xl ${googleLinkError ? 'border-red-500' : 'border-neutral-200'
                    }`}
                />
                {googleLinkError && (
                  <p className="text-xs text-red-500 mt-1">{googleLinkError}</p>
                )}
              </div>
            ) : (
              <div>
                <Label>Upload File</Label>
                <FileUpload
                  multiple={false}
                  accept="image/svg+xml,image/png,image/jpeg,image/gif, image/webp, application/pdf"
                  maxFiles={1}
                  value={fileToUpload ? [fileToUpload] : []}
                  onChange={(files) => {
                    const selectedFile = files?.[0] || null;
                    setFileToUpload(selectedFile);
                    setFileError(null);
                  }}
                  onRemove={() => {
                    setFileToUpload(null);
                    setFileError(null);
                  }}
                  disabled={isSubmitting}
                  className="mt-2"
                />
                {fileError && (
                  <p className="text-xs text-red-500 mt-1">{fileError}</p>
                )}
              </div>
            )}
            <div className="flex justify-between space-x-2 pt-2">
              <Button
                variant="outline"
                className="rounded-xl px-8 text-sm"
                type="button"
                onClick={() => setStep('select-assignment')}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-yearcolors-s6 hover:bg-yearcolors-s6/80 rounded-xl px-8 text-sm text-neutral-900 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
