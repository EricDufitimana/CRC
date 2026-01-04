"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Send, ClipboardCheck } from "lucide-react";
import { RequestSessionDialog } from "./RequestSessionDialog";
import { SubmitEssayDialog } from "./SubmitEssayDialog";
import { SubmitOpportunityDialog } from "./SubmitOpportunityDialog";
import { SubmitAssignmentDialog } from "./SubmitAssignmentDialog";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickActionProps {
  icon: any;
  label: string;
  onClick: () => void;
  bgClass: string;
}

function QuickAction({ icon: Icon, label, onClick, bgClass }: QuickActionProps) {
  return (
    <Button
      variant="outline"
      className="w-full justify-start h-auto py-4 h-short:py-3 rounded-xl gap-3 hover:shadow-sm transition-all"
      onClick={onClick}
    >
      <span className={`h-10 w-10 h-short:h-9 h-short:w-9 rounded-full ${bgClass} grid place-items-center flex-shrink-0`}>
        <Icon className="h-5 w-5 h-short:h-4 h-short:w-4 text-neutral-900" />
      </span>
      <span className="text-sm font-medium truncate">{label}</span>
    </Button>
  );
}

export function StudentQuickActions() {
  const [requestSessionOpen, setRequestSessionOpen] = useState(false);
  const [submitEssayOpen, setSubmitEssayOpen] = useState(false);
  const [submitOpportunityOpen, setSubmitOpportunityOpen] = useState(false);
  const [submitAssignmentOpen, setSubmitAssignmentOpen] = useState(false);

  return (
    <>
      <Card className="border-0 shadow-sm ring-1 ring-black/5 flex-shrink-0 m-0.5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-short:gap-2">
            <QuickAction
              icon={Calendar}
              label="Request Session"
              onClick={() => setRequestSessionOpen(true)}
              bgClass="bg-yearcolors-ey"
            />
            <QuickAction
              icon={FileText}
              label="Submit Essay"
              onClick={() => setSubmitEssayOpen(true)}
              bgClass="bg-yearcolors-s5"
            />
            <QuickAction
              icon={Send}
              label="Submit Opportunity"
              onClick={() => setSubmitOpportunityOpen(true)}
              bgClass="bg-yearcolors-s4"
            />
            <QuickAction
              icon={ClipboardCheck}
              label="Submit Assignment"
              onClick={() => setSubmitAssignmentOpen(true)}
              bgClass="bg-yearcolors-s6"
            />
          </div>
        </CardContent>
      </Card>

      <RequestSessionDialog open={requestSessionOpen} onOpenChange={setRequestSessionOpen} />
      <SubmitEssayDialog open={submitEssayOpen} onOpenChange={setSubmitEssayOpen} />
      <SubmitOpportunityDialog open={submitOpportunityOpen} onOpenChange={setSubmitOpportunityOpen} />
      <SubmitAssignmentDialog open={submitAssignmentOpen} onOpenChange={setSubmitAssignmentOpen} />
    </>
  );
}
