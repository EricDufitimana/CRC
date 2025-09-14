"use client";

import { useEffect, useState, useActionState, startTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../zenith/src/components/ui/card";
import { Button } from "../../../../../../zenith/src/components/ui/button";
import { Badge } from "../../../../../../zenith/src/components/ui/badge";
import { Input } from "../../../../../../zenith/src/components/ui/input";
import { Skeleton } from "../../../../../../zenith/src/components/ui/skeleton";
import { FileUpload } from "../../../../../../zenith/src/components/ui/file-upload";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, ClipboardCheck, Upload, AlertCircle, Search, Check, Loader2, FileText, X } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { submitAssignmentHandler } from "@/actions/assignments/submitAssignmentHandler";
import { Alert, AlertDescription, AlertTitle } from "../../../../../../zenith/src/components/ui/alert";
import imageCompression from "browser-image-compression";
import { showToastPromise } from "@/components/toasts";

type AssignmentRow = {
  id: string;
  title: string;
  description: string;
  submission_style: "google_link" | "file_upload";
  due_date: string | null;
  created_at?: string | null;
  workshop: { id: string; title: string } | null;
  status: "submitted" | "not_submitted";
  submission: {
    id: string;
    submitted_at: string;
    google_doc_link: string | null;
    file_upload_link: string | null;
  } | null;
};

