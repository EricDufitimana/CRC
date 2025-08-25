"use client";

import { useEffect, useState, useActionState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../zenith/src/components/ui/card";
import { Button } from "../../../../../../zenith/src/components/ui/button";
import { Badge } from "../../../../../../zenith/src/components/ui/badge";
import { Input } from "../../../../../../zenith/src/components/ui/input";
import { Skeleton } from "../../../../../../zenith/src/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../../../zenith/src/components/ui/dialog";
import { Label } from "../../../../../../zenith/src/components/ui/label";
import { Textarea } from "../../../../../../zenith/src/components/ui/textarea";
import { ArrowLeft, ArrowUpRight, Briefcase, Loader2 } from "lucide-react";
import Image from "next/image";
import { useSupabase } from "@/hooks/useSupabase";
import { submitOpportunityHandler } from "@/actions/submitOpportunityHandler";
import { Users } from "lucide-react";

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
  const { getUserId } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<OpportunityRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [studentId, setStudentId] = useState<number | null>(null);
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

  useEffect(() => {
    let canceled = false;
    const fetchStudentId = async () => {
      try {
        setError(null);
        setLoading(true);
        const uid = await getUserId();
        if (!uid) throw new Error("User not found");
        const resp = await fetch(`/api/studentId?userId=${uid}`);
        const js = await resp.json();
        if (!resp.ok || !js.studentId) throw new Error(js?.error || "Student ID missing");
        if (!canceled) setStudentId(js.studentId);
      } catch (e: any) {
        if (!canceled) {
          setError(e?.message || "Failed to load");
          setLoading(false);
        }
      }
    };
    fetchStudentId();
    return () => { canceled = true; };
  }, [refreshKey]);

  useEffect(() => {
    if (!studentId) return;
    let canceled = false;
    const fetchOpps = async () => {
      try {
        const resp = await fetch(`/api/opportunities/for-student?studentId=${studentId}`);
        if (!resp.ok) throw new Error("Failed to fetch opportunities");
        const list = (await resp.json()) as OpportunityRow[];
        if (!canceled) setRows(Array.isArray(list) ? list : []);
      } catch (e: any) {
        if (!canceled) setError(e?.message || "Failed to load opportunities");
      } finally {
        if (!canceled) setLoading(false);
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

  const statusChip = (s: OpportunityRow["status"]) => {
    const map: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
      in_review: "bg-blue-100 text-blue-700 hover:bg-blue-100",
      accepted: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
      denied: "bg-red-100 text-red-700 hover:bg-red-100",
    };
    return map[s] || "bg-neutral-100 text-neutral-700 hover:bg-neutral-100";
  };

  const handleOpportunitySubmission = async (prevState: any, formData: FormData) => {
    if (!studentId) {
      return { success: false, message: 'Student ID not found.' };
    }
    formData.append('student_id', String(studentId));
    formData.append('admin_id', selectedOppFellow?.id || '');
    formData.append('title', oppTitle);
    formData.append('description', oppDescription);
    return await submitOpportunityHandler(prevState, formData);
  };
  const [oppState, opportunityFormAction, isOpportunityPending] = useActionState(handleOpportunitySubmission, {
    success: false,
    message: ''
  });
  useEffect(() => {
    if (oppState.success) {
      setSubmitOpportunityOpen(false);
      setOppStep('select-fellow');
      setSelectedOppFellow(null);
      setOppTitle('');
      setOppDescription('');
      setOppDeadline('');
      setOppLink('');
      setRows([]);
      setRefreshKey((k) => k + 1);
    }
  }, [oppState.success]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/student/aspen">
          <Button variant="ghost" size="sm" className="h-8 px-2"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h2 className="text-2xl font-semibold font-cal-sans">Opportunities</h2>
        
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-black/5">
        <CardHeader className="pb-3">
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
        <CardContent>
          {loading ? (
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
          ) : rows.length === 0 ? (
            <div className="h-[40vh] w-full flex flex-col items-center justify-center py-8 text-center">
              <Image src="/images/dashboard/empty-assignments.png" alt="No opportunities" width={260} height={260} className="opacity-95" />
              <p className="mt-4 text-sm text-neutral-500">No opportunities yet.</p>
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
                      <p className="mt-2 text-xs text-neutral-600 line-clamp-2">{r.description}</p>
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
              <Textarea id="opportunity-description" value={oppDescription} onChange={(e) => setOppDescription(e.target.value)} placeholder="Brief description" rows={3} className="border border-neutral-200  transition-colors duration-200 ease-in-out rounded-xl" />
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setOppStep('select-fellow')}>Back</Button>
              <Button onClick={() => setOppStep('final')} disabled={!oppTitle} className="bg-statColors-1 hover:bg-statColors-1/80 rounded-xl px-8 text-sm text-white disabled:opacity-60 disabled:cursor-not-allowed shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200">Continue</Button>
            </div>
          </div>
        )}

        {oppStep === 'final' && (
          <form action={opportunityFormAction} className="space-y-4">
            <input type="hidden" name="student_id" value={studentId != null ? String(studentId) : ''} />
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
              <Button className="bg-statColors-1 hover:bg-statColors-1/80 rounded-xl px-8 text-sm text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed" disabled={isOpportunityPending || !studentId || !selectedOppFellow || !oppTitle.trim() || !oppLink.trim()} type="submit">
                {isOpportunityPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Opportunity'}
              </Button>
            </div>
            {(!studentId) && (
              <p className="text-xs text-red-500 pt-1">Your session is missing a student ID. Please wait a moment and try again.</p>
            )}
            {oppState && oppState.message && !oppState.success && (
              <p className="text-xs text-red-500 pt-1">{oppState.message}</p>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>

   </div>
  );
}

