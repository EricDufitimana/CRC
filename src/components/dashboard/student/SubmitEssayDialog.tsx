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

function angle(cx: number, cy: number, ex: number, ey: number) {
  const dy = ey - cy;
  const dx = ex - cx;
  const rad = Math.atan2(dy, dx);
  return (rad * 180) / Math.PI;
}

export function SubmitEssayDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const trpc = useTRPC();
  const [step, setStep] = useState<'select-fellow' | 'details' | 'final'>("select-fellow");
  const [selectedFellow, setSelectedFellow] = useState<{ id: string, name: string, specialization: string } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [link, setLink] = useState("");
  const [wordCount, setWordCount] = useState("");

  const { data: fellows } = useSuspenseQuery(trpc.studentDashboard.getFellows.queryOptions());
  const submitMutation = useMutation(trpc.studentDashboard.submitEssay.mutationOptions());

  const resetForm = () => {
    setStep('select-fellow');
    setSelectedFellow(null);
    setTitle('');
    setDescription('');
    setDeadline('');
    setLink('');
    setWordCount('');
  };

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  // Eye following effect
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const eyesRef = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!anchorRef.current || eyesRef.current.length === 0) return;

      const rekt = anchorRef.current.getBoundingClientRect();
      const anchorX = rekt.left + rekt.width / 2;
      const anchorY = rekt.top + rekt.height / 2;

      const angleDeg = angle(e.clientX, e.clientY, anchorX, anchorY);

      eyesRef.current.forEach((eye) => {
        if (eye) {
          eye.style.transform = `rotate(${90 + angleDeg}deg)`;
        }
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFellow) return;

    const promise = submitMutation.mutateAsync({
      adminId: selectedFellow.id,
      title,
      description,
      essayLink: link,
      deadline: deadline || undefined,
      wordCount: wordCount ? parseInt(wordCount) : undefined
    });

    showToastPromise({
      promise,
      loadingText: 'Submitting essay...',
      successText: 'You can track its status on your assignments page.',
      errorText: 'Failed to submit essay. Please try again.',
      successHeaderText: 'Essay Submitted Successfully',
      errorHeaderText: 'Essay Submission Failed',
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
        <div className="relative overflow-visible">
          <div ref={anchorRef} className="absolute top-0 right-0 w-4 h-4"></div>
          
          <Image 
            src="/images/popup/popup-illustration-009.png" 
            alt="Popup Illustration" 
            width={2000}
            height={2000}
            className="absolute top-[140px] right-[-132px] w-32 pointer-events-none z-0"
          />
          
          {/* Left eye */}
          <Image 
            ref={(el) => { eyesRef.current[0] = el; }}
            src="/images/popup/eye.png" 
            alt="Popup Eye" 
            width={30} 
            height={30} 
            className="absolute z-10 top-[180px] right-[-72px]"
          />
          
          {/* Right eye */}
          <Image 
            ref={(el) => { eyesRef.current[1] = el; }}
            src="/images/popup/eye.png" 
            alt="Popup Eye" 
            width={30} 
            height={30} 
            className="absolute z-10 top-[193px] right-[-100px]"
          />
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-120px)]">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-xl pb-4 font-bold text-gray-900 text-center">
              {step === 'select-fellow' && 'Choose your CRC Fellow'}
              {step === 'details' && 'Essay details'}
              {step === 'final' && 'Deadline & link'}
            </DialogTitle>
            <div className="flex items-center justify-center space-x-6 mt-4">
              <div className={`flex items-center ${step === 'select-fellow' ? 'text-statColors-1' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step === 'select-fellow' ? 'bg-statColors-1 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                <span className="ml-2 text-sm font-medium">Fellow</span>
              </div>
              <div className={`w-6 h-px ${step === 'details' ? 'bg-statColors-1' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center ${step === 'details' ? 'text-statColors-1' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step === 'details' ? 'bg-statColors-1 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                <span className="ml-2 text-sm font-medium">Details</span>
              </div>
              <div className={`w-6 h-px bg-gray-200`}></div>
              <div className={`flex items-center ${step === 'final' ? 'text-statColors-1' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step === 'final' ? 'bg-statColors-1 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
                <span className="ml-2 text-sm font-medium">Finish</span>
              </div>
            </div>
          </DialogHeader>

          {step === 'select-fellow' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fellows?.map((fellow) => (
                  <div key={fellow.id} onClick={() => setSelectedFellow(fellow)} className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedFellow?.id === fellow.id ? 'border-statColors-1 bg-statColors-1/10 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'}`}>
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
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button>
                  <Button
                    onClick={() => setStep('details')}
                    disabled={!selectedFellow}
                    className="bg-statColors-1 hover:bg-statColors-1/80 rounded-xl px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="essay-title">Essay Title</Label>
                <InputWithRing id="essay-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter your essay title" className="border  border-neutral-200  transition-colors duration-200 ease-in-out rounded-xl" />
              </div>
              <div>
                <Label htmlFor="essay-description">Description</Label>
                <TextArea
                  value={description}
                  onChange={(val) => setDescription(val)}
                  placeholder="Brief description"
                  rows={3}
                  className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl"
                />
                <div className="text-xs text-neutral-500 mt-1">{200 - description.length} characters left</div>
              </div>
              <div>
                <Label htmlFor="essay-word-count">Word Count (Optional)</Label>
                <InputWithRing id="essay-word-count" type="number" placeholder="Enter word count" value={wordCount} onChange={(e) => setWordCount(e.target.value)} className="border border-neutral-200  transition-colors duration-200 ease-in-out rounded-xl" />
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="outline" className="rounded-xl" onClick={() => setStep('select-fellow')}>Back</Button>
                <Button
                  onClick={() => setStep('final')}
                  className="bg-statColors-1 hover:bg-statColors-1/80 rounded-xl px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 'final' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="essay-deadline">Deadline (Optional)</Label>
                <InputWithRing id="essay-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} disabled={submitMutation.isPending} className="border border-neutral-200  transition-colors duration-200 ease-in-out rounded-xl" />
              </div>
              <div>
                <Label htmlFor="google-docs-link">Google Docs Link</Label>
                <InputWithRing id="google-docs-link" type="url" placeholder="https://docs.google.com/document/d/..." value={link} onChange={(e) => setLink(e.target.value)} disabled={submitMutation.isPending} required className="border border-neutral-200  transition-colors duration-200 ease-in-out rounded-xl" />
              </div>
              <div className="flex justify-between space-x-2 pt-2">
                <Button variant="outline" className="rounded-xl" onClick={() => setStep('details')} disabled={submitMutation.isPending}>Back</Button>
                <Button
                  type="submit"
                  className="bg-statColors-1 hover:bg-statColors-1/80 rounded-xl px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submitMutation.isPending ? 'Submitting...' : 'Submit Essay'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
