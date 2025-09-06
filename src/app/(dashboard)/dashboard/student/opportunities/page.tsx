"use client";

import { useEffect, useState, useActionState, useTransition } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../zenith/src/components/ui/card";
import { Button } from "../../../../../../zenith/src/components/ui/button";
import { Badge } from "../../../../../../zenith/src/components/ui/badge";
import { Input } from "../../../../../../zenith/src/components/ui/input";
import { Skeleton } from "../../../../../../zenith/src/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../../../zenith/src/components/ui/dialog";
import { Label } from "../../../../../../zenith/src/components/ui/label";
import { Textarea } from "../../../../../../zenith/src/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../../../../zenith/src/components/ui/tooltip";
import { ArrowLeft, ArrowUpRight, Briefcase, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useUserData } from "@/hooks/useUserData";
import { submitOpportunityHandler } from "@/actions/opportunities/submitOpportunityHandler";
import { Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../../../../../zenith/src/components/ui/alert";
import { showToastPromise } from "@/components/toasts";
import NoOpportunitiesFound from "@/components/NotFound/NoOpportunitiesFound";

type OpportunityRow = {
  id: string;
  title: string;
  description: string;
  link: string;
  deadline: string | null;
  submitted_at: string;
  status: "pending" | "in_review" | "accepted" | "denied";
  referred: boolean;
  admin: { id: string; name: string } | null;
};

export default function StudentOpportunitiesPage() {
  const [isPending, startTransition] = useTransition();
  
  const { userId, studentId, isLoading: userDataLoading } = useUserData();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<OpportunityRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Dialog state copied from Aspen quick action
  const [submitOpportunityOpen, setSubmitOpportunityOpen] = useState(false);
  const [oppStep, setOppStep] = useState<'select-fellow' | 'details' | 'final'>("select-fellow");
  const [selectedOppFellow, setSelectedOppFellow] = useState<{id: string, name: string, specialization: string} | null>(null);
  const [oppTitle, setOppTitle] = useState("");
  const [oppDescription, setOppDescription] = useState("");
  const [oppDeadline, setOppDeadline] = useState("");
  const [oppLink, setOppLink] = useState("");
  const [crcFellows, setCrcFellows] = useState<Array<{id: string, name: string, specialization: string}>>([]);

  // Toast promise wrapper for useActionState integration
  const [toastPromise, setToastPromise] = useState<{
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  } | null>(null);

  // Update loading state based on user data loading
  useEffect(() => {
    if (userDataLoading) {
      setLoading(true);
      setError(null); // Clear any previous errors while loading
    } else if (studentId) {
      // Keep loading true while fetching opportunities
      // setLoading(false) will be called after opportunities are fetched
    } else if (!userDataLoading && !studentId && !loading) {
      // Only show error if we're not loading and have no student ID
      setError("Student ID not found. Please try refreshing the page.");
      setLoading(false);
    }
  }, [userDataLoading, studentId, loading]);

  useEffect(() => {
    if (!studentId) return;
    let canceled = false;
    const fetchOpps = async () => {
      try {
        setError(null);
        setLoading(true); // Ensure loading is true when starting to fetch opportunities
        const resp = await fetch(`/api/opportunities/for-student?studentId=${studentId}`);
        if (!resp.ok) throw new Error("Failed to fetch opportunities");
        const list = (await resp.json()) as OpportunityRow[];
        if (!canceled) setRows(Array.isArray(list) ? list : []);
      } catch (e: any) {
        if (!canceled) setError(e?.message || "Failed to load opportunities");
      } finally {
        if (!canceled) setTimeout(() => setLoading(false), 250);
      }
    };
    fetchOpps();
    return () => { canceled = true; };
  }, [studentId, refreshKey]);

  // Fetch CRC fellows for the dialog
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

  // Handle opportunity submission with useActionState
  const handleOpportunitySubmission = async (prevState: any, formData: FormData) => {
    if (!studentId) {
      return { success: false, message: 'Student ID not found.' };
    }
    
    // Get data from form
    const adminId = formData.get('admin_id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const deadline = formData.get('deadline') as string;
    const link = formData.get('link') as string;
    
    // Validate required fields
    if (!adminId || !title || !link) {
      return { success: false, message: 'Please fill in all required fields.' };
    }
    
    // Add student_id to form data
    formData.append('student_id', String(studentId));
    
    try {
      const result = await submitOpportunityHandler(prevState, formData);
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, message: `Submission error: ${errorMessage}` };
    }
  };

  const [oppState, opportunityFormAction, isOpportunityPending] = useActionState(handleOpportunitySubmission, {
    success: false,
    message: ''
  });

  // Create a promise that resolves/rejects based on action state
  const createOpportunityPromise = () => {
    return new Promise((resolve, reject) => {
      setToastPromise({ resolve, reject });
    });
  };

  // Form submit handler for toast integration
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Create the promise for the toast
    const opportunityPromise = createOpportunityPromise();
    
    // Show toast promise
    showToastPromise({
      promise: opportunityPromise,
      loadingText: 'Submitting opportunity...',
      successText: 'Your opportunity has been submitted successfully!',
      errorText: 'Failed to submit opportunity. Please try again.',
      successHeaderText: 'Opportunity Submitted Successfully',
      errorHeaderText: 'Submission Failed',
      direction: 'right'
    });
    
    // Handle the promise resolution for form reset
    opportunityPromise.then(() => {
      // Reset form state on success
      setSubmitOpportunityOpen(false);
      setOppStep('select-fellow');
      setSelectedOppFellow(null);
      setOppTitle('');
      setOppDescription('');
      setOppDeadline('');
      setOppLink('');
      setRows([]);
      setRefreshKey((k) => k + 1);
    }).catch(() => {
      // Error handling if needed
    });
    
    // Submit the form using useActionState with startTransition
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      opportunityFormAction(formData);
    });
  };

  // Resolve/reject promise based on action state
  useEffect(() => {
    if (!isOpportunityPending && toastPromise) {
      if (oppState.success) {
        // Resolve the promise (triggers success toast)
        toastPromise.resolve(oppState);
      } else if (oppState.message && !oppState.success) {
        // Reject the promise (triggers error toast)
        toastPromise.reject(new Error(oppState.message));
      }
      
      // Clear the promise
      setToastPromise(null);
    }
  }, [oppState, isOpportunityPending, toastPromise]);

  const statusChip = (s: OpportunityRow["status"]) => {
    const map: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
      in_review: "bg-blue-100 text-blue-700 hover:bg-blue-100",
      accepted: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
      denied: "bg-red-100 text-red-700 hover:bg-red-100",
    };
    return map[s] || "bg-neutral-100 text-neutral-700 hover:bg-neutral-100";
  };



  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 flex-shrink-0 group">
        <Link href="/dashboard/student">
          <Button variant="ghost" size="sm" className="h-8 px-2 hover:scale-110 hover:translate-x-[-2px] transition-all duration-200"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h2 className="text-2xl font-semibold font-cal-sans">Opportunities</h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        <Card className="border-0 shadow-sm ring-1 ring-black/5 m-0.5 h-[calc(100%-6px)] flex flex-col overflow-hidden min-h-0">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Your submissions</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder="Search opportunities..." value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 w-64 rounded-xl" />
              <Button onClick={() => setSubmitOpportunityOpen(true)} className="bg-statColors-1 hover:bg-statColors-1/90 h-9 text-sm text-neutral-900 rounded-xl  shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] ">
               Submit opportunity
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto min-h-0">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`opp-skel-${i}`} className="rounded-xl border border-neutral-100 p-4 bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-14 rounded-full" />
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
              <p className="text-neutral-500 mb-4">Unable to load opportunities without a valid student ID.</p>
              <Button onClick={() => window.location.reload()} variant="outline">Refresh Page</Button>
            </div>
          ) : rows.length === 0 ? (
            <div className="h-[40vh] w-full flex flex-col items-center justify-center py-8 text-center">
              <NoOpportunitiesFound />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rows
                .filter((r) => {
                  if (!query.trim()) return true;
                  const q = query.toLowerCase();
                  return (
                    r.title.toLowerCase().includes(q) ||
                    r.description.toLowerCase().includes(q)
                  );
                })
                .map((r) => (
                <div key={r.id} className="rounded-xl border border-neutral-100 p-4 bg-white  transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{r.title}</p>
                        <Badge className={statusChip(r.status)}>{r.status.replace('_', ' ')}</Badge>
                        {r.referred && (
                          <Badge className="bg-yearcolors-s4 hover:bg-yearcolors-s4 text-xs text-neutral-900">Referred</Badge>
                        )}
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

    <Dialog open={submitOpportunityOpen} onOpenChange={(open) => { setSubmitOpportunityOpen(open); if (!open) { setOppStep('select-fellow'); setSelectedOppFellow(null);} }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border-0">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl pb-4 font-bold text-gray-900 text-center">
            {oppStep === 'select-fellow' && 'Choose CRC Fellow'}
            {oppStep === 'details' && 'Opportunity details'}
            {oppStep === 'final' && 'Deadline & link'}
          </DialogTitle>
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className={`flex items-center ${oppStep === 'select-fellow' ? 'text-statColors-1' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${oppStep === 'select-fellow' ? 'bg-statColors-1 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
              <span className="ml-2 text-sm font-medium">Fellow</span>
            </div>
            <div className={`w-6 h-px ${oppStep === 'details' ? 'bg-statColors-1' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${oppStep === 'details' ? 'text-statColors-1' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${oppStep === 'details' ? 'bg-statColors-1 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
              <span className="ml-2 text-sm font-medium">Details</span>
            </div>
            <div className={`w-6 h-px bg-gray-200`}></div>
            <div className={`flex items-center ${oppStep === 'final' ? 'text-statColors-1' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${oppStep === 'final' ? 'bg-statColors-1 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
              <span className="ml-2 text-sm font-medium">Finish</span>
            </div>
          </div>
        </DialogHeader>

        {oppStep === 'select-fellow' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {crcFellows.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300 mx-auto mb-3"></div>
                  <p className="text-gray-500 text-sm">Loading fellows...</p>
                </div>
              ) : (
                 crcFellows.map((fellow) => (
                  <div key={fellow.id} onClick={() => setSelectedOppFellow(fellow)} className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedOppFellow?.id === fellow.id ? 'border-statColors-1/80 bg-statColors-1/10 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'}`}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-300 shadow-sm">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{fellow.name}</h3>
                        <p className="text-sm text-gray-500">{fellow.specialization}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => setOppStep('details')} disabled={!selectedOppFellow} className="bg-statColors-1 hover:bg-statColors-1/80 rounded-xl px-8 text-sm text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200">Continue</Button>
            </div>
          </div>
        )}

        {oppStep === 'details' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="opportunity-title">Title</Label>
              <Input id="opportunity-title" value={oppTitle} onChange={(e) => setOppTitle(e.target.value)} placeholder="Enter opportunity title" required className="border border-neutral-200  transtion duration-200 ease-in-out rounded-xl" />
            </div>
            <div>
              <Label htmlFor="opportunity-description">Description (optional)</Label>
              <Textarea 
                id="opportunity-description" 
                value={oppDescription} 
                onChange={(e) => setOppDescription(e.target.value)} 
                placeholder="Brief description" 
                rows={3} 
                maxLength={200}
                className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl" 
              />
              <div className="text-xs text-neutral-500 mt-1">
                {200 - oppDescription.length} characters left
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setOppStep('select-fellow')}>Back</Button>
              <Button onClick={() => setOppStep('final')} disabled={!oppTitle} className="bg-statColors-1 hover:bg-statColors-1/80 rounded-xl px-8 text-sm text-white disabled:opacity-60 disabled:cursor-not-allowed shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200">Continue</Button>
            </div>
          </div>
        )}

        {oppStep === 'final' && (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <input type="hidden" name="admin_id" value={selectedOppFellow?.id || ''} />
            <input type="hidden" name="title" value={oppTitle} />
            <input type="hidden" name="description" value={oppDescription} />
            <div>
              <Label htmlFor="opportunity-deadline">Deadline (optional)</Label>
              <Input id="opportunity-deadline" name="deadline" type="date" value={oppDeadline} onChange={(e) => setOppDeadline(e.target.value)} className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl" />
            </div>
            <div>
              <Label htmlFor="opportunity-link">Link</Label>
              <Input id="opportunity-link" name="link" type="url" placeholder="https://example.com/opportunity" required value={oppLink} onChange={(e) => setOppLink(e.target.value)} className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl" />
            </div>
            <div className="flex justify-between space-x-2 pt-4">
              <Button variant="outline" className="rounded-xl" onClick={() => setOppStep('details')}>Back</Button>
              <Button className="bg-statColors-1 hover:bg-statColors-1/80 rounded-xl px-8 text-sm text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed" disabled={!studentId || !selectedOppFellow || !oppTitle.trim() || !oppLink.trim() || isOpportunityPending} type="submit">
                {isOpportunityPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Opportunity'
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

