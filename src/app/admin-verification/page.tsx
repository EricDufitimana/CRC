"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  Loader2,
  Send,
  Mail,
  User,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, InputWithRing } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showToastSuccess, showToastError } from "@/components/toasts";
import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

export default function AdminVerificationPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const [checkComplete, setCheckComplete] = useState(false);
  const [shouldShowAdminVerification, setShouldShowAdminVerification] =
    useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        console.log('🔍 [Admin Verification] Starting admin verification...');
        
        // Session is already established by the callback route
        // Just wait a bit to ensure cookies are fully propagated
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error('❌ [Admin Verification] No authenticated user:', userError);
          setDebugInfo('No authenticated user - please log in first');
          setIsLoading(false);
          setCheckComplete(true);
          setShouldShowAdminVerification(true);
          return;
        }

        const userId = user.id;
        console.log('👤 [Admin Verification] User ID:', userId);

        // Check if user exists in admins table
        const adminData = await queryClient.fetchQuery(
          trpc.auth.checkUserExists.queryOptions({
            userId,
            table: "admins",
          })
        );

        const adminExists = adminData.exists;
        console.log('📊 [Admin Verification] Admin exists:', adminExists);

        if (adminExists) {
          console.log('✅ [Admin Verification] Admin user detected, redirecting...');
          setDebugInfo(`Admin user detected (ID: ${userId}), redirecting...`);
          setRedirecting(true);
          setIsLoading(false);

          setTimeout(() => {
            window.location.href = "/dashboard/admin";
          }, 800);
        } else {
          console.log('❌ [Admin Verification] No admin account found in database');
          setShouldShowAdminVerification(true);
          setDebugInfo('No admin account found in database - access denied');
          setIsLoading(false);
          setCheckComplete(true);
        }
      } catch (error) {
        console.error('❌ [Admin Verification] Error checking admin status:', error);
        setShouldShowAdminVerification(true);
        setDebugInfo(`Error checking admin status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsLoading(false);
        setCheckComplete(true);
      }
    };

    checkAdminStatus();
  }, [supabase, trpc, queryClient]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);

    try {
      console.log("📤 Sending help support request:", contactForm);

      const response = await fetch("/api/send-help-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send help request");
      }

      console.log("✅ Help support request sent successfully:", data);

      // Show success toast
      showToastSuccess({
        headerText: "Help Message Sent Successfully!",
        paragraphText: "We'll get back to you soon!",
        direction: "left",
      });

      // Reset form and close dialog on success
      setContactForm({ name: "", email: "", message: "" });
      setTimeout(() => {
        setIsContactDialogOpen(false);
      }, 1000);
    } catch (error) {
      console.error("❌ Error sending help support request:", error);

      // Show error toast
      showToastError({
        headerText: "Failed to Send Request",
        paragraphText: "Failed to send message. Please try again.",
        direction: "left",
      });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleContactFormChange = (field: string, value: string) => {
    setContactForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-primary dark:border-gray-700"></div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Checking Account...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we verify your account status
          </p>
        </div>
      </div>
    );
  }

  // Show redirect state
  if (redirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-primary dark:border-gray-700"></div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Redirecting...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Taking you to your dashboard
          </p>
        </div>
      </div>
    );
  }

  // Only show admin verification page if check is complete and user should see it
  if (checkComplete && shouldShowAdminVerification) {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center bg-white p-4 dark:bg-gray-900 h-short:p-0">
          <div className="w-full max-w-4xl text-center">
            {/* Large Illustration */}
            <div className="mb-12 ml-8">
              <div className="w-108 relative mx-auto mb-8 h-96">
                <Image
                  src="/images/illustrations/unauthorized.svg"
                  alt="Unauthorized Access"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Minimal Message */}
            <div className="mb-4">
              <h1 className="mb-4 font-cal-sans text-4xl font-bold text-gray-900 dark:text-white">
                Oops! Access Restricted
              </h1>
              <p className="text-md mx-auto max-w-2xl leading-relaxed text-gray-600 dark:text-gray-400">
                You don&apos;t have permission to access this area. Please check
                your credentials or contact support if you believe this is an
                error.
              </p>
            </div>

            {/* Minimal Action Buttons */}
            <div className="mb-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
              <Link
                href="/login"
                className="text-md group inline-flex items-center rounded-xl bg-[#F56843] px-6 py-4 font-medium text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition-all duration-300 hover:bg-[#F56843]/80"
              >
                <ArrowLeft className="mr-3 h-5 w-5 text-sm transition-transform duration-300 group-hover:-translate-x-1 group-hover:scale-110" />
                Back to Login
              </Link>

              <button
                onClick={() => setIsContactDialogOpen(true)}
                className="text-md inline-flex items-center rounded-xl border border-gray-300 bg-gray-100 px-6 py-[15px] font-medium text-gray-700 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              >
                <Shield className="mr-3 h-5 w-5 text-sm" />
                Contact Support
              </button>
            </div>
          </div>
        </div>

        {/* Contact Support Dialog */}
        <Dialog
          open={isContactDialogOpen}
          onOpenChange={setIsContactDialogOpen}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Contact Support
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <InputWithRing
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={contactForm.name}
                    onChange={(e) =>
                      handleContactFormChange("name", e.target.value)
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <InputWithRing
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={contactForm.email}
                    onChange={(e) =>
                      handleContactFormChange("email", e.target.value)
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  placeholder="Describe your issue or question..."
                  value={contactForm.message}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleContactFormChange("message", e.target.value)
                  }
                  className="min-h-[100px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out focus:ring-2 focus:ring-gray-500/40 hover:ring-2 hover:ring-gray-500/10 focus:border-gray-500/60"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsContactDialogOpen(false)}
                  className="flex-1"
                  disabled={isSubmittingContact}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmittingContact ||
                    !contactForm.name ||
                    !contactForm.email ||
                    !contactForm.message
                  }
                  className="flex-1 bg-dark hover:bg-dark/90"
                >
                  {isSubmittingContact ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Send Message
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Return null if none of the above conditions are met (shouldn't happen)
  return null;
}
