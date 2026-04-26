"use client";

import { useState } from "react";
import { Mail, Loader2, X } from "lucide-react";
import { Button } from "@/zenith/components/ui/button";
import { showToastError } from "@/components/toasts/ToastError";

interface EmailDialogProps {
  totalSelections: number;
  selectedStudents: Array<{ id: string; email: string | null }>;
  savedSelections: Array<{ id: string; email: string | null }>;
  students: any[];
  onEmailSent: () => void;
  adminEmail?: string | null;
}

export function EmailDialog({
  totalSelections,
  selectedStudents,
  savedSelections,
  students,
  onEmailSent,
  adminEmail,
}: EmailDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [studentsWithoutEmails, setStudentsWithoutEmails] = useState<Array<{ id: string; full_name: string }>>([]);
  const [showWarning, setShowWarning] = useState(true);

  const handleMailtoClick = () => {
    const recipientEmails = [...selectedStudents, ...savedSelections]
      .map(student => student.email)
      .filter((email): email is string => !!email && email.trim() !== '');

    // Track students without emails for display
    const allSelected = [...selectedStudents, ...savedSelections];
    const withoutEmails = allSelected
      .filter(student => !student.email || student.email.trim() === '')
      .map(student => {
        const fullStudent = students.find(s => s.id === student.id);
        return {
          id: student.id,
          full_name: fullStudent?.full_name || `Student ${student.id}`
        };
      });
    
    setStudentsWithoutEmails(withoutEmails);
    setShowWarning(true); // Show warning when new students are detected

    if (recipientEmails.length === 0) {
      showToastError({
        headerText: "No recipients",
        paragraphText: "Please select at least one student with an email.",
        direction: 'right'
      });
      return;
    }

    setIsLoading(true);

    // Show warning toast before opening Gmail
    if (adminEmail) {
      showToastError({
        headerText: "Opening Gmail",
        paragraphText: `Make sure you're signed in as ${adminEmail}`,
        direction: 'right'
      });
    }

    // Small delay to allow toast to show
    setTimeout(() => {
      const mailto = `https://mail.google.com/mail/?authuser=${encodeURIComponent(adminEmail ?? '')}&view=cm&to=${encodeURIComponent(recipientEmails.join(','))}`;
      window.open(mailto, '_blank');
      setIsLoading(false);
      onEmailSent();
    }, 500);
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        className="w-full h-11 gap-1.5 text-xs bg-white/80 border-gray-300/80 dark:bg-gray-800/80 dark:border-gray-600/80" 
        disabled={totalSelections === 0 || isLoading}
        onClick={handleMailtoClick}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Mail className="h-3.5 w-3.5" />
        )}
        <span className="hidden sm:inline">
          {isLoading ? "Opening..." : `Email (${totalSelections})`}
        </span>
        <span className="sm:hidden">
          {isLoading ? "Opening..." : "Email"}
        </span>
      </Button>
      
      {studentsWithoutEmails.length > 0 && showWarning && (
        <div className="col-span-full p-3 bg-amber-50 border border-amber-200 rounded-lg relative">
          <button
            onClick={() => setShowWarning(false)}
            className="absolute top-2 right-2 text-amber-600 hover:text-amber-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-sm font-medium text-amber-800 mb-2 pr-6">
            The following students don't have email addresses in the database:
          </p>
          <p className="text-sm text-amber-700">
            {studentsWithoutEmails.map((student, index) => (
              <span key={student.id}>
                {student.full_name}
                {index < studentsWithoutEmails.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>
        </div>
      )}
    </>
  );
}

