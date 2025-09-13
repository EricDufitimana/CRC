"use client";

import { useEffect, useMemo, useState, useActionState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../zenith/src/components/ui/card";
import { Button } from "../../../../../../zenith/src/components/ui/button";
import { Badge } from "../../../../../../zenith/src/components/ui/badge";
import { Input } from "../../../../../../zenith/src/components/ui/input";
import { Skeleton } from "../../../../../../zenith/src/components/ui/skeleton";
import { ArrowLeft, FileText, ArrowUpRight, Users, Loader2, AlertCircle } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../../../zenith/src/components/ui/dialog";
import { Label } from "../../../../../../zenith/src/components/ui/label";
import { Textarea } from "../../../../../../zenith/src/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../../../../zenith/src/components/ui/tooltip";
import { submitEssayHandler } from "@/actions/essays/submitEssayHandler";
import { showToastPromise } from "@/components/toasts";
import NoEssaysFound from "@/components/NotFound/NoEssaysFound";

type EssayRow = {
  id: string;
  title: string;
  link: string;
  word_count: string;
  description: string;
  deadline: string | null;
  submitted_at: string;
  status: "pending" | "in_review" | "completed";
  admin: { id: string; name: string } | null;
};

export default function StudentEssaysPage() {

  const [isPending, startTransition] = useTransition();
  
  const { userId, studentId, isLoading: userDataLoading } = useUserData();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<EssayRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Submit Essay dialog state (mirrors Aspen dashboard quick action)
  const [submitEssayOpen, setSubmitEssayOpen] = useState(false);
  const [essayStep, setEssayStep] = useState<'select-fellow' | 'details' | 'final'>("select-fellow");
  const [selectedEssayFellow, setSelectedEssayFellow] = useState<{id: string, name: string, specialization: string} | null>(null);
  const [essayTitle, setEssayTitle] = useState("");
  const [essayDescription, setEssayDescription] = useState("");
  const [essayDeadline, setEssayDeadline] = useState("");
  const [essayLink, setEssayLink] = useState("");
  const [essayWordCount, setEssayWordCount] = useState("");
  const [crcFellows, setCrcFellows] = useState<Array<{id: string, name: string, specialization: string}>>([]);

  // Toast promise wrapper for useActionState integration
  const [toastPromise, setToastPromise] = useState<{
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  } | null>(null);

  // Centralized accent variables for the dialog
  const ACCENT = {
    text: 'text-statColors-10',
    dot: 'bg-statColors-10 text-neutral-900',
    connector: 'bg-statColors-10',
    selectBorder: 'border-statColors-10',
    selectTint: 'bg-statColors-10/10',
    btn: 'bg-statColors-10 hover:bg-statColors-10/80 text-neutral-900',
  } as const;

  // Update loading state based on user data loading
  useEffect(() => {
    if (userDataLoading) {
      setLoading(true);
      setError(null); // Clear any previous errors while loading
    } else if (studentId) {
      // Keep loading true while fetching essays
      // setLoading(false) will be called after essays are fetched
    } else if (!userDataLoading && !studentId && !loading) {
      // Only show error if we're not loading and have no student ID
      setError("Student ID not found. Please try refreshing the page.");
      setLoading(false);
    }
  }, [userDataLoading, studentId, loading]);

  useEffect(() => {
    if (!studentId) return;
    let canceled = false;
    const fetchEssays = async () => {
      try {
        setError(null);
        setLoading(true); // Ensure loading is true when starting to fetch essays
        const resp = await fetch(`/api/essays/for-student?studentId=${studentId}`);
        if (!resp.ok) throw new Error("Failed to fetch essays");
        const list = (await resp.json()) as EssayRow[];
        if (!canceled) setRows(Array.isArray(list) ? list : []);
      } catch (e: any) {
        if (!canceled) setError(e?.message || "Failed to load essays");
      } finally {
        if (!canceled) setTimeout(() => setLoading(false), 250);
      }
    };
    fetchEssays();
    return () => { canceled = true; };
  }, [studentId]);

  // Fetch CRC fellows for essay dialog
  useEffect(() => {
    const fetchFellows = async () => {
      try {
        const response = await fetch('/api/fellows');
        if (response.ok) {
          const data = await response.json();
          setCrcFellows(data);
        }
      } catch (e) {
        // silent
      }
    };
    fetchFellows();
  }, []);

  // Essay submission handler
  const handleEssaySubmission = async (prevState: any, formData: FormData) => {
    if (!studentId) {
      return { success: false, message: 'Student ID not found.' };
    }
    
    // Get data from form
    const adminId = formData.get('admin_id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const deadline = formData.get('deadline') as string;
    const googleDocsLink = formData.get('googleDocsLink') as string;
    const wordCount = formData.get('word_count') as string;
    
    // Validate required fields
    if (!adminId || !title || !googleDocsLink) {
      return { success: false, message: 'Please fill in all required fields.' };
    }
    
    // Add student_id to form data
    formData.append('student_id', String(studentId));
    
    try {
      const result = await submitEssayHandler(prevState, formData);
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, message: `Submission error: ${errorMessage}` };
    }
  };

  const [essayState, essayFormAction, isEssayPending] = useActionState(handleEssaySubmission, {
    success: false,
    message: '',
    data: null
  });

  // Create a promise that resolves/rejects based on action state
  const createEssayPromise = () => {
    return new Promise((resolve, reject) => {
      setToastPromise({ resolve, reject });
    });
  };

  // Form submit handler for toast integration
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Create the promise for the toast
    const essayPromise = createEssayPromise();
    
    // Show toast promise
    showToastPromise({
      promise: essayPromise,
      loadingText: 'Submitting essay...',
      successText: 'Your essay has been submitted successfully!',
      errorText: 'Failed to submit essay. Please try again.',
      successHeaderText: 'Essay Submitted Successfully',
      errorHeaderText: 'Submission Failed',
      direction: 'right'
    });
    
    // Handle the promise resolution for form reset
    essayPromise.then(() => {
      // Reset form state on success
      setSubmitEssayOpen(false);
      setEssayStep('select-fellow');
      setSelectedEssayFellow(null);
      setEssayTitle('');
      setEssayDescription('');
      setEssayDeadline('');
      setEssayLink('');
      setEssayWordCount('');
      // Refresh the page to show the new essay
      window.location.reload();
    }).catch(() => {
      // Error handling if needed
    });
    
    // Submit the form using useActionState with startTransition
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      essayFormAction(formData);
    });
  };

  // Resolve/reject promise based on action state
  useEffect(() => {
    if (!isEssayPending && toastPromise) {
      if (essayState.success) {
        // Resolve the promise (triggers success toast)
        toastPromise.resolve(essayState);
      } else if (essayState.message && !essayState.success) {
        // Reject the promise (triggers error toast)
        toastPromise.reject(new Error(essayState.message));
      }
      
      // Clear the promise
      setToastPromise(null);
    }
  }, [essayState, isEssayPending, toastPromise]);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter(r => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }, [rows, query]);

  const statusChip = (s: EssayRow["status"]) => {
    const map: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
      in_review: "bg-blue-100 text-blue-700 hover:bg-blue-100",
      completed: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    };
    return map[s] || "bg-neutral-100 text-neutral-700 hover:bg-neutral-100";
  };

  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 flex-shrink-0 group">
        <Link href="/dashboard/student">
          <Button variant="ghost" size="sm" className="h-8 px-2 hover:scale-110 hover:translate-x-[-2px] transition-all duration-200"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h2 className="text-2xl font-semibold font-cal-sans">Essays</h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        <Card className="border-0 shadow-sm ring-1 ring-black/5 m-0.5 h-[calc(100%-6px)] flex flex-col overflow-hidden min-h-0">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Your essay submissions</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder="Search essays..." value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 w-72 rounded-xl" />
              <Button onClick={() => setSubmitEssayOpen(true)} className={`${ACCENT.btn} text-sm rounded-xl h-9 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(240,139,81,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(240,139,81,0.1)] transition duration-200`}>Submit essay</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto min-h-0">
          {loading || userDataLoading || !studentId ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={`essay-skel-${i}`} className="rounded-xl border border-neutral-100 p-4 bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-3 w-1/2 mt-2" />
                      <Skeleton className="h-3 w-3/4 mt-2" />
                    </div>
                    <Skeleton className="h-7 w-20 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : !studentId && !userDataLoading ? (
            <div className="h-[40vh] w-full flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Student ID Not Found</h3>
              <p className="text-neutral-500 mb-4">Unable to load essays without a valid student ID.</p>
              <Button onClick={() => window.location.reload()} variant="outline">Refresh Page</Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="h-[40vh] w-full flex flex-col items-center justify-center py-8 text-center">
              <NoEssaysFound />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((r) => (
                <div key={r.id} className="rounded-xl border border-neutral-100 p-4 bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 ">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate ">{r.title}</p>
                        <Badge className={statusChip(r.status)}>{r.status.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-xs text-neutral-500 truncate">
                        {r.deadline ? `Due ${new Date(r.deadline).toLocaleDateString()}` : 'No deadline'} • Submitted {new Date(r.submitted_at).toLocaleDateString()}
                        {r.admin ? ` • Sent to ${r.admin.name}` : ''}
                      </p>
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <p className="text-xs text-neutral-600 line-clamp-2 cursor-help pt-1">{r.description}</p>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-sm">{r.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <a href={r.link} target="_blank" className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100">
                        Open <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}


        </CardContent>
        </Card>
      </div>

      {/* Submit Essay - Multi-step (copied from Aspen dashboard, themed) */}
      <Dialog open={submitEssayOpen} onOpenChange={(open) => { setSubmitEssayOpen(open); if (!open) { setEssayStep('select-fellow'); setSelectedEssayFellow(null);} }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border-0">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-xl pb-4 font-bold text-gray-900 text-center">
              {essayStep === 'select-fellow' && 'Choose your CRC Fellow'}
              {essayStep === 'details' && 'Essay details'}
              {essayStep === 'final' && 'Deadline & link'}
            </DialogTitle>
            <div className="flex items-center justify-center space-x-6 mt-4">
              <div className={`flex items-center ${essayStep === 'select-fellow' ? ACCENT.text : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${essayStep === 'select-fellow' ? ACCENT.dot : 'bg-gray-200 text-gray-500'}`}>1</div>
                <span className="ml-2 text-sm font-medium">Fellow</span>
              </div>
              <div className={`w-6 h-px ${essayStep === 'details' ? ACCENT.connector : 'bg-gray-200'}`}></div>
              <div className={`flex items-center ${essayStep === 'details' ? ACCENT.text : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${essayStep === 'details' ? ACCENT.dot : 'bg-gray-200 text-gray-500'}`}>2</div>
                <span className="ml-2 text-sm font-medium">Details</span>
              </div>
              <div className={`w-6 h-px bg-gray-200`}></div>
              <div className={`flex items-center ${essayStep === 'final' ? ACCENT.text : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${essayStep === 'final' ? ACCENT.dot : 'bg-gray-200 text-gray-500'}`}>3</div>
                <span className="ml-2 text-sm font-medium">Finish</span>
              </div>
            </div>
          </DialogHeader>

          {essayStep === 'select-fellow' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {crcFellows.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300 mx-auto mb-3"></div>
                    <p className="text-gray-500 text-sm">Loading fellows...</p>
                  </div>
                ) : (
                  crcFellows.map((fellow) => (
                    <div key={fellow.id} onClick={() => setSelectedEssayFellow(fellow)} className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedEssayFellow?.id === fellow.id ? `${ACCENT.selectBorder} ${ACCENT.text} ${ACCENT.selectTint} shadow-sm` : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'}`}>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-300 shadow-sm">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900  text-sm mb-1 truncate">{fellow.name}</h3>
                          <p className="text-sm text-gray-500">{fellow.specialization}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => setEssayStep('details')}
                  disabled={!selectedEssayFellow}
                  className={`${ACCENT.btn} rounded-xl px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(240,139,81,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(240,139,81,0.1)] transition duration-200`}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {essayStep === 'details' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="essay-title">Title</Label>
                <Input id="essay-title" value={essayTitle} onChange={(e) => setEssayTitle(e.target.value)} placeholder="Enter essay title" required className="border border-neutral-200  transition duration-200 ease-in-out rounded-xl" />
              </div>
                          <div>
              <Label htmlFor="essay-description">Description (optional)</Label>
              <Textarea 
                id="essay-description" 
                value={essayDescription} 
                onChange={(e) => setEssayDescription(e.target.value)} 
                placeholder="Brief description" 
                rows={3} 
                maxLength={200}
                className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl" 
              />
              <div className="text-xs text-neutral-500 mt-1">
                {200 - essayDescription.length} characters left
              </div>
              <div>
                <Label htmlFor="essay-word-count">Word count (optional)</Label>
                <Input id="essay-word-count" name="word_count" type="number" min="0" value={essayWordCount} onChange={(e) => setEssayWordCount(e.target.value)} className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl" />
              </div>
            </div>
              <div className="flex justify-between pt-2">
                <Button variant="outline" className="rounded-xl" onClick={() => setEssayStep('select-fellow')}>Back</Button>
                <Button onClick={() => setEssayStep('final')} disabled={!essayTitle} className={`${ACCENT.btn} rounded-xl px-8 text-sm disabled:opacity-60 disabled:cursor-not-allowed shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(240,139,81,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(240,139,81,0.1)] transition duration-200`}>Continue</Button>
              </div>
            </div>
          )}

          {essayStep === 'final' && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <input type="hidden" name="admin_id" value={selectedEssayFellow?.id || ''} />
              <input type="hidden" name="title" value={essayTitle} />
              <input type="hidden" name="description" value={essayDescription} />
              <div>
                <Label htmlFor="essay-deadline">Deadline (optional)</Label>
                <Input id="essay-deadline" name="deadline" type="date" value={essayDeadline} onChange={(e) => setEssayDeadline(e.target.value)} className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl" />
              </div>
              <div>
                <Label htmlFor="essay-link">Google Docs Link</Label>
                <Input id="essay-link" name="googleDocsLink" type="url" placeholder="https://docs.google.com/document/..." required value={essayLink} onChange={(e) => setEssayLink(e.target.value)} className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl" />
              </div>
          
              <div className="flex justify-between space-x-2 pt-2">
                <Button variant="outline" className="rounded-xl" onClick={() => setEssayStep('details')}>Back</Button>
                <Button type="submit" disabled={!studentId || !essayLink.trim() || isEssayPending} className={`${ACCENT.btn} rounded-xl px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(240,139,81,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(240,139,81,0.1)] transition duration-200`}>
                  {isEssayPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Essay'
                  )}
                </Button>
              </div>
              {(!studentId) && (
                <p className="text-xs text-red-500 pt-1">Your session is missing a student ID. Please wait a moment and try again.</p>
              )}
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

