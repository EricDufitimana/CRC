"use client";

import { useEffect, useState, useActionState, useTransition } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../zenith/src/components/ui/card";
import { Button } from "../../../../../../zenith/src/components/ui/button";
import { Badge } from "../../../../../../zenith/src/components/ui/badge";
import { Input } from "../../../../../../zenith/src/components/ui/input";
import { Skeleton } from "../../../../../../zenith/src/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../../../zenith/src/components/ui/dialog";
import { Label } from "../../../../../../zenith/src/components/ui/label";
import { Textarea } from "../../../../../../zenith/src/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../../../../zenith/src/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../../zenith/src/components/ui/select";
import { ArrowLeft, ArrowUpRight, Briefcase, FileText, Loader2, AlertCircle, Users } from "lucide-react";
import Image from "next/image";
import { useUserData } from "@/hooks/useUserData";
import { submitOpportunityHandler } from "@/actions/opportunities/submitOpportunityHandler";
import { submitEssayHandler } from "@/actions/essays/submitEssayHandler";
import { Alert, AlertDescription, AlertTitle } from "../../../../../../zenith/src/components/ui/alert";
import { showToastPromise } from "@/components/toasts";
import NoOpportunitiesFound from "@/components/NotFound/NoOpportunitiesFound";
import NoEssaysFound from "@/components/NotFound/NoEssaysFound";

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

type RequestType = "opportunities" | "essays";

