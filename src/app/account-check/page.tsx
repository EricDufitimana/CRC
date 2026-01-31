"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Send, Mail, User, MessageSquare } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, InputWithRing } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showToastSuccess, showToastError } from "@/components/toasts";
import { useTRPC } from "@/trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

export default function AccountCheckPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const [accountExists, setAccountExists] = useState(false);
  const [checkComplete, setCheckComplete] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    const checkAccount = async () => {
      try {
        console.log('🔍 [Account Check] Starting account verification...');
        console.log('🔍 [Account Check] Current URL:', window.location.href);
        console.log('🔍 [Account Check] User agent:', navigator.userAgent);

        // Session is already established by the callback route
        // Just wait a bit to ensure cookies are fully propagated
        console.log('🔍 [Account Check] Waiting for session propagation...');
        await new Promise(resolve => setTimeout(resolve, 800));

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error('❌ [Account Check] No authenticated user:', userError);
          console.error('❌ [Account Check] User error details:', {
            message: userError?.message,
            status: userError?.status,
          });
          setDebugInfo('No authenticated user - please log in first');
          setIsLoading(false);
          setCheckComplete(true);
          return;
        }

        const userId = user.id;
        console.log('👤 [Account Check] User authenticated successfully');
        console.log('👤 [Account Check] User ID:', userId);
        console.log('👤 [Account Check] User email:', user.email);
        console.log('👤 [Account Check] User metadata:', user.user_metadata);
        console.log('👤 [Account Check] User app metadata:', user.app_metadata);

        // Check if user exists in students table using tRPC
        console.log('🔍 [Account Check] Checking student table...');
        const studentData = await queryClient.fetchQuery(
          trpc.auth.checkUserExists.queryOptions({ userId, table: "students" })
        );

        const studentExists = studentData.exists;
        console.log('📊 [Account Check] Student exists:', studentExists);

        // Check if user exists in admin table using tRPC
        console.log('🔍 [Account Check] Checking admin table...');
        const adminData = await queryClient.fetchQuery(
          trpc.auth.checkUserExists.queryOptions({ userId, table: "admins" })
        );

        const adminExists = adminData.exists;
        console.log('📊 [Account Check] Admin exists:', adminExists);

        if (studentExists) {
          console.log('✅ [Account Check] User is a student');
          setAccountExists(true);

          // Check setup status using tRPC
          console.log('🔍 [Account Check] Checking setup status...');
          const setupData = await queryClient.fetchQuery(
            trpc.auth.checkSetupStatus.queryOptions({ userId })
          );

          const hasCompletedSetup = setupData.has_setup;
          console.log('✅ [Account Check] Setup completed:', hasCompletedSetup);

          if (hasCompletedSetup) {
            console.log('➡️ [Account Check] Redirecting to student dashboard');
            setDebugInfo('Redirecting to your dashboard...');
            setRedirecting(true);
            setIsLoading(false);

            setTimeout(() => {
              console.log('🔄 [Account Check] Executing redirect to /dashboard/student');
              window.location.href = "/dashboard/student";
            }, 800);
          } else {
            console.log('➡️ [Account Check] Redirecting to setup page');
            setDebugInfo('Redirecting to setup...');
            setRedirecting(true);
            setIsLoading(false);

            setTimeout(() => {
              console.log('🔄 [Account Check] Executing redirect to /setup');
              window.location.href = "/setup";
            }, 800);
          }
        } else if (adminExists) {
          console.log('✅ [Account Check] User is an admin');
          setAccountExists(true);

          // Check if super admin
          console.log('🔍 [Account Check] Checking super admin status...');
          const superAdminData = await queryClient.fetchQuery(
            trpc.auth.checkSuperAdmin.queryOptions({ userId })
          );

          if (superAdminData.success) {
            console.log('👑 [Account Check] User is super admin');
            setDebugInfo('Redirecting to admin dashboard...');
            setRedirecting(true);
            setIsLoading(false);

            setTimeout(() => {
              if (superAdminData.redirectTo) {
                console.log('🔄 [Account Check] Executing redirect to', superAdminData.redirectTo);
                window.location.href = superAdminData.redirectTo;
              } else {
                console.warn('⚠️ [Account Check] Success was true but redirectTo was missing, using default');
                window.location.href = "/dashboard/admin";
              }
            }, 800);
          } else {
            console.log('🔧 [Account Check] User is regular admin');
            setDebugInfo('Redirecting to admin dashboard...');
            setRedirecting(true);
            setIsLoading(false);

            setTimeout(() => {
              console.log('🔄 [Account Check] Executing redirect to /dashboard/admin');
              window.location.href = "/dashboard/admin";
            }, 800);
          }
        } else {
          console.log('❌ [Account Check] No account found in either students or admins table');
          console.log('❌ [Account Check] User ID not found:', userId);
          setAccountExists(false);
          setDebugInfo('Account creation required - User not found in system');
          setIsLoading(false);
          setCheckComplete(true);
        }
      } catch (error) {
        console.error('❌ [Account Check] Error during account check:', error);
        console.error('❌ [Account Check] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        console.error('❌ [Account Check] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          name: error instanceof Error ? error.name : 'Unknown',
        });
        setAccountExists(false);
        setDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown'}`);
        setIsLoading(false);
        setCheckComplete(true);
      }
    };

    checkAccount();
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

      showToastSuccess({
        headerText: "Help Message Sent Successfully!",
        paragraphText: "We'll get back to you soon!",
        direction: "left",
      });

      setContactForm({ name: "", email: "", message: "" });
      setTimeout(() => {
        setIsContactDialogOpen(false);
      }, 1000);
    } catch (error) {
      console.error("❌ Error sending help support request:", error);

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
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-green-500 dark:border-gray-700"></div>
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
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-green-500 dark:border-gray-700"></div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Redirecting...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {debugInfo}
          </p>
        </div>
      </div>
    );
  }

  // Show "Account Not Found" if check is complete and account doesn't exist
  if (checkComplete && !accountExists) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4 dark:bg-gray-900">
        <div className="w-full max-w-4xl text-center">
          <div className="mb-12">
            <div className="w-108 relative mx-auto mb-8 h-96">
              <Image
                src="/images/illustrations/not-found.svg"
                alt="Account Not Created"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div className="mb-4">
            <h1 className="mb-4 font-cal-sans text-4xl font-bold text-gray-900 dark:text-white">
              Account Not Found
            </h1>
            <p className="text-md mx-auto max-w-2xl leading-relaxed text-gray-600 dark:text-gray-400">
              It looks like you haven&apos;t created your account yet. Please
              sign up to get started.
            </p>
          </div>

          <div className="mb-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex items-center rounded-xl bg-[#274D76] px-6 py-2 text-lg font-medium text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition-all duration-300 hover:bg-[#274D76]/80"
            >
              <ArrowLeft className="mr-3 h-5 w-5 text-sm transition-transform duration-300 group-hover:-translate-x-1 group-hover:scale-110" />
              Create Account
            </Link>

            <button
              onClick={() => setIsContactDialogOpen(true)}
              className="inline-flex items-center rounded-xl border border-gray-300 bg-gray-100 px-6 py-2 text-lg font-medium text-gray-700 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            >
              <Shield className="mr-3 h-5 w-5 text-sm" />
              Contact Support
            </button>
          </div>
        </div>

        {/* Contact Support Dialog */}
        <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
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
                  className="min-h-[100px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm"
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
      </div>
    );
  }

  return null;
}