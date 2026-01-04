"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Users } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { showToastPromise } from "@/components/toasts";

type Fellow = {
  id: string;
  name: string;
  specialization: string;
};

type SubmitOpportunityDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fellows: Fellow[];
  onSuccess: () => void;
};

export function SubmitOpportunityDialog({ 
  open, 
  onOpenChange, 
  fellows,
  onSuccess 
}: SubmitOpportunityDialogProps) {
  const trpc = useTRPC();
  
  const submitOpportunityMutation = useMutation({
    ...trpc.studentDashboard.submitOpportunity.mutationOptions(),
    onSuccess: () => {
      onSuccess();
    }
  });
  
  const [step, setStep] = useState<'select-fellow' | 'details' | 'final'>("select-fellow");
  const [selectedFellow, setSelectedFellow] = useState<Fellow | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [link, setLink] = useState("");

  const resetDialog = () => {
    setStep('select-fellow');
    setSelectedFellow(null);
    setTitle("");
    setDescription("");
    setDeadline("");
    setLink("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitPromise = submitOpportunityMutation.mutateAsync({
      adminId: selectedFellow!.id,
      title,
      description: description || undefined,
      link: link || undefined,
      deadline: deadline || undefined,
    });

    showToastPromise({
      promise: submitPromise,
      loadingText: "Submitting opportunity...",
      successText: "Opportunity submitted successfully!",
      errorText: "Failed to submit opportunity"
    });

    try {
      await submitPromise;
      resetDialog();
      onOpenChange(false);
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
          <DialogTitle>Submit Opportunity</DialogTitle>
        </DialogHeader>
        
        {step === 'select-fellow' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-4">Choose a CRC Fellow to review your opportunity</p>
            </div>
            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
              {fellows.map((fellow) => (
                <div
                  key={fellow.id}
                  onClick={() => {
                    setSelectedFellow(fellow);
                    setStep('details');
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

        {step === 'details' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">With <span className="font-semibold text-gray-900">{selectedFellow?.name}</span></p>
              <p className="text-gray-500 text-sm">Provide opportunity details</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="opp-title">Title</Label>
                <Input
                  id="opp-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter opportunity title"
                  className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="opp-description">Description</Label>
                <Textarea
                  id="opp-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the opportunity"
                  className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="opp-link">Link (optional)</Label>
                <Input
                  id="opp-link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://example.com"
                  className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl"
                />
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('select-fellow')} className="rounded-xl px-8 text-sm">Back</Button>
              <Button onClick={() => setStep('final')} disabled={!title} className="bg-statColors-1 hover:bg-statColors-1/80 rounded-xl px-8 text-sm text-white disabled:opacity-60 disabled:cursor-not-allowed shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200">Continue</Button>
            </div>
          </div>
        )}

        {step === 'final' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="opportunity-deadline">Deadline (optional)</Label>
              <Input id="opportunity-deadline" name="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl" />
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('details')} className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl px-8">Back</Button>
              <Button type="submit" disabled={submitOpportunityMutation.isPending} className="bg-statColors-1 hover:bg-statColors-1/80 px-8 py-2 rounded-xl text-white font-medium shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200">
                {submitOpportunityMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit Opportunity
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