export default function StudentRequestsPage() {
  const [isPending, startTransition] = useTransition();
  
  const { userId, studentId, isLoading: userDataLoading } = useUserData();
  const [loading, setLoading] = useState(true);
  const [opportunityRows, setOpportunityRows] = useState<OpportunityRow[]>([]);
  const [essayRows, setEssayRows] = useState<EssayRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [requestType, setRequestType] = useState<RequestType>("opportunities");

  // Dialog state for opportunities
  const [submitOpportunityOpen, setSubmitOpportunityOpen] = useState(false);
  const [oppStep, setOppStep] = useState<'select-fellow' | 'details' | 'final'>("select-fellow");
  const [selectedOppFellow, setSelectedOppFellow] = useState<{id: string, name: string, specialization: string} | null>(null);
  const [oppTitle, setOppTitle] = useState("");
  const [oppDescription, setOppDescription] = useState("");
  const [oppDeadline, setOppDeadline] = useState("");
  const [oppLink, setOppLink] = useState("");
  const [crcFellows, setCrcFellows] = useState<Array<{id: string, name: string, specialization: string}>>([]);

  // Dialog state for essays
  const [submitEssayOpen, setSubmitEssayOpen] = useState(false);
  const [essayStep, setEssayStep] = useState<'select-fellow' | 'details' | 'final'>("select-fellow");
  const [selectedEssayFellow, setSelectedEssayFellow] = useState<{id: string, name: string, specialization: string} | null>(null);
  const [essayTitle, setEssayTitle] = useState("");
  const [essayDescription, setEssayDescription] = useState("");
  const [essayDeadline, setEssayDeadline] = useState("");
  const [essayLink, setEssayLink] = useState("");
  const [essayWordCount, setEssayWordCount] = useState("");

  // Fetch opportunities data
  useEffect(() => {
    let canceled = false;
    const fetchOpportunities = async () => {
      if (!studentId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const resp = await fetch(`/api/opportunities/for-student?studentId=${studentId}&refreshKey=${refreshKey}`);
        if (!resp.ok) throw new Error("Failed to fetch opportunities");
        
        const data = await resp.json();
        if (!canceled) {
          setOpportunityRows(data || []);
        }
      } catch (e) {
        if (!canceled) {
          setError(e instanceof Error ? e.message : "Failed to load opportunities");
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    };
    
    fetchOpportunities();
    return () => { canceled = true; };
  }, [studentId, refreshKey]);

  // Fetch essays data
  useEffect(() => {
    let canceled = false;
    const fetchEssays = async () => {
      if (!studentId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const resp = await fetch(`/api/essays/for-student?studentId=${studentId}&refreshKey=${refreshKey}`);
        if (!resp.ok) throw new Error("Failed to fetch essays");
        
        const data = await resp.json();
        if (!canceled) {
          setEssayRows(data || []);
        }
      } catch (e) {
        if (!canceled) {
          setError(e instanceof Error ? e.message : "Failed to load essays");
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    };
    
    fetchEssays();
    return () => { canceled = true; };
  }, [studentId, refreshKey]);

  // Fetch CRC fellows for both dialogs
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

  // Handle opportunity submission
  const handleOpportunitySubmission = async (prevState: any, formData: FormData) => {
    if (!studentId) {
      return { success: false, message: 'Student ID not found.' };
    }
    
    const result = await submitOpportunityHandler(prevState, formData);
    if (result.success) {
      setRefreshKey(k => k + 1);
      setSubmitOpportunityOpen(false);
      setOppStep('select-fellow');
      setSelectedOppFellow(null);
      setOppTitle("");
      setOppDescription("");
      setOppDeadline("");
      setOppLink("");
    }
    return result;
  };

  // Handle essay submission
  const handleEssaySubmission = async (prevState: any, formData: FormData) => {
    if (!studentId) {
      return { success: false, message: 'Student ID not found.' };
    }
    
    const result = await submitEssayHandler(prevState, formData);
    if (result.success) {
      setRefreshKey(k => k + 1);
      setSubmitEssayOpen(false);
      setEssayStep('select-fellow');
      setSelectedEssayFellow(null);
      setEssayTitle("");
      setEssayDescription("");
      setEssayDeadline("");
      setEssayLink("");
      setEssayWordCount("");
    }
    return result;
  };

  // Form submission handlers
  const handleOppFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      handleOpportunitySubmission({}, new FormData(e.target as HTMLFormElement));
    });
  };

  const handleEssayFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      handleEssaySubmission({}, new FormData(e.target as HTMLFormElement));
    });
  };

  // Status chip functions
  const statusChip = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-200 border border-yellow-600 text-yellow-600 hover:bg-yellow-200';
      case 'in_review': return 'bg-blue-200 border border-blue-600 text-blue-600 hover:bg-blue-200';
      case 'accepted': return 'bg-green-200 border border-green-600 text-green-600 hover:bg-green-200';
      case 'denied': return 'bg-red-200 border border-red-600 text-red-600 hover:bg-red-200';
      case 'completed': return 'bg-green-200 border border-green-600 text-green-600 hover:bg-green-200';
      default: return 'bg-gray-200 border border-gray-600 text-gray-600 hover:bg-gray-200';
    }
  };

  // Get current data based on request type
  const currentRows = requestType === "opportunities" ? opportunityRows : essayRows;
  const currentLoading = loading || userDataLoading || !studentId;

  // Filter data based on query
  const filteredRows = currentRows.filter((row) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      row.title.toLowerCase().includes(q) ||
      row.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 flex-shrink-0 group">
        <Link href="/dashboard/student">
          <Button variant="ghost" size="sm" className="h-8 px-2 hover:scale-110 hover:translate-x-[-2px] transition-all duration-200">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-semibold font-cal-sans">Requests</h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        <Card className="border-0 shadow-sm ring-1 ring-black/5 m-0.5 h-[calc(100%-6px)] flex flex-col overflow-hidden min-h-0">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Your submissions</CardTitle>
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Search requests..." 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  className="h-9 w-64 rounded-xl" 
                />
                <Select value={requestType} onValueChange={(value: RequestType) => setRequestType(value)}>
                  <SelectTrigger className="w-40 h-9 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opportunities">Opportunities</SelectItem>
                    <SelectItem value="essays">Essays</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => {
                    if (requestType === "opportunities") {
                      setSubmitOpportunityOpen(true);
                    } else {
                      setSubmitEssayOpen(true);
                    }
                  }} 
                  className={`${
                    requestType === "opportunities" 
                      ? "bg-statColors-1 hover:bg-statColors-1/90 text-neutral-900 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)]"
                      : "bg-orange-500 hover:bg-orange-600 text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(240,139,81,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(240,139,81,0.1)]"
                  } text-sm rounded-xl h-9 transition duration-200`}
                >
                  Submit {requestType === "opportunities" ? "opportunity" : "essay"}
                </Button>
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
              {currentLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={`req-skel-${i}`} className="rounded-xl border border-neutral-100 p-4 bg-white">
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
              ) : filteredRows.length === 0 ? (
                <div className="h-full w-full flex flex-col items-center justify-center py-12 text-center">
                  {requestType === "opportunities" ? (
                    <NoOpportunitiesFound />
                  ) : (
                    <NoEssaysFound />
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRows.map((row) => (
                    <div key={row.id} className="rounded-xl border border-neutral-100 p-4 bg-white transition">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{row.title}</p>
                            <Badge className={statusChip(row.status)}>{row.status.replace('_', ' ')}</Badge>
                            {'referred' in row && row.referred && (
                              <Badge className="bg-yearcolors-s4 hover:bg-yearcolors-s4 text-xs text-neutral-900">Referred</Badge>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500 truncate">
                            {row.deadline ? `Due ${new Date(row.deadline).toLocaleDateString()}` : 'No deadline'} • Submitted {new Date(row.submitted_at).toLocaleDateString()}
                            {row.admin ? ` • Sent to ${row.admin.name}` : ''}
                          </p>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-xs text-neutral-600 mt-1 line-clamp-2 cursor-help">
                                  {row.description}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{row.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={row.link} target="_blank" className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100">
                            Open <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Submit Opportunity Dialog */}
      <Dialog open={submitOpportunityOpen} onOpenChange={(open) => { 
        setSubmitOpportunityOpen(open); 
        if (!open) { 
          setOppStep('select-fellow'); 
          setSelectedOppFellow(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border-0">
          <DialogHeader>
            <DialogTitle>Submit Opportunity</DialogTitle>
          </DialogHeader>
          
          {oppStep === 'select-fellow' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-4">Choose a CRC Fellow to review your opportunity</p>
              </div>
              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                {crcFellows.map((fellow) => (
                  <div
                    key={fellow.id}
                    onClick={() => {
                      setSelectedOppFellow(fellow);
                      setOppStep('details');
                    }}
                    className="p-3 border rounded-xl cursor-pointer transition-all duration-200 hover:border-statColors-1 hover:shadow-sm bg-white"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-statColors-1 shadow-sm">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{fellow.name}</h3>
                        <p className="text-sm text-gray-500">{fellow.specialization}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {oppStep === 'details' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">With <span className="font-semibold text-gray-900">{selectedOppFellow?.name}</span></p>
                <p className="text-gray-500 text-sm">Provide opportunity details</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="opp-title">Title</Label>
                  <Input
                    id="opp-title"
                    value={oppTitle}
                    onChange={(e) => setOppTitle(e.target.value)}
                    placeholder="Enter opportunity title"
                    className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="opp-description">Description</Label>
                  <Textarea
                    id="opp-description"
                    value={oppDescription}
                    onChange={(e) => setOppDescription(e.target.value)}
                    placeholder="Describe the opportunity"
                    className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="opp-link">Link (optional)</Label>
                  <Input
                    id="opp-link"
                    value={oppLink}
                    onChange={(e) => setOppLink(e.target.value)}
                    placeholder="https://example.com"
                    className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setOppStep('select-fellow')} className="rounded-xl px-8 text-sm">Back</Button>
                <Button onClick={() => setOppStep('final')} disabled={!oppTitle} className="bg-statColors-1 hover:bg-statColors-1/80 rounded-xl px-8 text-sm text-white disabled:opacity-60 disabled:cursor-not-allowed shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200">Continue</Button>
              </div>
            </div>
          )}

          {oppStep === 'final' && (
            <form onSubmit={handleOppFormSubmit} className="space-y-4">
              <input type="hidden" name="admin_id" value={selectedOppFellow?.id || ''} />
              <input type="hidden" name="title" value={oppTitle} />
              <input type="hidden" name="description" value={oppDescription} />
              <input type="hidden" name="link" value={oppLink} />
              <div>
                <Label htmlFor="opportunity-deadline">Deadline (optional)</Label>
                <Input id="opportunity-deadline" name="deadline" type="date" value={oppDeadline} onChange={(e) => setOppDeadline(e.target.value)} className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl" />
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setOppStep('details')} className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl px-8">Back</Button>
                <Button type="submit" disabled={isPending} className="bg-statColors-1 hover:bg-statColors-1/80 px-8 py-2 rounded-xl text-white font-medium shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Submit Opportunity
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Submit Essay Dialog */}
      <Dialog open={submitEssayOpen} onOpenChange={(open) => { 
        setSubmitEssayOpen(open); 
        if (!open) { 
          setEssayStep('select-fellow'); 
          setSelectedEssayFellow(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border-0">
          <DialogHeader>
            <DialogTitle>Submit Essay</DialogTitle>
          </DialogHeader>
          
          {essayStep === 'select-fellow' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-4">Choose a CRC Fellow to review your essay</p>
              </div>
              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                {crcFellows.map((fellow) => (
                  <div
                    key={fellow.id}
                    onClick={() => {
                      setSelectedEssayFellow(fellow);
                      setEssayStep('details');
                    }}
                    className="p-3 border rounded-xl cursor-pointer transition-all duration-200 hover:border-orange-500 hover:shadow-sm bg-white"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-500 shadow-sm">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{fellow.name}</h3>
                        <p className="text-sm text-gray-500">{fellow.specialization}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {essayStep === 'details' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">With <span className="font-semibold text-gray-900">{selectedEssayFellow?.name}</span></p>
                <p className="text-gray-500 text-sm">Provide essay details</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="essay-title">Title</Label>
                  <Input
                    id="essay-title"
                    value={essayTitle}
                    onChange={(e) => setEssayTitle(e.target.value)}
                    placeholder="Enter essay title"
                    className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="essay-description">Description</Label>
                  <Textarea
                    id="essay-description"
                    value={essayDescription}
                    onChange={(e) => setEssayDescription(e.target.value)}
                    placeholder="Describe the essay"
                    className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="essay-link">Link (optional)</Label>
                  <Input
                    id="essay-link"
                    value={essayLink}
                    onChange={(e) => setEssayLink(e.target.value)}
                    placeholder="https://example.com"
                    className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setEssayStep('select-fellow')} className="rounded-xl px-8 text-sm">Back</Button>
                <Button onClick={() => setEssayStep('final')} disabled={!essayTitle} className="bg-orange-500 hover:bg-orange-600 rounded-xl px-8 text-sm text-white disabled:opacity-60 disabled:cursor-not-allowed shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(240,139,81,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(240,139,81,0.1)] transition duration-200">Continue</Button>
              </div>
            </div>
          )}

          {essayStep === 'final' && (
            <form onSubmit={handleEssayFormSubmit} className="space-y-4">
              <input type="hidden" name="admin_id" value={selectedEssayFellow?.id || ''} />
              <input type="hidden" name="title" value={essayTitle} />
              <input type="hidden" name="description" value={essayDescription} />
              <input type="hidden" name="link" value={essayLink} />
              <div>
                <Label htmlFor="essay-deadline">Deadline (optional)</Label>
                <Input id="essay-deadline" name="deadline" type="date" value={essayDeadline} onChange={(e) => setEssayDeadline(e.target.value)} className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl" />
              </div>
              <div>
                <Label htmlFor="essay-word-count">Word Count (optional)</Label>
                <Input id="essay-word-count" name="word_count" value={essayWordCount} onChange={(e) => setEssayWordCount(e.target.value)} placeholder="e.g., 500" className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl" />
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setEssayStep('details')} className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl px-8">Back</Button>
                <Button type="submit" disabled={isPending} className="bg-orange-500 hover:bg-orange-600 px-8 py-2 rounded-xl text-white font-medium shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(240,139,81,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(240,139,81,0.1)] transition duration-200">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Submit Essay
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
