"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpload } from "../../../../../zenith/src/components/ui/file-upload";
import { Loader2, Upload } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { showToastPromise } from "@/components/toasts";
import imageCompression from "browser-image-compression";

interface Assignment {
  id: string;
  title: string;
  submission_style: "google_link" | "file_upload";
}

interface SubmissionFormProps {
  assignment: Assignment;
  onCancel: () => void;
  onSuccess: () => void;
}

export function SubmissionForm({ assignment, onCancel, onSuccess }: SubmissionFormProps) {
  const trpc = useTRPC();
  const [googleLink, setGoogleLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const submitGoogleMutation = useMutation(trpc.studentDashboard.submitAssignmentGoogleLink.mutationOptions());
  const getUploadUrlMutation = useMutation(trpc.studentDashboard.getAssignmentUploadUrl.mutationOptions());
  const submitFileMutation = useMutation(trpc.studentDashboard.submitAssignmentFile.mutationOptions());

  async function compressImage(file: File) {
    if (!file) return null;
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      return await imageCompression(file, options);
    } catch (error) {
      console.error("Error compressing image:", error);
      return file;
    }
  }

  const handleGoogleSubmit = async () => {
    if (!googleLink.trim()) return;

    const promise = submitGoogleMutation.mutateAsync({
      assignmentId: assignment.id,
      googleDocLink: googleLink
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
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileSubmit = async () => {
    if (!file) return;

    setUploading(true);
    try {
      // 1. Get Signed URL
      const { signedUrl, path } = await getUploadUrlMutation.mutateAsync({
        assignmentId: assignment.id,
        filename: file.name,
        fileType: file.type
      });

      // 2. Upload File
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!uploadRes.ok) throw new Error('Failed to upload file');

      // 3. Submit Metadata
      const promise = submitFileMutation.mutateAsync({
        assignmentId: assignment.id,
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
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const isSubmitting = uploading || submitGoogleMutation.isPending || submitFileMutation.isPending;

  if (assignment.submission_style === 'google_link') {
    return (
      <div className="flex items-center gap-2">
        <Input
          placeholder="Paste Google Doc link"
          value={googleLink}
          onChange={(e) => setGoogleLink(e.target.value)}
          disabled={isSubmitting}
          className="w-80"
        />
        <Button 
          onClick={handleGoogleSubmit}
          size="sm" 
          disabled={isSubmitting || !googleLink.trim()} 
          className="bg-statColors-8 hover:bg-statColors-8/95 text-white shadow-md rounded-xl"
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
        </Button>
        <Button type="button" variant="ghost" size="sm" disabled={isSubmitting} onClick={onCancel}>Cancel</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <FileUpload
        multiple={false}
        accept="image/svg+xml,image/png,image/jpeg,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        maxFiles={1}
        value={file ? [file] : []}
        disabled={isSubmitting}
        onChange={async (fileList: File[]) => {
          const selectedFile = fileList?.[0] || null;
          if (selectedFile) {
            const compressed = await compressImage(selectedFile);
            setFile(compressed);
          } else {
            setFile(null);
          }
        }}
        onRemove={() => setFile(null)}
        placeholder={<span><strong>Click to upload</strong> or drag and drop</span>}
        helperText={<span>SVG, PNG, JPG, GIF, WebP, or PDF</span>}
        className="w-80"
      />
      <div className="flex items-center gap-2">
        <Button 
          onClick={handleFileSubmit}
          size="sm" 
          disabled={isSubmitting || !file} 
          className="bg-green-500 hover:bg-green-500/70 text-white rounded-xl shadow-md"
        >
          <Upload className="h-4 w-4 mr-1" />
          {isSubmitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : 'Upload File'}
        </Button>
        <Button type="button" variant="ghost" size="sm" disabled={isSubmitting} onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