export default function StudentAssignmentsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AssignmentRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [googleLinks, setGoogleLinks] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const { userId, studentId, isLoading: userDataLoading } = useUserData();
  const [refreshKey, setRefreshKey] = useState(0);
  const [openFormFor, setOpenFormFor] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Loading states for form submissions - now handled by useActionState
  
  // Toast promise wrapper for useActionState integration
  const [toastPromise, setToastPromise] = useState<{
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  } | null>(null);

  // Handle assignment submission with useActionState
  const handleAssignmentSubmission = async (prevState: any, formData: FormData) => {
    console.log('🔍 handleAssignmentSubmission: Starting submission process...');
    console.log('🔍 handleAssignmentSubmission: prevState:', prevState);
    console.log('🔍 handleAssignmentSubmission: formData entries:', Array.from(formData.entries()));
    
    if (!studentId) {
      console.error('❌ handleAssignmentSubmission: Student ID not found');
      return { success: false, message: 'Student ID not found.' };
    }
    
    // Get data from form
    const assignmentId = formData.get('assignment_id') as string;
    const submissionStyle = formData.get('submission_style') as string;
    
    console.log('🔍 handleAssignmentSubmission: Extracted form data:', {
      assignmentId,
      submissionStyle,
      studentId,
      hasGoogleLink: !!formData.get('google_doc_link'),
      hasFile: !!formData.get('file')
    });
    
    // Validate assignment selection
    const assignment = rows.find(a => a.id === assignmentId);
    if (!assignment) {
      console.error('❌ handleAssignmentSubmission: Assignment not found in rows:', assignmentId);
      console.log('🔍 handleAssignmentSubmission: Available assignments:', rows.map(a => ({ id: a.id, title: a.title })));
      return { success: false, message: 'Assignment not found.' };
    }
    
    console.log('🔍 handleAssignmentSubmission: Found assignment:', assignment);
    
    // Add student_id to form data
    formData.append('student_id', String(studentId));
    
    // Validate and add submission-specific data
    if (submissionStyle === 'google_link') {
      const link = googleLinks[assignment.id] || "";
      if (!link.trim()) {
        return { success: false, message: 'Please provide a Google Doc link.' };
      }
      formData.append('google_doc_link', link);
      console.log('🔗 Adding Google link to form:', link);
    } else if (submissionStyle === 'file_upload') {
      if (!fileToUpload) {
        return { success: false, message: 'Please select a file to upload.' };
      }
      formData.append('file', fileToUpload);
      console.log('📁 Adding file to form:', fileToUpload.name, fileToUpload.size, fileToUpload.type);
    }
    
    console.log('📤 Final FormData contents:', Array.from(formData.entries()));
    
    try {
      const result = await submitAssignmentHandler(prevState, formData);
      console.log('✅ Submission result:', result);
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Submission error:', error);
      return { success: false, message: `Submission error: ${errorMessage}` };
    }
  };

  // Remove the manual form submission handler since we're using useActionState action

  const [assignmentState, assignmentFormAction, isAssignmentPending] = useActionState(handleAssignmentSubmission, {
    success: false,
    message: ''
  });

  // Create a promise that resolves/rejects based on action state
  const createAssignmentPromise = () => {
    return new Promise((resolve, reject) => {
      setToastPromise({ resolve, reject });
    });
  };

  // Form submit handler for toast integration
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const assignmentId = e.currentTarget.getAttribute('data-assignment-id') || '';
    console.log('🚀 handleFormSubmit: Form submission started for assignment:', assignmentId);
    
    // Create the promise for the toast
    const assignmentPromise = createAssignmentPromise();
    
    // Show your existing toast structure
    showToastPromise({
      promise: assignmentPromise,
      loadingText: 'Submitting assignment...',
      successText: 'Your assignment is in. Keep up the good work!',
      errorText: 'Failed to submit assignment. Please try again.',
      successHeaderText: 'Assignment Submitted Successfully',
      errorHeaderText: 'Assignment Submission Failed',
      direction: 'right'
    });
    
    // Handle the promise resolution for form reset
    assignmentPromise.then(() => {
      console.log('✅ handleFormSubmit: Promise resolved, resetting form...');
      // Reset form state on success
      setOpenFormFor(null);
      setGoogleLinks((s) => ({ ...s, [assignmentId]: '' }));
      setFiles((s) => ({ ...s, [assignmentId]: null }));
      setFileToUpload(null);
      setRefreshKey((k) => k + 1);
    }).catch(() => {
      console.log('❌ handleFormSubmit: Promise rejected, assignment submission failed');
      // Error handling if needed
    });
    
    // Submit the form using useActionState with startTransition
    const formData = new FormData(e.currentTarget);
    console.log('🔍 handleFormSubmit: Calling assignmentFormAction with formData:', Array.from(formData.entries()));
    
    // Fix: Wrap in startTransition for better React state management
    startTransition(() => {
      assignmentFormAction(formData);
    });
  };

  // Resolve/reject promise based on action state
  useEffect(() => {
    if (!isAssignmentPending && toastPromise) {
      console.log('🔍 Toast promise effect: Resolving promise based on state:', assignmentState);
      if (assignmentState.success) {
        // Resolve the promise (triggers success toast)
        console.log('✅ Toast promise effect: Resolving promise with success');
        toastPromise.resolve(assignmentState);
      } else if (assignmentState.message && !assignmentState.success) {
        // Reject the promise (triggers error toast)
        console.log('❌ Toast promise effect: Rejecting promise with error:', assignmentState.message);
        toastPromise.reject(new Error(assignmentState.message));
      }
      
      // Clear the promise
      setToastPromise(null);
    }
  }, [assignmentState, isAssignmentPending, toastPromise]);

  // Remove the old assignment state effect since we're now using the toast promise system

  // Track when submission is in progress
  useEffect(() => {
    if (isAssignmentPending) {
      console.log('🔍 Assignment submission in progress...');
      // The loading state is now shown in the UI via isAssignmentPending
      // Success/error toasts will be shown by the assignmentState effect
    }
  }, [isAssignmentPending]);

  // Update loading state based on user data loading
  useEffect(() => {
    console.log('🔍 Loading state effect:', { userDataLoading, studentId, loading });
    if (userDataLoading) {
      console.log('🔍 Setting loading to true (user data loading)');
      setLoading(true);
      setError(null); // Clear any previous errors while loading
    } else if (studentId) {
      console.log('🔍 User data loaded, studentId found:', studentId);
      // Keep loading true while fetching assignments
      // setLoading(false) will be called after assignments are fetched
    } else if (!userDataLoading && !studentId && !loading) {
      console.log('🔍 No student ID found, showing error');
      // Only show error if we're not loading and have no student ID
      setError("Student ID not found. Please try refreshing the page.");
      setLoading(false);
    }
  }, [userDataLoading, studentId, loading]);

  useEffect(() => {
    if (!studentId) return;
    let canceled = false;
    const fetchAssignments = async () => {
      try {
        setError(null);
        setLoading(true); // Ensure loading is true when starting to fetch assignments
        const listResp = await fetch(`/api/assignments/for-student?studentId=${studentId}`);
        if (!listResp.ok) throw new Error("Failed to fetch assignments");
        const list = (await listResp.json()) as AssignmentRow[];
        if (!canceled) setRows(Array.isArray(list) ? list : []);
      } catch (e: any) {
        if (!canceled) setError(e?.message || "Failed to load assignments");
      } finally {
        if (!canceled) setTimeout(() => setLoading(false), 250);
      }
    };
    fetchAssignments();
    return () => {
      canceled = true;
    };
  }, [studentId, refreshKey]);

 

  const timeAgo = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const intervals: [number, string][] = [
      [31536000, 'year'],
      [2592000, 'month'],
      [604800, 'week'],
      [86400, 'day'],
      [3600, 'hour'],
      [60, 'minute'],
      [1, 'second'],
    ];
    for (const [intervalSeconds, label] of intervals) {
      const count = Math.floor(seconds / intervalSeconds);
      if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;
    }
    return 'just now';
  };

  const formatDue = (iso: string | null) => {
    if (!iso) return { month: "—", day: "—", year: "" };
    const d = new Date(iso);
    return {
      month: d.toLocaleString("en-US", { month: "short" }),
      day: String(d.getDate()).padStart(2, "0"),
      year: String(d.getFullYear()),
    };
  };

  const getRowStatus = (a: AssignmentRow) => {
    const now = Date.now();
    const dueMs = a.due_date ? new Date(a.due_date).getTime() : null;
    if (a.status === "submitted") return { label: "CLOSED", color: "bg-neutral-200 text-neutral-700 hover:bg-neutral-200" };
    if (dueMs !== null && dueMs < now) return { label: "OVERDUE", color: "bg-red-100 text-red-700 hover:bg-red-100" };
    return { label: "ACTIVE", color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" };
  };

  async function compressImage(file: File) {
    if(!file) return null;
    try{
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      console.log("Original size:", file.size / 1024 / 1024, "MB");
      console.log("Compressed size:", compressedFile.size / 1024 / 1024, "MB");
      return compressedFile;
    } catch (error) {
      console.error("Error compressing image:", error);
      return null;
    }
  }
  


  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden ">
              {/* Header */}
        <div className="flex items-center gap-3 flex-shrink-0 group">
          <Link href="/dashboard/student">
            <Button variant="ghost" size="sm" className="h-8 px-2 hover:scale-110 hover:translate-x-[-2px] transition-all duration-200"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <h2 className="text-2xl font-semibold font-cal-sans">Assignments</h2>
        </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden min-h-0 ">
        <Card className="border-0 shadow-sm ring-1 ring-black/5 m-0.5 h-[calc(100%-6px)] flex flex-col overflow-hidden min-h-0">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">All assignments</CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title or workshop..."
                  className="pl-8 h-9 rounded-xl"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-0">
            <ScrollArea className="h-full px-6 py-3">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Failed to load</AlertTitle>
              <AlertDescription>
                {error}
                <Button variant="outline" size="sm" className="ml-3" onClick={() => setRefreshKey((k) => k + 1)}>Retry</Button>
              </AlertDescription>
            </Alert>
          )}
          {loading || userDataLoading || !studentId ? (
            <div className="space-y-4">
              {Array.from({ length: 5}).map((_, i) => (
                <div key={`row-skel-${i}`} className="rounded-xl border border-neutral-100 p-0 overflow-hidden bg-white">
                  <div className="flex items-stretch">
                    {/* Left rail skeleton */}
                    <div className="w-28 shrink-0 border-r border-neutral-100 bg-neutral-50 py-4 flex flex-col items-center justify-center gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <div className="text-center">
                        <Skeleton className="h-3 w-10 mx-auto mb-1" />
                        <Skeleton className="h-6 w-12 mx-auto mb-1" />
                        <Skeleton className="h-3 w-8 mx-auto" />
                      </div>
                    </div>
                    {/* Main body skeleton */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-3 w-1/2 mt-2" />
                          <Skeleton className="h-4 w-3/4 mt-3" />
                        </div>
                        <Skeleton className="h-9 w-28 rounded-md" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !studentId && !userDataLoading ? (
            <div className="h-[40vh] w-full flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Student ID Not Found</h3>
              <p className="text-neutral-500 mb-4">Unable to load assignments without a valid student ID.</p>
              <Button onClick={() => window.location.reload()} variant="outline">Refresh Page</Button>
            </div>
          ) : rows.length === 0 ? (
            <div className="h-[40vh] w-full flex flex-col items-center justify-center py-8 text-center">
              <Image src="/images/dashboard/empty-assignments.png" alt="No assignments" width={260} height={260} className="opacity-95" />
            </div>
          ) : (
            <div className="space-y-4">
              {rows
                .filter((a) => {
                  if (!query.trim()) return true;
                  const q = query.toLowerCase();
                  return (
                    a.title.toLowerCase().includes(q) ||
                    (a.workshop?.title?.toLowerCase() || "").includes(q)
                  );
                })
                .slice((page - 1) * pageSize, page * pageSize)
                .map((a) => {
                const due = formatDue(a.due_date);
                const rowStatus = getRowStatus(a);
                const isOpen = openFormFor === a.id;
                return (
                  <div key={a.id} className="rounded-xl border border-neutral-100 p-0 overflow-hidden bg-white">
                    <div className="flex items-stretch">
                      {/* Left date/status rail */}
                      <div className="w-28 shrink-0 flex flex-col items-center justify-center gap-2 border-r border-neutral-100 bg-neutral-50 py-4">
                        <Badge className={`text-[10px] tracking-wide ${rowStatus.color}`}>{rowStatus.label}</Badge>
                        <div className="text-center">
                          <div className="text-xs text-neutral-500 uppercase">{due.month}</div>
                          <div className="text-2xl font-semibold leading-none">{due.day}</div>
                          <div className="text-[10px] text-neutral-400">{due.year}</div>
                        </div>
                      </div>

                      {/* Main body */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{a.title}</p>
                              <Badge className={`${a.status === 'submitted' ? 'bg-green-200 border border-green-600 hover:bg-green-200  text-green-600' : 'bg-red-200 border border-red-600 text-red-600 hover:bg-red-200'} text-[10px]`}>{a.status === 'submitted' ? 'Submitted' : 'Not submitted'}</Badge>
                            </div>
                            <p className="text-xs text-neutral-500 truncate">
                              {a.workshop?.title ? a.workshop.title : 'Workshop'} • {a.submission_style === 'google_link' ? 'Google link' : 'File upload'}
                              {a.created_at ? ` • Posted ${timeAgo(a.created_at)}` : ''}
                            </p>
                            {a.description && (
                              <p className="mt-2 text-xs text-neutral-650 line-clamp-2">{a.description}</p>
                            )}
                          </div>

                          {/* Loud submit action */}
                          <div className="flex items-center gap-3">
                            {!isOpen && a.status !== 'submitted' ? (
                              <Button
                                onClick={() => setOpenFormFor(a.id)}
                                disabled={isAssignmentPending}
                                className={`relative overflow-hidden text-white shadow-md rounded-xl shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200 bg-orange-500 hover:bg-orange-500/70`}
                              >
                                <span className="pointer-events-none absolute inset-0 animate-pulse bg-white/10" />
                                Submit now
                              </Button>
                            ) : null}
                          </div>
                        </div>

                      {/* Expandable submission form */}
                        {isOpen && (
                          <div className="mt-4 rounded-lg border border-neutral-100 p-3 bg-neutral-50">
                           
                            {a.submission_style === 'google_link' ? (
                              <form onSubmit={handleFormSubmit} data-assignment-id={a.id} className="space-y-2">
                                <input type="hidden" name="assignment_id" value={a.id} />
                                <input type="hidden" name="submission_style" value="google_link" />
                                <input type="hidden" name="student_id" value={studentId || ''} />
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="Paste Google Doc link"
                                  value={googleLinks[a.id] || ''}
                                  onChange={(e) => setGoogleLinks((s) => ({ ...s, [a.id]: e.target.value }))}
                                  disabled={isAssignmentPending}
                                  className="w-80"
                                />
                                  <Button 
                                    type="submit"
                                    size="sm" 
                                    disabled={isAssignmentPending || !googleLinks[a.id]?.trim()} 
                                    className="bg-statColors-8 hover:bg-statColors-8/95 text-white  shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200"
                                  >
                                    {isAssignmentPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
                                </Button>
                                  <Button type="button" variant="ghost" size="sm" disabled={isAssignmentPending} onClick={() => setOpenFormFor(null)}>Cancel</Button>
                              </div>
                              </form>
                            ) : (
                              <form onSubmit={handleFormSubmit} data-assignment-id={a.id} className="space-y-3">
                                <input type="hidden" name="assignment_id" value={a.id} />
                                <input type="hidden" name="submission_style" value="file_upload" />
                                <input type="hidden" name="student_id" value={studentId || ''} />
                                <div className="flex items-center gap-2">
                                  <FileUpload
                                    multiple={false}
                                    accept="image/svg+xml,image/png,image/jpeg,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                                    maxFiles={1}
                                    value={files[a.id] ? [files[a.id]!] : []}
                                    disabled={isAssignmentPending}
                                    onChange={async (fileList) => {
                                      const selectedFile = fileList?.[0] || null;
                                      console.log('📁 FileUpload onChange: Selected file for assignment:', a.title, selectedFile ? {
                                        name: selectedFile.name,
                                        size: selectedFile.size,
                                        type: selectedFile.type
                                      } : 'No file');
                                      
                                      if (selectedFile) {
                                        console.log('🔍 FileUpload: Starting image compression...');
                                        const compressedImage = await compressImage(selectedFile);
                                        console.log('🔍 FileUpload: Compression result:', compressedImage ? {
                                          name: compressedImage.name,
                                          size: compressedImage.size,
                                          type: compressedImage.type
                                        } : 'Compression failed');
                                        
                                        setFiles((s) => ({ ...s, [a.id]: compressedImage }));
                                        setFileToUpload(compressedImage);
                                        console.log('✅ FileUpload: File state updated for assignment:', a.id);
                                      } else {
                                        console.log('🔍 FileUpload: No file selected, clearing state');
                                        setFiles((s) => ({ ...s, [a.id]: null }));
                                        setFileToUpload(null);
                                      }
                                    }}
                                    onRemove={() => {
                                      console.log('🗑️ FileUpload onRemove: Removing file for assignment:', a.id);
                                      setFiles((s) => ({ ...s, [a.id]: null }));
                                      setFileToUpload(null);
                                    }}
                                    placeholder={<span><strong>Click to upload</strong> or drag and drop</span>}
                                    helperText={<span>SVG, PNG, JPG, GIF, WebP, or PDF</span>}
                                    className="w-80"
                                  />
                                </div>
                                
                             
                                
                              <div className="flex items-center gap-2">
                                  <Button 
                                    type="submit"
                                    size="sm" 
                                    disabled={isAssignmentPending || !fileToUpload} 
                                    className="bg-green-500 hover:bg-green-500/70 text-white  rounded-xl shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200 "
                                  >
                                  <Upload className="h-4 w-4 mr-1" />
                                    {isAssignmentPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : 'Upload File'}
                                </Button>
                                  <Button type="button" variant="ghost" size="sm" disabled={isAssignmentPending} onClick={() => setOpenFormFor(null)}>Cancel</Button>
                              </div>
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {!loading && rows.filter((a) => {
            if (!query.trim()) return true;
            const q = query.toLowerCase();
            return (
              a.title.toLowerCase().includes(q) ||
              (a.workshop?.title?.toLowerCase() || "").includes(q)
            );
          }).length > pageSize && (
            <div className="mt-4 flex items-center justify-between">
              <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <div className="text-xs text-neutral-500">
                Page {page} of {Math.ceil(rows.filter((a) => {
                  if (!query.trim()) return true;
                  const q = query.toLowerCase();
                  return (
                    a.title.toLowerCase().includes(q) ||
                    (a.workshop?.title?.toLowerCase() || "").includes(q)
                  );
                }).length / pageSize)}
              </div>
              <Button variant="ghost" size="sm" disabled={page * pageSize >= rows.filter((a) => {
                if (!query.trim()) return true;
                const q = query.toLowerCase();
                return (
                  a.title.toLowerCase().includes(q) ||
                  (a.workshop?.title?.toLowerCase() || "").includes(q)
                );
              }).length} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
            </ScrollArea>
        </CardContent>
      </Card>
    </div>
  </div>
  );
}

