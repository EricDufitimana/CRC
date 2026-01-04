"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputWithRing } from "@/components/ui/input";
import TextArea from "@/components/form/input/TextArea";
import { Label } from "@/components/ui/label";
import { Loader2, Users } from "lucide-react";
import Image from "next/image";
import { useTRPC } from "@/trpc/client";
import { showToastPromise } from "@/components/toasts";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

export function SubmitOpportunityDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const trpc = useTRPC();
  const [step, setStep] = useState<'select-fellow' | 'details' | 'final'>("select-fellow");
  const [selectedFellow, setSelectedFellow] = useState<{ id: string, name: string, specialization: string } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [link, setLink] = useState("");

  const { data: fellows } = useSuspenseQuery(trpc.studentDashboard.getFellows.queryOptions());
  const submitMutation = useMutation(trpc.studentDashboard.submitOpportunity.mutationOptions());

  const resetForm = () => {
    setStep('select-fellow');
    setSelectedFellow(null);
    setTitle('');
    setDescription('');
    setDeadline('');
    setLink('');
  };

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  // Eye following effect
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const eyesRef = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Logic for eye movement (copied from previous/similar component or simplified)
      // Simplified or copied if needed. Since I don't have the `angle` function in scope unless I copy it.
      // I'll copy the angle function logic inside.
      if (!anchorRef.current || eyesRef.current.length === 0) return;
      const rekt = anchorRef.current.getBoundingClientRect();
      const anchorX = rekt.left + rekt.width / 2;
      const anchorY = rekt.top + rekt.height / 2;

      const dy = e.clientY - anchorY;
      const dx = e.clientX - anchorX;
      const rad = Math.atan2(dy, dx);
      const angleDeg = (rad * 180) / Math.PI;

      eyesRef.current.forEach((eye) => {
        if (eye) {
          eye.style.transform = `rotate(${90 + angleDeg}deg)`;
        }
      });
    };
    if (open) {
      document.addEventListener("mousemove", handleMouseMove);
    }
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFellow) return;

    const promise = submitMutation.mutateAsync({
      adminId: selectedFellow.id,
      title,
      description,
      link,
      deadline: deadline || undefined,
    });

    showToastPromise({
      promise,
      loadingText: 'Submitting opportunity...',
      successText: 'You can track its status on your opportunities page.',
      errorText: 'Failed to submit opportunity. Please try again.',
      successHeaderText: 'Opportunity Submitted Successfully',
      errorHeaderText: 'Opportunity Submission Failed',
      direction: 'right'
    });

    try {
      await promise;
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-visible bg-white rounded-2xl shadow-2xl border-0 [&>button]:!hidden">
        <div className="relative">
          <div ref={anchorRef} className="absolute top-[-60px] left-[-60px]w-4 h-4"></div>
          <Image
            src="/images/popup/popup-illustration-007.png"
            alt="Popup Illustration"
            width={2000}
            height={2000}
            className="absolute  w-32 pointer-events-none z-0 top-[-87px] left-[-98px]"
          />
          <Image
            ref={(el) => { eyesRef.current[0] = el; }}
            src="/images/popup/eye.png"
            alt="Popup Eye"
            width={30}
            height={30}
            className="absolute z-10 top-[-48px] left-[-76px]"
          />
          <Image
            ref={(el) => { eyesRef.current[1] = el; }}
            src="/images/popup/eye.png"
            alt="Popup Eye"
            width={30}
            height={30}
            className="absolute z-10 top-[-48px] left-[-47px]"
          />
        </div>

        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl pb-4 font-bold text-gray-900 text-center">
            {step === 'select-fellow' && 'Choose CRC Fellow'}
            {step === 'details' && 'Opportunity details'}
            {step === 'final' && 'Deadline & link'}
          </DialogTitle>
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className={`flex items-center ${step === 'select-fellow' ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step === 'select-fellow' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
              <span className="ml-2 text-sm font-medium">Fellow</span>
            </div>
            <div className={`w-6 h-px ${step === 'details' ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step === 'details' ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step === 'details' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
              <span className="ml-2 text-sm font-medium">Details</span>
            </div>
            <div className={`w-6 h-px bg-gray-200`}></div>
            <div className={`flex items-center ${step === 'final' ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step === 'final' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
              <span className="ml-2 text-sm font-medium">Finish</span>
            </div>
          </div>
        </DialogHeader>

        <div className='relative'>
          {step === 'select-fellow' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fellows?.map((fellow) => (
                  <div key={fellow.id} onClick={() => setSelectedFellow(fellow)} className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedFellow?.id === fellow.id ? 'border-orange-400/80 bg-primary/10 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'}`}>
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
                ))}
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="outline" className="rounded-xl px-8 text-sm" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={() => setStep('details')} disabled={!selectedFellow} className="bg-primary hover:bg-primary/90 rounded-xl px-8 text-sm text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(242,152,73,0.35)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(242,152,73,0.15)] transition duration-200">Continue</Button>
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="opportunity-title">Title</Label>
                <InputWithRing id="opportunity-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter opportunity title" className="border border-neutral-200  transtion duration-200 ease-in-out rounded-xl" />
              </div>
              <div>
                <Label htmlFor="opportunity-description">Description (optional)</Label>
                <TextArea
                  value={description}
                  onChange={(val) => setDescription(val)}
                  placeholder="Brief description"
                  rows={3}
                  className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl"
                />
                <div className="text-xs text-neutral-500 mt-1">{200 - description.length} characters left</div>
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="outline" className="rounded-xl px-8 text-sm" onClick={() => setStep('select-fellow')}>Back</Button>
                <Button onClick={() => setStep('final')} disabled={!title} className="bg-primary hover:bg-primary/90 rounded-xl px-8 text-sm text-white disabled:opacity-60 disabled:cursor-not-allowed shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(242,152,73,0.35)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(242,152,73,0.15)] transition duration-200">Continue</Button>
              </div>
            </div>
          )}

          {step === 'final' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="opportunity-deadline">Deadline (optional)</Label>
                <InputWithRing id="opportunity-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} disabled={submitMutation.isPending} className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl" />
              </div>
              <div>
                <Label htmlFor="opportunity-link">Link</Label>
                <InputWithRing id="opportunity-link" type="url" placeholder="https://example.com/opportunity" required value={link} onChange={(e) => setLink(e.target.value)} disabled={submitMutation.isPending} className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl" />
              </div>
              <div className="flex justify-between space-x-2 pt-4">
                <Button variant="outline" className="rounded-xl px-8 text-sm" onClick={() => setStep('details')} disabled={submitMutation.isPending}>Back</Button>
                <Button className="bg-primary hover:bg-primary/90 rounded-xl px-8 text-sm text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(242,152,73,0.35)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(242,152,73,0.15)] transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed" disabled={submitMutation.isPending || !selectedFellow || !title.trim() || !link.trim()} type="submit">
                  {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submitMutation.isPending ? 'Submitting...' : 'Submit Opportunity'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
