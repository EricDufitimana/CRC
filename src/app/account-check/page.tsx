"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Loader2, Send, Mail, User, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useUserData } from "../../hooks/useUserData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showToastSuccess, showToastError } from "@/components/toasts";

export default function AccountCheckPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [accountExists, setAccountExists] = useState(false);
  const [hasSetup, setHasSetup] = useState<boolean | null>(null);
  const [checkComplete, setCheckComplete] = useState(false); // New state
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const { userId, isLoading: userDataLoading } = useUserData();

  useEffect(() => {
    console.log('Account check page: useEffect triggered');
    console.log('userId:', userId);
    console.log('userDataLoading:', userDataLoading);
    
    // Simulate verification process
    const timer = setTimeout(async () => {
      console.log('Account check page: Timer completed, checking account...');
      
      // Check if user account exists in students table
      if (userId) {
        console.log('Account check page: Checking if user exists in students table...');
        
        // Check if user exists in students table
        const studentResponse = await fetch('/api/check-user-exists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, table: 'students' })
        });

        if (!studentResponse.ok) {
          console.error('Account check page: API error:', studentResponse.status);
          setAccountExists(false);
          setDebugInfo('Error checking account status');
          setIsLoading(false);
          setCheckComplete(true);
          return;
        }

        const studentData = await studentResponse.json();
        const studentExists = studentData.exists;
        console.log('Account check page: Student exists:', studentExists);

        if (studentExists) {
          console.log('Account check page: User account exists, checking setup status...');
          setAccountExists(true);
          
          // Check if user has completed setup
          const setupResponse = await fetch('/api/check-setup-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId })
          });

          if (!setupResponse.ok) {
            console.error('Account check page: Setup status API error:', setupResponse.status);
            setDebugInfo('Error checking setup status');
            setIsLoading(false);
            setCheckComplete(true);
            return;
          }

          const setupData = await setupResponse.json();
          const hasCompletedSetup = setupData.has_setup;
          console.log('Account check page: Has completed setup:', hasCompletedSetup);

          if (hasCompletedSetup) {
            console.log('Account check page: Setup completed, redirecting to student dashboard');
            setDebugInfo(`Setup completed, redirecting to student dashboard...`);
            
            // Show redirect loader directly without showing the "not found" screen
            setRedirecting(true);
            setIsLoading(false);
            
            // Redirect to student dashboard
            setTimeout(() => {
              window.location.href = '/dashboard/student';
            }, 1500);
          } else {
            console.log('Account check page: Setup not completed, redirecting to setup page');
            setDebugInfo(`Setup not completed, redirecting to setup page...`);
            
            // Show redirect loader directly without showing the "not found" screen
            setRedirecting(true);
            setIsLoading(false);
            
            // Redirect to setup page
            setTimeout(() => {
              window.location.href = '/setup';
            }, 1500);
          }
        } else {
          console.log('Account check page: No user account found in database');
          setAccountExists(false);
          setDebugInfo('No user account found in database - account creation required');
          setIsLoading(false);
          setCheckComplete(true);
        }
      } else {
        console.log('Account check page: No userId available');
        setAccountExists(false);
        setDebugInfo('No userId available - please log in first');
        setIsLoading(false);
        setCheckComplete(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [userId, userDataLoading]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);

    try {
      console.log('📤 Sending help support request:', contactForm);
      
      const response = await fetch('/api/send-help-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send help request');
      }

      console.log('✅ Help support request sent successfully:', data);
      
      // Show success toast
      showToastSuccess({
        headerText: 'Help Message Sent Successfully!',
        paragraphText: "We'll get back to you soon!",
        direction: 'left'
      });
      
      // Reset form and close dialog on success
      setContactForm({ name: "", email: "", message: "" });
      setTimeout(() => {
        setIsContactDialogOpen(false);
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error sending help support request:', error);
      
      // Show error toast
      showToastError({
        headerText: 'Failed to Send Request',
        paragraphText: 'Failed to send message. Please try again.',
        direction: 'left'
      });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleContactFormChange = (field: string, value: string) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Show loading state
  if (isLoading || userDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-gray-200 dark:border-gray-700 border-t-green-500 rounded-full animate-spin"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-gray-200 dark:border-gray-700 border-t-green-500 rounded-full animate-spin"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Redirecting...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Taking you to your dashboard
          </p>
        </div>
      </div>
    );
  }

  // Only show "Account Not Found" if check is complete and account doesn't exist
  if (checkComplete && !accountExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 p-4">
        <div className="max-w-4xl w-full text-center">
          {/* Large Illustration */}
          <div className="mb-12">
            <div className="relative w-128 h-96 mx-auto mb-8">
              <Image
                src="/images/illustrations/user-hasnt-created.png"
                alt="Account Not Created"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Minimal Message */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold font-cal-sans text-gray-900 dark:text-white mb-4">
              Account Not Found
            </h1>
            <p className="text-md text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              It looks like you haven&apos;t created your account yet. Please sign up to get started.
            </p>
          </div>

          {/* Minimal Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <Link
              href="/register"
              className="inline-flex items-center px-6 py-2 bg-green-600 text-white text-lg font-medium rounded-xl shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition-all duration-300 hover:bg-green-700 group"
            >
              <ArrowLeft className="w-5 h-5 mr-3 transition-transform duration-300 text-sm group-hover:-translate-x-1 group-hover:scale-110" />
              Create Account
            </Link>
            
            <button
              onClick={() => setIsContactDialogOpen(true)}
              className="inline-flex items-center px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-lg font-medium rounded-xl hover:bg-gray-200 border border-gray-300 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200"
            >
              <Shield className="w-5 h-5 mr-3 text-sm" />
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Return null if none of the above conditions are met (shouldn't happen)
  return (
    <>
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
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={contactForm.name}
                  onChange={(e) => handleContactFormChange("name", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={contactForm.email}
                  onChange={(e) => handleContactFormChange("email", e.target.value)}
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
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleContactFormChange("message", e.target.value)}
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
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
                disabled={isSubmittingContact || !contactForm.name || !contactForm.email || !contactForm.message}
                className="flex-1 bg-dark hover:bg-dark/90"
              >
                {isSubmittingContact ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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