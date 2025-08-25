"use client";

import { useEffect, useMemo, useState, useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../zenith/src/components/ui/card";
import { Button } from "../../../../../../zenith/src/components/ui/button";
import { Badge } from "../../../../../../zenith/src/components/ui/badge";
import { Input } from "../../../../../../zenith/src/components/ui/input";
import { Skeleton } from "../../../../../../zenith/src/components/ui/skeleton";
import { ArrowLeft, FileText, ArrowUpRight, Users, Loader2 } from "lucide-react";
import { useSupabase } from "@/hooks/useSupabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../../../zenith/src/components/ui/dialog";
import { Label } from "../../../../../../zenith/src/components/ui/label";
import { Textarea } from "../../../../../../zenith/src/components/ui/textarea";
import { submitEssayHandler } from "@/actions/submitEssayHandler";

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
  const { getUserId } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<EssayRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [studentId, setStudentId] = useState<number | null>(null);

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

  // Centralized accent variables for the dialog
  const ACCENT = {
    text: 'text-statColors-3',
    dot: 'bg-statColors-3 text-neutral-900',
    connector: 'bg-statColors-3',
    selectBorder: 'border-statColors-3',
    selectTint: 'bg-statColors-3/10',
    btn: 'bg-statColors-3 hover:bg-statColors-3/80 text-neutral-900',
  } as const;

  useEffect(() => {
    let canceled = false;
    const fetchRows = async () => {
      try {
        setLoading(true);
        const uid = await getUserId();
        if (!uid) throw new Error("User not found");
        const resp = await fetch(`/api/studentId?userId=${uid}`);
        const js = await resp.json();
        if (!resp.ok || !js.studentId) throw new Error(js?.error || "Student ID missing");
        setStudentId(js.studentId);
        const listResp = await fetch(`/api/essays/for-student?studentId=${js.studentId}`);
        if (!listResp.ok) throw new Error("Failed to fetch essays");
        const list = (await listResp.json()) as EssayRow[];
        if (!canceled) setRows(Array.isArray(list) ? list : []);
      } catch (e: any) {
        if (!canceled) setError(e?.message || "Failed to load essays");
      } finally {
        if (!canceled) setLoading(false);
      }
    };
    fetchRows();
    return () => { canceled = true; };
  }, []);

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
    formData.append('student_id', String(studentId));
    const response = await submitEssayHandler(prevState, formData);
    if (response.success) {
      window.location.reload();
    }
    return response;
  };
  const [essayState, essayFormAction, isEssayPending] = useActionState(handleEssaySubmission, {
    success: false,
    message: '',
    data: null
  });
  useEffect(() => {
    if (essayState.success) {
      setSubmitEssayOpen(false);
      setEssayStep('select-fellow');
      setSelectedEssayFellow(null);
      setEssayTitle('');
      setEssayDescription('');
      setEssayDeadline('');
      setEssayLink('');
      setEssayWordCount('');
    }
  }, [essayState.success]);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter(r => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
  }, [rows, query]);

  const statusChip = (s: EssayRow["status"]) => {
    const map: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700",
      in_review: "bg-blue-100 text-blue-700",
      completed: "bg-emerald-100 text-emerald-700",
    };
    return map[s] || "bg-neutral-100 text-neutral-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/student/aspen">
          <Button variant="ghost" size="sm" className="h-8 px-2"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h2 className="text-2xl font-semibold font-cal-sans">Essays</h2>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-black/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Your essay submissions</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder="Search essays..." value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 w-72 rounded-xl" />
              <Button onClick={() => setSubmitEssayOpen(true)} className={`${ACCENT.btn} text-sm rounded-xl h-9 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(240,139,81,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(240,139,81,0.1)] transition duration-200`}>Submit essay</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
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
          ) : filtered.length === 0 ? (
            <div className="h-[40vh] w-full flex flex-col items-center justify-center py-8 text-center">
              <Image src="/images/dashboard/empty-assignments.png" alt="No essays" width={260} height={260} className="opacity-95" />
              <p className="mt-4 text-sm text-neutral-500">No essays yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.slice((page - 1) * pageSize, page * pageSize).map((r) => (
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

          {!loading && filtered.length > pageSize && (
            <div className="mt-4 flex items-center justify-between">
              <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <div className="text-xs text-neutral-500">Page {page} of {Math.ceil(filtered.length / pageSize)}</div>
              <Button variant="ghost" size="sm" disabled={page * pageSize >= filtered.length} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>

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
                <Textarea id="essay-description" value={essayDescription} onChange={(e) => setEssayDescription(e.target.value)} placeholder="Brief description" rows={3} className="border border-neutral-200  transition-colors duration-200 ease-in-out rounded-xl" />
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="outline" className="rounded-xl" onClick={() => setEssayStep('select-fellow')}>Back</Button>
                <Button onClick={() => setEssayStep('final')} disabled={!essayTitle} className={`${ACCENT.btn} rounded-xl px-8 text-sm disabled:opacity-60 disabled:cursor-not-allowed shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(240,139,81,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(240,139,81,0.1)] transition duration-200`}>Continue</Button>
              </div>
            </div>
          )}

          {essayStep === 'final' && (
            <form action={essayFormAction} className="space-y-4">
              <input type="hidden" name="student_id" value={studentId != null ? String(studentId) : ''} />
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
              <div>
                <Label htmlFor="essay-word-count">Word count (optional)</Label>
                <Input id="essay-word-count" name="word_count" type="number" min="0" value={essayWordCount} onChange={(e) => setEssayWordCount(e.target.value)} className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl" />
              </div>
              <div className="flex justify-between space-x-2 pt-2">
                <Button variant="outline" className="rounded-xl" onClick={() => setEssayStep('details')}>Back</Button>
                <Button type="submit" disabled={isEssayPending || !studentId || !essayLink.trim()} className={`${ACCENT.btn} rounded-xl px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(240,139,81,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(240,139,81,0.1)] transition duration-200`}>
                  {isEssayPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Essay'}
                </Button>
              </div>
              {(!studentId) && (
                <p className="text-xs text-red-500 pt-1">Your session is missing a student ID. Please wait a moment and try again.</p>
              )}
              {essayState && essayState.message && !essayState.success && (
                <p className="text-xs text-red-500 pt-1">{essayState.message}</p>
              )}
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

