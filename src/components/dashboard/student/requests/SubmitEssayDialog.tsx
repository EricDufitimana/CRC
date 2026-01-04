"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "../../../../../zenith/src/components/ui/textarea";
import { Loader2, Users } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { showToastPromise } from "@/components/toasts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Fellow = {
  id: string;
  name: string;
  specialization: string;
};

type SubmitEssayDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fellows: Fellow[];
  onSuccess: () => void;
};

export function SubmitEssayDialog({ 
  open, 
  onOpenChange, 
  fellows,
  onSuccess 
}: SubmitEssayDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  
  const submitEssayMutation = useMutation({
    ...trpc.studentDashboard.submitEssay.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['studentDashboard', 'getEssays']] });
    }
  });
  
  const [step, setStep] = useState<'select-fellow' | 'details' | 'final'>("select-fellow");
  const [selectedFellow, setSelectedFellow] = useState<Fellow | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [link, setLink] = useState("");
  const [wordCount, setWordCount] = useState("");

  const resetDialog = () => {
    setStep('select-fellow');
    setSelectedFellow(null);
    setTitle("");
    setDescription("");
    setDeadline("");
    setLink("");
    setWordCount("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!link) {
      showToastPromise({
        promise: Promise.reject(new Error("Essay link is required")),
        loadingText: "",
        successText: "",
        errorText: "Essay link is required"
      });
      return;
    }

    const submitPromise = submitEssayMutation.mutateAsync({
      adminId: selectedFellow!.id,
      title,
      description: description || undefined,
      essayLink: link,
      deadline: deadline || undefined,
      wordCount: wordCount ? parseInt(wordCount) : undefined,
    });

    showToastPromise({
      promise: submitPromise,
      loadingText: "Submitting essay...",
      successText: "Essay submitted successfully!",
      errorText: "Failed to submit essay"
    });

    try {
      await submitPromise;
      resetDialog();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      // Error is handled by toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { 
      onOpenChange(open); 
      if (!open) resetDialog();
    }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border-0">
        <DialogHeader>
          <DialogTitle>Submit Essay</DialogTitle>
        </DialogHeader>
        
        {step === 'select-fellow' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-4">Choose a CRC Fellow to review your essay</p>
            </div>
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
              {fellows.map((fellow) => (
                <div
                  key={fellow.id}
                  onClick={() => {
                    setSelectedFellow(fellow);
                    setStep('details');
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

        {step === 'details' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">With <span className="font-semibold text-gray-900">{selectedFellow?.name}</span></p>
              <p className="text-gray-500 text-sm">Provide essay details</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="essay-title">Title</Label>
                <Input
                  id="essay-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter essay title"
                  className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="essay-description">Description</Label>
                <Textarea
                  id="essay-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the essay"
                  className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="essay-link">Link (optional)</Label>
                <Input
                  id="essay-link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://example.com"
                  className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl"
                />
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('select-fellow')} className="rounded-xl px-8 text-sm">Back</Button>
              <Button onClick={() => setStep('final')} disabled={!title} className="bg-orange-500 hover:bg-orange-600 rounded-xl px-8 text-sm text-white disabled:opacity-60 disabled:cursor-not-allowed shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(240,139,81,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(240,139,81,0.1)] transition duration-200">Continue</Button>
            </div>
          </div>
        )}

        {step === 'final' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="essay-deadline">Deadline (optional)</Label>
              <Input id="essay-deadline" name="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl" />
            </div>
            <div>
              <Label htmlFor="essay-word-count">Word Count (optional)</Label>
              <Input id="essay-word-count" name="word_count" value={wordCount} onChange={(e) => setWordCount(e.target.value)} placeholder="e.g., 500" className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl" />
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('details')} className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl px-8">Back</Button>
              <Button type="submit" disabled={isPending || submitEssayMutation.isPending} className="bg-orange-500 hover:bg-orange-600 px-8 py-2 rounded-xl text-white font-medium shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(240,139,81,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(240,139,81,0.1)] transition duration-200">
                {(isPending || submitEssayMutation.isPending) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit Essay
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
