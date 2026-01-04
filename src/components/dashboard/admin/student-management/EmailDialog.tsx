"use client";

import { useState, useEffect } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/zenith/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/zenith/components/ui/dialog";
import { Input } from "@/zenith/components/ui/input";
import { Label } from "@/zenith/components/ui/label";
import MDEditor from '@uiw/react-md-editor';
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { showToastPromise } from "@/components/toasts/ToastPromise";
import { showToastError } from "@/components/toasts/ToastError";

interface EmailDialogProps {
  totalSelections: number;
  selectedStudents: Array<{ id: string; email: string }>;
  savedSelections: Array<{ id: string; email: string }>;
  students: any[];
  onEmailSent: () => void;
}

export function EmailDialog({
  totalSelections,
  selectedStudents,
  savedSelections,
  students,
  onEmailSent,
}: EmailDialogProps) {
  const trpc = useTRPC();
  const [isOpen, setIsOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");

  const sendEmailMutation = useMutation({
    ...trpc.studentManagement.sendBulkEmails.mutationOptions(),
    onSuccess: (result) => {
      if (result.success) {
        onEmailSent();
      }
    },
  });

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const recipientEmails = [...selectedStudents, ...savedSelections]
      .map(student => student.email)
      .filter(email => email && email.trim() !== '');
    
    const subject = emailSubject.trim();
    const content = emailContent.trim();

    if (!subject || !content) {
      showToastError({
        headerText: "Validation Error",
        paragraphText: "Subject and content are required",
        direction: 'right'
      });
      return;
    }

    const emailPromise = sendEmailMutation.mutateAsync({
      recipientEmails,
      subject,
      content,
    });
    
    showToastPromise({
      promise: emailPromise,
      loadingText: "Sending emails...",
      successText: "Emails sent successfully!",
      errorText: "Failed to send emails. Please try again.",
      direction: 'right'
    });
  };

  useEffect(() => {
    if (sendEmailMutation.isSuccess && sendEmailMutation.data?.success) {
      setEmailSubject("");
      setEmailContent("");
      setIsOpen(false);
      document.body.style.overflow = '';
    }
  }, [sendEmailMutation.isSuccess, sendEmailMutation.data]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        document.body.style.overflow = '';
      }, 100);
    }
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(() => {
        document.body.style.overflow = '';
      }, 100);
    }
  };

  const handleOpenClick = () => {
    const studentsWithoutEmails = selectedStudents.filter(
      student => !student.email || student.email.trim() === ''
    );
    
    if (studentsWithoutEmails.length > 0) {
      const studentNames = studentsWithoutEmails.map(student => {
        const fullStudent = students.find(s => s.id === student.id);
        return fullStudent?.full_name || `Student ${student.id}`;
      }).join(', ');
      
      showToastError({
        headerText: "Selected students missing emails",
        paragraphText: `${studentNames}`,
        direction: 'right'
      });
      return;
    }
    
    setIsOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="w-full h-9 gap-1.5 text-xs bg-white/80 border-gray-300/80 dark:bg-gray-800/80 dark:border-gray-600/80" 
          disabled={totalSelections === 0 || sendEmailMutation.isPending}
          onClick={handleOpenClick}
        >
          {sendEmailMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Mail className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline">
            {sendEmailMutation.isPending ? "Sending..." : `Email (${totalSelections})`}
          </span>
          <span className="sm:hidden">
            {sendEmailMutation.isPending ? "Sending..." : "Email"}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Selected Students</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleFormSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                name="subject"
                value={emailSubject} 
                onChange={e => setEmailSubject(e.target.value)} 
                placeholder="Enter email subject" 
                className="rounded-xl"
                required
              />
            </div>
            <div data-color-mode="light">
              <Label htmlFor="email-content">Description</Label>
              <input 
                type="hidden" 
                name="content" 
                value={emailContent} 
              />
              <MDEditor 
                value={emailContent} 
                onChange={(value) => setEmailContent(value || "")}
                preview="live"
                height={300}
                id='email-content' 
                textareaProps={{
                  placeholder: "Enter email content...",
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => {
                  setIsOpen(false);
                  setEmailSubject("");
                  setEmailContent("");
                }}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={!emailSubject || !emailContent || sendEmailMutation.isPending}
                className="text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] rounded-xl transition duration-200"
              >
                {sendEmailMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Email"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

