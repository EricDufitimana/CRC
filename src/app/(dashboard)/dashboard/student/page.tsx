"use client";

import { useMemo, useEffect, useState, useActionState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../zenith/src/components/ui/card";
import { Button } from "../../../../../zenith/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../../zenith/src/components/ui/avatar";
import { Badge } from "../../../../../zenith/src/components/ui/badge";
import { Progress } from "../../../../../zenith/src/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import Image from "next/image";
import { Calendar, FileText, Briefcase, CheckCircle, ClipboardCheck, Bell, ArrowRight, Users, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../../zenith/src/components/ui/dialog";
import { Input ,InputWithRing} from "@/components/ui/input";
import { Textarea } from "../../../../../zenith/src/components/ui/textarea";
import { Label } from "../../../../../zenith/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../zenith/src/components/ui/select";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "../../../../../zenith/src/components/ui/command";
import { FileUpload } from "../../../../../zenith/src/components/ui/file-upload";
import { Skeleton } from "../../../../../zenith/src/components/ui/skeleton";
import { getCalApi } from "@calcom/embed-react";
import { submitEssayHandler } from "@/actions/essays/submitEssayHandler";
import { submitOpportunityHandler } from "@/actions/opportunities/submitOpportunityHandler";
import { submitAssignmentHandler } from "@/actions/assignments/submitAssignmentHandler";
import { useUserData } from "@/hooks/useUserData";
import { showToastPromise } from "@/components/toasts";
import MarkdownIt from 'markdown-it';
import useFollowEyes from "@/components/other/useFollowEyes";

import {useSpring, animated} from "@react-spring/web";
import AnimateOnScroll from "@/components/animation/animateOnScroll";
import { AnimatedNumber } from "@/components/animation/AnimatedNumber";

function Number({ n }: { n: number }) {
  return (
    <AnimatedNumber
      value={n}
      duration={1.8}
      delay={0.3}
      ease="back.out(1.7)"
      triggerStart="top 90%"
      className="inline-block"
    />
  );
}

export default function AspenDashboard() {
  const [submitEssayOpen, setSubmitEssayOpen] = useState(false);
  const [submitOpportunityOpen, setSubmitOpportunityOpen] = useState(false);
  const [requestSessionOpen, setRequestSessionOpen] = useState(false);
  const [submitAssignmentOpen, setSubmitAssignmentOpen] = useState(false);
  
  // Initialize the follow eyes effect
  useFollowEyes();
  
  // Refs for eye following effect
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const eyesRef = useRef<(HTMLImageElement | null)[]>([]);
  
  // Eye following effect
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
  
  // Loading states for form submissions
  const [isEssaySubmitting, setIsEssaySubmitting] = useState(false);
  const [isOpportunitySubmitting, setIsOpportunitySubmitting] = useState(false);
  const [isAssignmentSubmitting, setIsAssignmentSubmitting] = useState(false);
  const [crcFellows, setCrcFellows] = useState<Array<{id: string, name: string, specialization: string}>>([]);
  const { userId, studentId, adminId, isLoading: userDataLoading } = useUserData();
  const [bookingStep, setBookingStep] = useState<'select-admin' | 'select-time' | 'booking'>('select-admin');
  const [selectedAdmin, setSelectedAdmin] = useState<{id: string, name: string, specialization: string} | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const sessionDurations = [
    { value: "20_min", label: "20 min", description: "Quick review" },
    { value: "40_min", label: "40 min", description: "Standard session" },
    { value: "60_min", label: "60 min", description: "Comprehensive review" }
  ];

  type Assignment = { id: string; title: string; submission_style: 'google_link' | 'file_upload'; created_at?: string | null };
  type Workshop = { 
    id: string; 
    title: string; 
    date: string | null; 
    has_assignment?: boolean; 
    assignments?: Assignment[];
    crc_classes?: Array<{ id: string; name: string }>;
  };

  // Submit Assignment (multi-step)
  const [assignmentStep, setAssignmentStep] = useState<'select-workshop' | 'select-assignment' | 'submit'>('select-workshop');
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isWorkshopsLoading, setIsWorkshopsLoading] = useState(false);
  const [googleDocLink, setGoogleDocLink] = useState("");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [latestAssignments, setLatestAssignments] = useState<Assignment[]>([]);
  const [isAssignmentsLoading, setIsAssignmentsLoading] = useState(true);

  // Submit Essay (multi-step)
  const [essayStep, setEssayStep] = useState<'select-fellow' | 'details' | 'final'>("select-fellow");
  const [selectedEssayFellow, setSelectedEssayFellow] = useState<{id: string, name: string, specialization: string} | null>(null);
  const [essayTitle, setEssayTitle] = useState("");
  const [essayDescription, setEssayDescription] = useState("");
  const [essayDeadline, setEssayDeadline] = useState("");
  const [essayLink, setEssayLink] = useState("");
  const [essayWordCount, setEssayWordCount] = useState("");

  // Submit Opportunity (multi-step)
  const [oppStep, setOppStep] = useState<'select-fellow' | 'details' | 'final'>("select-fellow");
  const [selectedOppFellow, setSelectedOppFellow] = useState<{id: string, name: string, specialization: string} | null>(null);
  const [oppTitle, setOppTitle] = useState("");
  const [oppDescription, setOppDescription] = useState("");
  const [oppDeadline, setOppDeadline] = useState("");
  const [oppLink, setOppLink] = useState("");
  const [stats, setStats] = useState([
    { label: "Assignments Not Done", value: 0, icon: ClipboardCheck, tint: "bg-emerald-100 text-emerald-700" },
    { label: "Essays Submitted", value: 0, icon: FileText, tint: "bg-sky-100 text-sky-700" },
    { label: "Opportunities Submitted", value: 0, icon: Briefcase, tint: "bg-violet-100 text-violet-700" },
  ]);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const upcomingSessions = useMemo(
    () => [
      { id: 1, title: "Essay Review", mentor: "CRC Fellow", date: "Thu, 2:00 PM", duration: "45 min", type: "Virtual" },
      { id: 2, title: "Career Coaching", mentor: "CRC Fellow", date: "Fri, 10:00 AM", duration: "60 min", type: "In-person" },
      { id: 3, title: "Interview Practice", mentor: "CRC Fellow", date: "Mon, 9:30 AM", duration: "30 min", type: "Virtual" },
    ],
    []
  );

  type NotificationItem = { id: string; message: string; page: string | null };
  const [studentNotifs, setStudentNotifs] = useState<NotificationItem[]>([]);
  const [otherNotifs, setOtherNotifs] = useState<NotificationItem[]>([]);
  const [isNotifLoading, setIsNotifLoading] = useState(true);
  
  // Initialize markdown-it for rendering notification messages
  const md = new MarkdownIt({
    html: false, // Disable HTML for security
    linkify: true, // Auto-detect and convert URLs to links
    typographer: true, // Enable some language-neutral replacement + quotes beautification
  });
  
  const renderMarkdown = (text: string) => {
    try {
      return md.render(text);
    } catch (error) {
      console.error('Error rendering markdown:', error);
      return text; // Fallback to plain text if markdown rendering fails
    }
  };
  
  // Add custom CSS for markdown content styling (same as admin dashboard)
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .student-announcement-markdown {
        background: transparent !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .student-announcement-markdown h1,
      .student-announcement-markdown h2,
      .student-announcement-markdown h3,
      .student-announcement-markdown h4,
      .student-announcement-markdown h5,
      .student-announcement-markdown h6 {
        margin: 0.5em 0 0.25em 0 !important;
        font-size: inherit !important;
        font-weight: 600 !important;
      }
      .student-announcement-markdown p {
        margin: 0.25em 0 !important;
      }
      .student-announcement-markdown ul,
      .student-announcement-markdown ol {
        margin: 0.25em 0 !important;
        padding-left: 1.5em !important;
      }
      .student-announcement-markdown li {
        margin: 0.1em 0 !important;
      }
      .student-announcement-markdown strong {
        font-weight: 600 !important;
      }
      .student-announcement-markdown em {
        font-style: italic !important;
      }
      .student-announcement-markdown code {
        background: rgba(0,0,0,0.1) !important;
        padding: 0.1em 0.3em !important;
        border-radius: 0.2em !important;
        font-size: 0.9em !important;
      }
      .student-announcement-markdown a {
        color: #3b82f6 !important;
        text-decoration: underline !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        border-radius: 2px !important;
        padding: 1px 2px !important;
      }
      .student-announcement-markdown a:hover {
        color: #1d4ed8 !important;
        text-decoration: underline !important;
        background-color: rgba(59, 130, 246, 0.1) !important;
        text-decoration-thickness: 2px !important;
      }
      .student-announcement-markdown a:focus {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px !important;
      }
      .student-announcement-markdown blockquote {
        border-left: 3px solid #e5e7eb !important;
        padding-left: 1em !important;
        margin: 0.5em 0 !important;
        font-style: italic !important;
        color: #6b7280 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);
  
  const formatPageLabel = (page: string | null) => {
    if (page === 'student_dashboard') return 'General';
    if (page === 'english_language_learning') return 'English Learning';
    if (!page) return 'Other';
    return page.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).replace('New', 'New ');
  };
  const getAccentBg = (page: string | null) => {
    // Group by category with consistent accents
    const resources = new Set([
      'templates',
      'crp',
      'internships',
      'english_language_learning',
      'job_readiness_course',
    ]);
    const events = new Set([
      'previous_events',
      'upcoming_events',
    ]);
    const workshops = new Set([
      's4_workshops',
      'ey_workshops',
      'senior_5_group_a_b_workshops',
      'senior_5_customer_care',
      'senior_6_group_a_b_workshops',
      'senior_6_group_c_workshops',
      'senior_6_group_d',
    ]);
    const opportunities = new Set([
      'new_opportunities',
      'recurring_opportunities',
      'approved_opportunities',
    ]);

    if (!page) return 'bg-neutral-300 hover:bg-neutral-300';
    if (resources.has(page)) return 'bg-yearcolors-ey hover:bg-yearcolors-ey';
    if (events.has(page)) return 'bg-yearcolors-s6 hover:bg-yearcolors-s6';
    if (workshops.has(page)) return 'bg-yearcolors-s5 hover:bg-yearcolors-s5';
    if (opportunities.has(page)) return 'bg-yearcolors-s4 hover:bg-yearcolors-s4';
    return 'bg-neutral-300 hover:bg-neutral-300';
  };
  useEffect(() => {
    // Fetch latest assignments for the card
    const fetchLatestAssignments = async () => {
      if (!studentId) return; // Don't fetch until we have studentId
      
      try {
        setIsAssignmentsLoading(true);
        const response = await fetch(`/api/assignments/fetch?studentId=${studentId}&limit=5`);
        if (!response.ok) throw new Error('Failed to fetch assignments');
        const json = await response.json();
        const list: Assignment[] = (Array.isArray(json) ? json : []) as Assignment[];
        setLatestAssignments(list);
      } catch (e) {
        setLatestAssignments([]);
      } finally {
        // small delay to avoid flicker before rendering empty state
        setTimeout(() => setIsAssignmentsLoading(false), 250);
      }
    };
    fetchLatestAssignments();
  }, [studentId]); // Add studentId as dependency
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsNotifLoading(true);
      try {
        const res = await fetch('/api/announcements/fetch');
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: NotificationItem[] = data.map((n: any) => ({ id: String(n.id), message: n.message || '', page: n.page || null }));
          setStudentNotifs(mapped.filter((n) => n.page === 'student_dashboard'));
          setOtherNotifs(mapped.filter((n) => n.page !== 'student_dashboard'));
        } else {
          setStudentNotifs([]);
          setOtherNotifs([]);
        }
      } catch (e) {
        setStudentNotifs([]);
        setOtherNotifs([]);
      } finally {
        setTimeout(() => setIsNotifLoading(false), 250);
      }
    };
    fetchNotifications();
  }, []);

  // Fetch fellows
  useEffect(() => {
    const fetchFellows = async () => {
      try {
        const response = await fetch('/api/fellows');
        if (response.ok) {
          const data = await response.json();
          setCrcFellows(data);
        }
      } catch (e) {
        // Silent error handling
      }
    };
    fetchFellows();
  }, []);

  // Student ID is now provided by useUserData hook - no need to fetch separately

  // Action handlers (essay/opportunity)
  const handleEssaySubmission = async (prevState: any, formData: FormData) => {
    if (!studentId) {
      return { success: false, message: 'Student ID not found.' };
    }
    formData.append('student_id', String(studentId));
    return await submitEssayHandler(prevState, formData);
  };

  const handleEssayFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsEssaySubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      const essayPromise = submitEssayHandler(essayState, formData);
      
      showToastPromise({
        promise: essayPromise,
        loadingText: 'Submitting essay...',
        successText: 'You can track its status on your assignments page.',
        errorText: 'Failed to submit essay. Please try again.',
        successHeaderText: 'Essay Submitted Successfully',
        errorHeaderText: 'Essay Submission Failed',
        direction: 'right'
      });
      
      // Wait for actual submission to complete
      await essayPromise;
      // Only reset on successful submission
      resetEssayForm();
    } catch (error) {
      // Handle error case
      resetEssayForm(); // Reset on error for consistent UX
    } finally {
      setIsEssaySubmitting(false);
    }
  };

  const resetEssayForm = () => {
    setSubmitEssayOpen(false);
    setEssayStep('select-fellow');
    setSelectedEssayFellow(null);
    setEssayTitle('');
    setEssayDescription('');
    setEssayDeadline('');
    setEssayLink('');
    setEssayWordCount('');
  };
  const [essayState, essayFormAction, isEssayPending] = useActionState(handleEssaySubmission, {
    success: false,
    message: '',
    data: null
  });
  useEffect(() => {
    if (essayState.success) {
      setSubmitEssayOpen(false);
      setEssayStep("select-fellow");
      setSelectedEssayFellow(null);
      setEssayTitle("");
      setEssayDescription("");
      setEssayDeadline("");
      setEssayLink("");
      setEssayWordCount("");
    }
  }, [essayState.success]);

  const handleOpportunitySubmission = async (prevState: any, formData: FormData) => {
    if (!studentId) {
      return { success: false, message: 'Student ID not found.' };
    }
    formData.append('student_id', String(studentId));
    return await submitOpportunityHandler(prevState, formData);
  };

  const handleOpportunityFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsOpportunitySubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      const opportunityPromise = submitOpportunityHandler(oppState, formData);
      
      showToastPromise({
        promise: opportunityPromise,
        loadingText: 'Submitting opportunity...',
        successText: 'You can track its status on your opportunities page.',
        errorText: 'Failed to submit opportunity. Please try again.',
        successHeaderText: 'Opportunity Submitted Successfully',
        errorHeaderText: 'Opportunity Submission Failed',
        direction: 'right'
      });
      
      // Wait for actual submission to complete
      await opportunityPromise;
      // Only reset on successful submission
      resetOpportunityForm();
    } catch (error) {
      // Handle error case
      resetOpportunityForm(); // Reset on error for consistent UX
    } finally {
      setIsOpportunitySubmitting(false);
    }
  };

  const resetOpportunityForm = () => {
    setSubmitOpportunityOpen(false);
    setOppStep('select-fellow');
    setSelectedOppFellow(null);
    setOppTitle('');
    setOppDescription('');
    setOppDeadline('');
    setOppLink('');
  };
  const [oppState, opportunityFormAction, isOpportunityPending] = useActionState(handleOpportunitySubmission, {
    success: false,
    message: ''
  });
  useEffect(() => {
    if (oppState.success) setSubmitOpportunityOpen(false);
  }, [oppState.success]);

  // Fetch workshops when assignment dialog opens
  useEffect(() => {
    if (!submitAssignmentOpen || !studentId) return;
    
    let isMounted = true;
    
    const fetchWorkshopsViaApi = async () => {
      if (!isMounted) return;
      
      setIsWorkshopsLoading(true);
      try {
        // Get the current user ID from useUserData hook
        console.log('🔍 StudentDashboard: Workshops useEffect - userId from useUserData:', userId);
        
        if (!userId || !isMounted) {
          console.log('🔍 StudentDashboard: Workshops useEffect - No userId or component unmounted, returning early');
          return;
        }
        
        // Get the student's CRC class ID from the API
        console.log('🔍 StudentDashboard: Workshops useEffect - Fetching student data for CRC class ID...');
        const studentResponse = await fetch(`/api/studentId?userId=${userId}`);
        if (!studentResponse.ok || !isMounted) throw new Error('Failed to fetch student data');
        const studentData = await studentResponse.json();
        const crcClassId = studentData.crc_class_id;
        console.log('🔍 StudentDashboard: Workshops useEffect - Student data:', studentData, 'CRC class ID:', crcClassId);
        
        // Fetch workshops available for this student (excluding already submitted assignments)
        console.log('🔍 StudentDashboard: Workshops useEffect - Fetching workshops with studentId:', studentId, 'and crcClassId:', crcClassId);
        const response = await fetch(`/api/workshops/fetch-available-for-student?studentId=${studentId}&crcClassId=${crcClassId || ''}`);
        if (!response.ok || !isMounted) throw new Error('Failed to fetch available workshops');
        const json = await response.json();
        const list: Workshop[] = (json?.success ? json.data : []) as Workshop[];
        console.log('🔍 StudentDashboard: Workshops useEffect - Workshops response:', json, 'Workshops list:', list);
        // The API already filters out workshops with no assignments and already submitted assignments
        if (isMounted) setWorkshops(list);
      } catch (e) {
        if (isMounted) {
          console.error('Error fetching workshops via API', e);
          setWorkshops([]);
        }
      } finally {
        if (isMounted) setIsWorkshopsLoading(false);
      }
    };

    // Reset state on open
    setAssignmentStep('select-workshop');
    setSelectedWorkshop(null);
    setSelectedAssignment(null);
    setAssignments([]);
    setGoogleDocLink("");
    setFileToUpload(null);
    
    // Fetch workshops
    fetchWorkshopsViaApi();
    
    return () => {
      isMounted = false;
    };
  }, [submitAssignmentOpen, studentId]);

  // Fetch assignments when workshop changes
  useEffect(() => {
    if (!selectedWorkshop) {
      setAssignments([]);
      return;
    }
    setAssignments(selectedWorkshop.assignments || []);
  }, [selectedWorkshop]);

  const handleAssignmentSubmission = async (prevState: any, formData: FormData) => {
    // Validate student ID
    if (!studentId) {
      return { success: false, message: 'Student ID not found.' };
    }
    
    // Validate assignment selection
    if (!selectedAssignment) {
      return { success: false, message: 'Please choose an assignment.' };
    }
    
    // Build FormData
    formData.append('student_id', String(studentId));
    formData.append('assignment_id', String(selectedAssignment.id));
    
    if (selectedAssignment.submission_style === 'google_link') {
      formData.append('submission_style', 'google_link');
      formData.append('google_doc_link', googleDocLink);
    } else {
      formData.append('submission_style', 'file_upload');
      if (fileToUpload) {
        formData.append('file', fileToUpload);
      } else {
        return { success: false, message: 'Please select a file to upload.' };
      }
    }
    
    try {
      const result = await submitAssignmentHandler(prevState, formData);
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, message: `Submission error: ${errorMessage}` };
    }
  };

  const handleAssignmentFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAssignmentSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      const assignmentPromise = submitAssignmentHandler(assignmentState, formData);
      
      showToastPromise({
        promise: assignmentPromise,
        loadingText: 'Submitting assignment...',
        successText: 'Your assignment is in. Keep up the good work!',
        errorText: 'Failed to submit assignment. Please try again.',
        successHeaderText: 'Assignment Submitted Successfully',
        errorHeaderText: 'Assignment Submission Failed',
        direction: 'right'
    });
      
      // Wait for actual submission to complete
      await assignmentPromise;
      // Only reset on successful submission
      resetAssignmentForm();
    } catch (error) {
      // Handle error case
      resetAssignmentForm(); // Reset on error for consistent UX
    } finally {
      setIsAssignmentSubmitting(false);
    }
  };

  const resetAssignmentForm = () => {
    setSubmitAssignmentOpen(false);
    setAssignmentStep('select-workshop');
    setSelectedWorkshop(null);
    setSelectedAssignment(null);
    setAssignments([]);
    setGoogleDocLink('');
    setFileToUpload(null);
  };

  const [assignmentState, assignmentFormAction, isAssignmentPending] = useActionState(handleAssignmentSubmission, {
    success: false,
    message: ''
  });
  useEffect(() => {
    if (assignmentState.success) {
      setSubmitAssignmentOpen(false);
      setAssignmentStep('select-workshop');
      setSelectedWorkshop(null);
      setSelectedAssignment(null);
      setAssignments([]);
      setGoogleDocLink("");
      setFileToUpload(null);
    }
  }, [assignmentState.success]);

  type RecentResource = { id: string; title: string; category: string | null; created_at?: string | null };
  const [recentResources, setRecentResources] = useState<RecentResource[]>([]);
  const [isRecentLoading, setIsRecentLoading] = useState(true);
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        setIsRecentLoading(true);
        const { client } = await import("@/sanity/lib/client");
        const { getRecentResources } = await import("@/sanity/lib/queries");
        const data = await client.fetch(getRecentResources);
        const list: RecentResource[] = (Array.isArray(data) ? data : []).map((d: any) => ({
          id: String(d._id || ""),
          title: d.title || "",
          category: d.category || null,
          created_at: d._createdAt || null,
        }));
        setRecentResources(list);
      } catch (e) {
        setRecentResources([]);
      } finally {
        setTimeout(() => setIsRecentLoading(false), 250);
      }
    };
    fetchRecent();
  }, []);

  // Fetch dashboard stats data
  useEffect(() => {
    if (!studentId) return;
    
    let isMounted = true;
    
    const fetchDashboardStats = async () => {
      try {
        console.log('🚀 Starting to fetch dashboard stats for student:', studentId);
        
        // Fetch assignments not done for the student
        console.log('📋 Fetching assignments...');
        let assignmentsNotDone = 0;
        const assignmentsResponse = await fetch(`/api/assignments/fetch?studentId=${studentId}`);
        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          assignmentsNotDone = Array.isArray(assignmentsData) ? assignmentsData.length : 0;
          console.log('✅ Assignments fetched:', assignmentsData, 'Count:', assignmentsNotDone);
        } else {
          console.error('❌ Failed to fetch assignments:', assignmentsResponse.status);
        }
        
        // Fetch essays using the correct API endpoint
        console.log('📝 Fetching essays...');
        const essaysResponse = await fetch(`/api/essays/for-student?studentId=${studentId}`);
        let essaysSubmitted = 0;
        if (essaysResponse.ok) {
          const essaysData = await essaysResponse.json();
          essaysSubmitted = Array.isArray(essaysData) ? essaysData.length : 0;
          console.log('✅ Essays fetched:', essaysData, 'Count:', essaysSubmitted);
        } else {
          console.error('❌ Failed to fetch essays:', essaysResponse.status);
        }
        
        // Fetch opportunities using the correct API endpoint
        console.log('💼 Fetching opportunities...');
        const opportunitiesResponse = await fetch(`/api/opportunities/for-student?studentId=${studentId}`);
        let opportunitiesApplied = 0;
        if (opportunitiesResponse.ok) {
          const opportunitiesData = await opportunitiesResponse.json();
          opportunitiesApplied = Array.isArray(opportunitiesData) ? opportunitiesData.length : 0;
          console.log('✅ Opportunities fetched:', opportunitiesData, 'Count:', opportunitiesApplied);
        } else {
          console.error('❌ Failed to fetch opportunities:', opportunitiesResponse.status);
        }
        
        // Update stats
        if (isMounted) {
          const newStats = [
            { label: "Assignments Not Done", value: assignmentsNotDone, icon: ClipboardCheck, tint: "bg-emerald-100 text-emerald-700" },
            { label: "Essays Submitted", value: essaysSubmitted, icon: FileText, tint: "bg-sky-100 text-sky-700" },
            { label: "Opportunities Applied", value: opportunitiesApplied, icon: Briefcase, tint: "bg-violet-100 text-violet-700" },
          ];
          console.log('📊 Updating stats with:', newStats);
          setStats(newStats);
          
          // Small delay to avoid flicker before showing stats
          setTimeout(() => {
            if (isMounted) {
              setIsStatsLoading(false);
              console.log('✅ Stats loading completed');
            }
          }, 250);
        }
      } catch (e) {
        console.error('❌ Error fetching dashboard stats:', e);
        if (isMounted) {
          setIsStatsLoading(false);
        }
      }
    };
    
    fetchDashboardStats();
    
    return () => {
      isMounted = false;
    };
  }, [studentId]);

  const timeAgo = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const intervals: [number, string][] = [
      [31536000, 'year'],
      [2592000, 'month'],
      [604800, 'week'],
      [86400, 'day'],
      [3600, 'hour'],
      [60, 'minute'],
      [1, 'second'],
    ];
    for (const [intervalSeconds, label] of intervals) {
      const count = Math.floor(seconds / intervalSeconds);
      if (count >= 1) {
        return `${count} ${label}${count > 1 ? 's' : ''} ago`;
      }
    }
    return 'just now';
  };

  console.log("studentId", studentId);

  const getPagePath = (category: string) => {
    if(category === 'english_language_learning') return '/resources/ell';
    if(category === 'crp') return '/resources/crp';
    if(category === 'internships') return '/resources/internships';
    if(category === 'approved') return '/resources/approved';
    if(category === 'templates') return '/resources/templates';
    if(category === 'new_opportunities') return '/resources/newopportunities';
    if(category === 'recurring_opportunities') return '/resources/recurringopportunities';
    return '/resources'; // Default fallback
  };

  function angle(cx: number, cy: number, ex: number, ey: number) {
    const dy = ey - cy;
    const dx = ex - cx;
    const rad = Math.atan2(dy, dx);
    return (rad * 180) / Math.PI;
  }

  return (
    <div className="space-y-6 h-short:space-y-3 h-full flex flex-col overflow-hidden">
      {/* Greeting */}
      <h2 className="text-2xl font-semibold font-cal-sans flex-shrink-0">Dashboard</h2>
      
      {/* Top stats */}
      <div className="grid gap-4 h-short:gap-2 md:grid-cols-3 flex-shrink-0">
        {!studentId ? (
          // Show loading when student ID is not yet available
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={`stat-skeleton-${index}`} className="border-0 shadow-sm ring-1 ring-black/5 m-0.5">
              <CardContent className="p-5 h-short:p-4">
                <div className="flex flex-col items-start text-center">
                  <div className="flex items-center w-full justify-between mb-2 h-short:mb-1">
                    <Skeleton className="h-7 w-16 h-short:h-6 h-short:w-14" />
                    <Skeleton className="h-9 w-9 h-short:h-8 h-short:w-8 rounded-xl" />
                  </div>
                  <Skeleton className="h-4 w-24 h-short:h-3 h-short:w-20" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : isStatsLoading ? (
          // Loading skeletons for stats
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={`stat-skeleton-${index}`} className="border-0 shadow-sm ring-1 ring-black/5 m-0.5">
              <CardContent className="p-5 h-short:p-4">
                <div className="flex flex-col items-start text-center">
                  <div className="flex items-center w-full justify-between mb-2 h-short:mb-1">
                    <Skeleton className="h-7 w-16 h-short:h-6 h-short:w-14" />
                    <Skeleton className="h-9 w-9 h-short:h-8 h-short:w-8 rounded-xl" />
                  </div>
                  <Skeleton className="h-4 w-24 h-short:h-3 h-short:w-20" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Actual stats
          stats.map(({ label, value, icon: Icon }, index) => (
            <Card key={label} className="border-0 shadow-sm ring-1 ring-black/5 m-0.5">
              <CardContent className="p-5 h-short:p-4">
                <div className="flex flex-col items-start text-center">
                  <div className="flex items-center w-full justify-between mb-2 h-short:mb-1">
                   
                    <div className="text-2xl h-short:text-xl font-semibold text-neutral-900"><Number n={value} /></div>
                    <div className={`h-9 w-9 h-short:h-8 h-short:w-8 rounded-xl grid place-items-center text-neutral-900 flex-shrink-0 ${[
                          'bg-statColors-1',
                          'bg-statColors-2',
                          'bg-statColors-3'
                          ][index]}`}>
                      <Icon size={18} className="h-short:w-4 h-short:h-4" />
                    </div>
                  </div>
                  <p className="text-sm h-short:text-sm  text-neutral-500 font-medium leading-tight">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Main grid */}
      <div className="grid flex-1 gap-6 h-short:gap-3 lg:grid-cols-3 overflow-hidden min-h-0">
        <div className="lg:col-span-2 grid grid-rows-[auto_1fr] gap-6 h-short:gap-3 overflow-hidden min-h-0">
          {/* Quick Links Grid */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5 flex-shrink-0 m-0.5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-short:gap-2">
                <Button variant="outline" className="w-full justify-start h-auto py-4 h-short:py-3 rounded-xl gap-3 hover:shadow-sm" onClick={() => setRequestSessionOpen(true)}>
                    <span className="h-10 w-10 h-short:h-9 h-short:w-9 rounded-full bg-yearcolors-ey grid place-items-center flex-shrink-0">
                      <Calendar className="h-5 w-5 h-short:h-4 h-short:w-4 text-neutral-900" />
                    </span>
                    <span className="text-sm font-medium truncate">Request Session</span>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto py-4 h-short:py-3 rounded-xl gap-3 hover:shadow-sm" onClick={() => setSubmitEssayOpen(true)}>
                    <span className="h-10 w-10 h-short:h-9 h-short:w-9 rounded-full bg-yearcolors-s5 grid place-items-center flex-shrink-0">
                      <FileText className="h-5 w-5 h-short:h-4 h-short:w-4 text-neutral-900" />
                    </span>
                    <span className="text-sm font-medium truncate">Submit Essay</span>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto py-4 h-short:py-3 rounded-xl gap-3 hover:shadow-sm" onClick={() => setSubmitOpportunityOpen(true)}>
                    <span className="h-10 w-10 h-short:h-9 h-short:w-9 rounded-full bg-yearcolors-s4 grid place-items-center flex-shrink-0">
                      <Briefcase className="h-5 w-5 h-short:h-4 h-short:w-4 text-neutral-900" />
                    </span>
                    <span className="text-sm font-medium truncate">Submit Opportunity</span>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto py-4 h-short:py-3 rounded-xl gap-3 hover:shadow-sm" onClick={() => setSubmitAssignmentOpen(true)}>
                  <span className="h-10 w-10 h-short:h-9 h-short:w-9 rounded-full bg-yearcolors-s6 grid place-items-center flex-shrink-0">
                    <ClipboardCheck className="h-5 w-5 h-short:h-4 h-short:w-4 text-neutral-900" />
                  </span>
                  <span className="text-sm font-medium truncate">Submit Assignment</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* New assignments */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5 flex flex-col overflow-hidden min-h-0 m-0.5 h-[calc(100%-6px)]">
            <CardHeader className="pb-1 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">New assignments</CardTitle>
                <Link href="/dashboard/student/assignments">
                  <Button variant="ghost" size="sm" className="h-7">View all</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              <ScrollArea className="h-full px-6 py-3">
                {isAssignmentsLoading ? (
                  <div className="space-y-3 h-short:space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={`assign-skel-${i}`} className="flex items-start gap-3 rounded-xl border border-neutral-100 p-3">
                        <span className="h-8 w-8 rounded-full bg-neutral-200" />
                        <div className="flex-1 min-w-0">
                          <Skeleton className="h-4 w-3/5" />
                          <Skeleton className="h-3 w-1/3 mt-2" />
                        </div>
                        <span className="h-4 w-4 rounded bg-neutral-200" />
                      </div>
                    ))}
                  </div>
                ) : latestAssignments.length === 0 ? (
                  <div className="h-full w-full flex flex-col items-center justify-center py-8 overflow-hidden h-short:py-0 text-center">
                    <div className="relative w-60 h-60 h-short:w-40 h-short:h-40">
                      <Image
                        src="/images/dashboard/empty-assignments.png"
                        alt="No assignments"
                        fill
                        className="opacity-95 object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 h-short:space-y-2">
                    {latestAssignments.map((a) => (
                      <Link key={a.id} href="/dashboard/student/assignments" className="block">
                        <div className="flex items-start gap-3 rounded-xl border border-neutral-100 p-3 hover:bg-neutral-50">
                          <span className="h-8 w-8 rounded-full bg-yearcolors-ey grid place-items-center">
                            <ClipboardCheck className="h-4 w-4 text-neutral-900" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{a.title}</p>
                            <p className="text-xs text-neutral-500">
                              {a.submission_style === 'google_link' ? 'Google link submission' : 'File upload'}
                              {a.created_at ? ` • ${timeAgo(a.created_at)}` : ''}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right rail */}
        <div className="grid gap-6 h-short:gap-3 grid-rows-2 overflow-hidden min-h-0">
          {/* Notifications */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5 flex flex-col overflow-hidden min-h-0 m-0.5">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Announcements</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              {isNotifLoading ? (
                <ScrollArea className="h-full px-6 py-3">
                  <div className="space-y-4 h-short:space-y-2">
                    <div className="space-y-2 h-short:space-y-1">
                      <Skeleton className="h-3 w-28" />
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={`stud-skel-${i}`} className="rounded-xl border border-neutral-100 p-3">
                          <div className="flex items-start gap-3">
                            <span className="h-5 w-1 rounded-full bg-neutral-200 mt-0.5" />
                            <div className="flex-1">
                              <div className="mb-1">
                                <Skeleton className="h-5 w-32 rounded-full" />
                              </div>
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-3/4 mt-2" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2 h-short:space-y-1">
                      <Skeleton className="h-3 w-16" />
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={`other-skel-${i}`} className="rounded-xl border border-neutral-100 p-3">
                          <div className="flex items-start gap-3">
                            <span className="h-5 w-1 rounded-full bg-neutral-200 mt-0.5" />
                            <div className="flex-1">
                              <div className="mb-1">
                                <Skeleton className="h-5 w-24 rounded-full" />
                              </div>
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-2/3 mt-2" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              ) : (
                (studentNotifs.length === 0 && otherNotifs.length === 0) ? (
                   <div className="h-full w-full flex flex-col items-center justify-center py-12 h-short:py-0 text-center">
                     <div className="relative w-60 h-60 h-short:w-full h-short:h-96 max-w-[450px]">
                      <Image
                        src="/images/dashboard/empty-notifications.png"
                        alt="No announcements"
                        fill
                        className="opacity-95 object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-full px-6 py-3">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {studentNotifs.length > 0 && (
                          <div className="text-xs text-neutral-400">Student dashboard</div>
                        )}
                        {studentNotifs.length === 0 ? (
                          <div className="text-sm text-neutral-500">No student notifications.</div>
                        ) : (
                          studentNotifs.map((n) => (
                            <div key={n.id} className="rounded-xl border border-neutral-100 p-3 text-sm text-neutral-700 transition-colors">
                              <div className="flex items-start gap-3">
                                <span className="h-5 w-1 rounded-full bg-statColors-7 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="mb-1">
                                    <Badge variant="secondary" className="bg-statColors-7 hover:bg-statColors-7 text-neutral-900">{formatPageLabel('student_dashboard')}</Badge>
                                  </div>
                                  <div 
                                    className="student-announcement-markdown"
                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(n.message) }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="space-y-2">
                        {otherNotifs.length > 0 && (
                          <div className="text-xs text-neutral-400">Other</div>
                        )}
                        {otherNotifs.length === 0 ? null : (
                          otherNotifs.map((n) => (
                            <div key={n.id} className="rounded-xl border border-neutral-100 p-3 text-sm text-neutral-700  transition-colors">
                              <div className="flex items-start gap-3">
                                <span className={`h-5 w-1 rounded-full mt-0.5 flex-shrink-0 ${getAccentBg(n.page)}`} />
                                <div className="flex-1 min-w-0">
                                  <div className="mb-1">
                                    <Badge variant="secondary" className={`${getAccentBg(n.page)} text-neutral-900 transition-none`}>{formatPageLabel(n.page)}</Badge>
                                  </div>
                                  <div 
                                    className="student-announcement-markdown"
                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(n.message) }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                )
              )}
            </CardContent>
          </Card>

          {/* New content added */}
          <Card className="border-0 shadow-sm ring-1 ring-black/5 flex flex-col overflow-hidden min-h-0 m-0.5 h-[calc(100%-6px)]">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">New content added</CardTitle>
           
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              <ScrollArea className="h-full px-6 py-3">
                {isRecentLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={`recent-skel-${i}`} className="flex items-start gap-3 rounded-xl border border-neutral-100 p-3">
                        <span className="h-8 w-8 rounded-full bg-neutral-200" />
                        <div className="flex-1 min-w-0">
                          <Skeleton className="h-4 w-3/5" />
                          <Skeleton className="h-3 w-1/3 mt-2" />
                        </div>
                        <span className="h-4 w-4 rounded bg-neutral-200" />
                      </div>
                    ))}
                  </div>
                ) : recentResources.length === 0 ? (
                  <div className="py-8 text-center text-sm text-neutral-500">No new content.</div>
                ) : (
                  <div className="space-y-3">
                    {recentResources.map((c) => (
                      <Link key={c.id} href={getPagePath(c.category || '')} className="block">
                        <div className="flex items-start gap-3 rounded-xl border border-neutral-100 p-3 hover:bg-neutral-50">
                          <span className={`h-8 w-8 rounded-full grid place-items-center ${c.category?.includes('opportunities') ? 'bg-yearcolors-s4' : 'bg-yearcolors-ey'}`}>
                            {c.category?.includes('opportunities') ? (
                              <Briefcase className="h-4 w-4 text-neutral-900" />
                            ) : (
                              <FileText className="h-4 w-4 text-neutral-900" />
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{c.title}</p>
                            <p className="text-xs text-neutral-500">{formatPageLabel(c.category || 'resource')} • {c.created_at ? timeAgo(c.created_at) : ''}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

    {/* Dialogs ported from Cypress quick actions */}
    {/* Submit Assignment - Multi-step */}
    <Dialog open={submitAssignmentOpen} onOpenChange={(open) => { setSubmitAssignmentOpen(open); if (!open) { setAssignmentStep('select-workshop'); setSelectedWorkshop(null); setSelectedAssignment(null);} }}>
      <DialogContent className="max-w-3xl  [&>button]:!top-8 [&>button]:!hidden    bg-white rounded-2xl shadow-2xl border-0">
        <div className="relative">
          {/* This is your reference point for the eyes */}
          <div ref={anchorRef} className="absolute top-0 right-0 w-4 h-4"></div>
          
          <Image 
            src="/images/popup/popup-illustration-005.png" 
            alt="Popup Illustration" 
            width={2000}
            height={2000}
            className="absolute -top-20 -right-[50px] w-32 pointer-events-none z-0"
          />
          
          {/* Left eye */}
          <Image 
            ref={(el) => { eyesRef.current[0] = el; }}
            src="/images/popup/eye.png" 
            alt="Popup Eye" 
            width={30} 
            height={30} 
            className="absolute z-10 top-[-51px] right-[-2px]"
          />
          
          {/* Right eye */}
          <Image 
            ref={(el) => { eyesRef.current[1] = el; }}
            src="/images/popup/eye.png" 
            alt="Popup Eye" 
            width={30} 
            height={30} 
            className="absolute z-10 top-[-44px] right-[-28px]"
          />
        </div>
 
        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl pb-4 font-bold text-gray-900 text-center">
            {assignmentStep === 'select-workshop' && 'Select workshop'}
            {assignmentStep === 'select-assignment' && 'Select assignment'}
            {assignmentStep === 'submit' && 'Submit assignment'}
          </DialogTitle>
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className={`flex items-center ${assignmentStep === 'select-workshop' ? '' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${assignmentStep === 'select-workshop' ? 'bg-yearcolors-s6 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
              <span className="ml-2 text-sm font-medium">Workshop</span>
            </div>
            <div className={`w-6 h-px ${assignmentStep === 'select-assignment' ? 'bg-yearcolors-s6' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${assignmentStep === 'select-assignment' ? '' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${assignmentStep === 'select-assignment' ? 'bg-yearcolors-s6 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
              <span className="ml-2 text-sm font-medium">Assignment</span>
            </div>
            <div className={`w-6 h-px bg-gray-200`}></div>
            <div className={`flex items-center ${assignmentStep === 'submit' ? '' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${assignmentStep === 'submit' ? 'bg-yearcolors-s6 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
              <span className="ml-2 text-sm font-medium">Submit</span>
            </div>
          </div>
        </DialogHeader>

        {assignmentStep === 'select-workshop' && (
          <div className="">
            <div className="rounded-xl border bg-white">
              <Command className="bg-transparent">
                <CommandInput placeholder="Search workshops..." />
                <CommandList className=" overflow-visible">
            
                  {isWorkshopsLoading ? (
                    <div className="py-10 flex items-center justify-center text-neutral-500">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading workshops...
                    </div>
                  ) : workshops.length === 0 ? (
                    <CommandEmpty>No workshops found.</CommandEmpty>
                  ) : (
                    <CommandGroup heading="Available workshops" className="pb-4">
                        {!studentId && (
                          <div className="px-2 py-1 text-xs text-amber-600 bg-amber-50 rounded-md mb-2">
                            Note: You may see all available workshops if your CRC class hasn&apos;t been assigned yet.
                          </div>
                        )}
                        
                      {workshops.map((w) => (
                        <CommandItem
                          key={w.id}
                          onSelect={() => {
                            if (selectedWorkshop?.id === w.id) {
                              setSelectedWorkshop(null);
                            } else {
                              setSelectedWorkshop(w);
                            }
                          }}
                          value={`${w.title} ${w.date ?? ''}`}
                          className={`flex items-center gap-3 rounded-md transition-colors duration-150  bg-transparent ${
                            selectedWorkshop?.id === w.id ? 'bg-transparent' : ''
                          }`}
                        >
                          <span className="h-8 w-8 rounded-full bg-yearcolors-s6 grid place-items-center flex-shrink-0">
                            <ClipboardCheck className="h-4 w-4 text-neutral-900" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">{w.title}</div>
                            <div className="flex items-center gap-2 mt-1">
                              {w.date && (
                                <div className="text-xs text-neutral-500">
                                  {new Date(w.date).toLocaleDateString()}
                                </div>
                              )}
                             
                            </div>
                          </div>
                          {selectedWorkshop?.id === w.id && (
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </div>
            <div className="flex justify-between p-3 ">
              <Button 
                variant="outline" 
                className="rounded-xl px-8 text-sm" 
                onClick={() => setSubmitAssignmentOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setAssignmentStep('select-assignment')} disabled={!selectedWorkshop} className="bg-yearcolors-s6 hover:bg-yearcolors-s6/80 rounded-xl px-8 text-sm text-neutral-900 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200">Continue</Button>
            </div>
          </div>
        )}

        {assignmentStep === 'select-assignment' && (
          <div className="space-y-6">
            <div className="flex justify-start">
              {assignments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300 mx-auto mb-3"></div>
                  <p className="text-gray-500 text-sm">Loading assignments...</p>
                </div>
              ) : (
                assignments.map((a) => (
                  <div key={a.id} onClick={() => setSelectedAssignment(selectedAssignment?.id === a.id ? null : a)} className={`w-full max-w-md p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedAssignment?.id === a.id ? 'border-yearcolors-s6 bg-yearcolors-s6/10 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'}`}>
                    <div className="flex items-start gap-3">
                      <span className="h-8 w-8 rounded-full bg-yearcolors-s6 grid place-items-center flex-shrink-0">
                        <ClipboardCheck className="h-4 w-4 text-neutral-900" />
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{a.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">Submission style: {a.submission_style === 'google_link' ? 'Google link' : 'File upload'}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="outline" className="rounded-xl px-8 text-sm" onClick={() => setAssignmentStep('select-workshop')}>Back</Button>
              <Button onClick={() => setAssignmentStep('submit')} disabled={!selectedAssignment} className="bg-yearcolors-s6 hover:bg-yearcolors-s6/80 rounded-xl px-8 text-sm text-neutral-900 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200">Continue</Button>
            </div>
          </div>
        )}

        {assignmentStep === 'submit' && selectedAssignment && (
          <form action={assignmentFormAction} onSubmit={handleAssignmentFormSubmit} className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{selectedWorkshop?.title}</p>
                  <p className="text-xs text-gray-500">{selectedAssignment.title}</p>
                </div>
                <span className="h-8 w-8 rounded-full bg-yearcolors-s6 grid place-items-center">
                  <ClipboardCheck className="h-4 w-4 text-neutral-900" />
                </span>
              </div>
            </div>
            {selectedAssignment.submission_style === 'google_link' ? (
              <div>
                <Label htmlFor="assignment-google-link">Google Docs Link</Label>
                <InputWithRing id="assignment-google-link" name="google_doc_link" type="url" placeholder="https://docs.google.com/document/..." value={googleDocLink} onChange={(e) => setGoogleDocLink(e.target.value)} disabled={isAssignmentSubmitting} required className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl" />
              </div>
            ) : (
              <div>
                <Label>Upload File</Label>
                <FileUpload
                  multiple={false}
                  accept="image/svg+xml,image/png,image/jpeg,image/gif, image/webp, application/pdf"
                  maxFiles={1}
                  value={fileToUpload ? [fileToUpload] : []}
                  onChange={(files) => {
                    const selectedFile = files?.[0] || null;
                    setFileToUpload(selectedFile);
                  }}
                  onRemove={() => {
                    setFileToUpload(null);
                  }}
                  placeholder={<span><strong>Click to upload</strong> or drag and drop</span>}
                  helperText={<span>SVG, PNG, JPG, GIF, WebP, or PDF</span>}
                  disabled={isAssignmentSubmitting}
                  className="mt-2"
                />
               
              </div>
            )}
            <div className="flex justify-between space-x-2 pt-2">
              <Button variant="outline" className="rounded-xl px-8 text-sm" onClick={() => setAssignmentStep('select-assignment')} disabled={isAssignmentSubmitting}>Back</Button>
              <Button 
                type="submit" 
                disabled={isAssignmentSubmitting || !studentId || (selectedAssignment.submission_style === 'google_link' ? !googleDocLink.trim() : !fileToUpload)} 
                className="bg-yearcolors-s6 hover:bg-yearcolors-s6/80 rounded-xl px-8 text-sm text-neutral-900 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200"

              >
                {isAssignmentSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isAssignmentSubmitting ? 'Submitting...' : 'Submit Assignment'}
              </Button>
            </div>
            {(!studentId) && (
              <p className="text-xs text-red-500 pt-1">Your session is missing a student ID. Please wait a moment and try again.</p>
            )}
            {assignmentState && assignmentState.message && !assignmentState.success && (
              <p className="text-xs text-red-500 pt-1">{assignmentState.message}</p>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
    {/* Submit Essay - Multi-step */}
    <Dialog open={submitEssayOpen} onOpenChange={(open) => { setSubmitEssayOpen(open); if (!open) { setEssayStep('select-fellow'); setSelectedEssayFellow(null);} }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border-0 [&>button]:!hidden">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl pb-4 font-bold text-gray-900 text-center">
            {essayStep === 'select-fellow' && 'Choose your CRC Fellow'}
            {essayStep === 'details' && 'Essay details'}
            {essayStep === 'final' && 'Deadline & link'}
          </DialogTitle>
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className={`flex items-center ${essayStep === 'select-fellow' ? 'text-statColors-1' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${essayStep === 'select-fellow' ? 'bg-statColors-1 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
              <span className="ml-2 text-sm font-medium">Fellow</span>
            </div>
            <div className={`w-6 h-px ${essayStep === 'details' ? 'bg-statColors-1' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${essayStep === 'details' ? 'text-statColors-1' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${essayStep === 'details' ? 'bg-statColors-1 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
              <span className="ml-2 text-sm font-medium">Details</span>
            </div>
            <div className={`w-6 h-px bg-gray-200`}></div>
            <div className={`flex items-center ${essayStep === 'final' ? 'text-statColors-1' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${essayStep === 'final' ? 'bg-statColors-1 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
              <span className="ml-2 text-sm font-medium">Finish</span>
            </div>
          </div>
        </DialogHeader>

        {essayStep === 'select-fellow' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {crcFellows.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-neutral-400" />
                  <p className="text-gray-500 text-sm">Loading fellows...</p>
                </div>
              ) : (
                crcFellows.map((fellow) => (
                  <div key={fellow.id} onClick={() => setSelectedEssayFellow(fellow)} className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedEssayFellow?.id === fellow.id ? 'border-statColors-1 bg-statColors-1/10 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'}`}>
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
                ))
              )}
            </div>
            <div className="flex justify-end pt-2">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="rounded-xl" 
                  onClick={() => setSubmitEssayOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setEssayStep('details')}
                  disabled={!selectedEssayFellow}
                  className="bg-statColors-1 hover:bg-statColors-1/80 rounded-xl px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )}

        {essayStep === 'details' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="essay-title">Essay Title</Label>
              <InputWithRing id="essay-title" value={essayTitle} onChange={(e) => setEssayTitle(e.target.value)} placeholder="Enter your essay title" className="border  border-neutral-200  transition-colors duration-200 ease-in-out rounded-xl" />
            </div>
            <div>
              <Label htmlFor="essay-description">Description</Label>
              <Textarea 
                id="essay-description" 
                value={essayDescription} 
                onChange={(e) => setEssayDescription(e.target.value)} 
                placeholder="Brief description" 
                rows={3} 
                maxLength={200}
                className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl" 
              />
              <div className="text-xs text-neutral-500 mt-1">
                {200 - essayDescription.length} characters left
              </div>
            </div>
            <div>
              <Label htmlFor="essay-word-count">Word Count (Optional)</Label>
              <InputWithRing id="essay-word-count" name="word_count" type="number" placeholder="Enter word count" value={essayWordCount} onChange={(e) => setEssayWordCount(e.target.value)} className="border border-neutral-200  transition-colors duration-200 ease-in-out rounded-xl" />
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setEssayStep('select-fellow')}>Back</Button>
              <Button
                onClick={() => setEssayStep('final')}
                className="bg-statColors-1 hover:bg-statColors-1/80 rounded-xl px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {essayStep === 'final' && (
          <form action={essayFormAction} onSubmit={handleEssayFormSubmit} className="space-y-4">
            <input type="hidden" name="admin_id" value={selectedEssayFellow?.id || ''} />
            <input type="hidden" name="title" value={essayTitle} />
            <input type="hidden" name="description" value={essayDescription} />
            <div>
              <Label htmlFor="essay-deadline">Deadline (Optional)</Label>
              <InputWithRing id="essay-deadline" name="deadline" type="date" value={essayDeadline} onChange={(e) => setEssayDeadline(e.target.value)} disabled={isEssaySubmitting} className="border border-neutral-200  transition-colors duration-200 ease-in-out rounded-xl" />
            </div>
            <div>
              <Label htmlFor="google-docs-link">Google Docs Link</Label>
              <InputWithRing id="google-docs-link" name="googleDocsLink" type="url" placeholder="https://docs.google.com/document/d/..." value={essayLink} onChange={(e) => setEssayLink(e.target.value)} disabled={isEssaySubmitting} required className="border border-neutral-200  transition-colors duration-200 ease-in-out rounded-xl" />
            </div>
            <div className="flex justify-between space-x-2 pt-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setEssayStep('details')} disabled={isEssaySubmitting}>Back</Button>
              <Button
                type="submit"
                className="bg-statColors-1 hover:bg-statColors-1/80 rounded-xl px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200"
                disabled={isEssaySubmitting}
              >
                {isEssaySubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEssaySubmitting ? 'Submitting...' : 'Submit Essay'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>

    {/* Submit Opportunity */}
    <Dialog open={submitOpportunityOpen} onOpenChange={(open) => { setSubmitOpportunityOpen(open); if (!open) { setOppStep('select-fellow'); setSelectedOppFellow(null);} }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-visible bg-white rounded-2xl shadow-2xl border-0 [&>button]:!hidden">
        <div className="relative">
          {/* This is your reference point for the eyes */}
          <div ref={anchorRef} className="absolute top-[-60px] left-[-60px]w-4 h-4">  </div>
          
          <Image 
            src="/images/popup/popup-illustration-007.png" 
            alt="Popup Illustration" 
            width={2000}
            height={2000}
            className="absolute  w-32 pointer-events-none z-0 top-[-87px] left-[-98px]"
          />
          
          {/* Left eye */}
          <Image 
            ref={(el) => { eyesRef.current[0] = el; }}
            src="/images/popup/eye.png" 
            alt="Popup Eye" 
            width={30} 
            height={30} 
            className="absolute z-10 top-[-48px] left-[-76px]"
          />
          
          {/* Right eye */}
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
            {oppStep === 'select-fellow' && 'Choose CRC Fellow'}
            {oppStep === 'details' && 'Opportunity details'}
            {oppStep === 'final' && 'Deadline & link'}
          </DialogTitle>
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className={`flex items-center ${oppStep === 'select-fellow' ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${oppStep === 'select-fellow' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
              <span className="ml-2 text-sm font-medium">Fellow</span>
            </div>
            <div className={`w-6 h-px ${oppStep === 'details' ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${oppStep === 'details' ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${oppStep === 'details' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
              <span className="ml-2 text-sm font-medium">Details</span>
            </div>
            <div className={`w-6 h-px bg-gray-200`}></div>
            <div className={`flex items-center ${oppStep === 'final' ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${oppStep === 'final' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
              <span className="ml-2 text-sm font-medium">Finish</span>
            </div>
          </div>
        </DialogHeader>
        <div className='relative'>
         
          
          {oppStep === 'select-fellow' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {crcFellows.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-gray-500" />
                    <p className="text-gray-500 text-sm">Loading fellows...</p>
                  </div>
                ) : (
                  crcFellows.map((fellow) => (
                    <div key={fellow.id} onClick={() => setSelectedOppFellow(fellow)} className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedOppFellow?.id === fellow.id ? 'border-orange-400/80 bg-primary/10 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'}`}>
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
                  ))
                )}
              </div>
              <div className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  className="rounded-xl px-8 text-sm" 
                  onClick={() => setSubmitOpportunityOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setOppStep('details')} disabled={!selectedOppFellow} className="bg-primary hover:bg-primary/90 rounded-xl px-8 text-sm text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(242,152,73,0.35)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(242,152,73,0.15)] transition duration-200">Continue</Button>
              </div>
            </div>
          )}

          {oppStep === 'details' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="opportunity-title">Title</Label>
                <InputWithRing id="opportunity-title" value={oppTitle} onChange={(e) => setOppTitle(e.target.value)} placeholder="Enter opportunity title" disabled={isOpportunitySubmitting} required className="border border-neutral-200  transtion duration-200 ease-in-out rounded-xl" />
              </div>
              <div>
                <Label htmlFor="opportunity-description">Description (optional)</Label>
                <Textarea 
                  id="opportunity-description" 
                  value={oppDescription} 
                  onChange={(e) => setOppDescription(e.target.value)} 
                  placeholder="Brief description" 
                  disabled={isOpportunitySubmitting} 
                  rows={3} 
                  maxLength={200}
                  className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl" 
                />
                <div className="text-xs text-neutral-500 mt-1">
                  {200 - oppDescription.length} characters left
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="outline" className="rounded-xl px-8 text-sm" onClick={() => setOppStep('select-fellow')} disabled={isOpportunitySubmitting}>Back</Button>
                <Button onClick={() => setOppStep('final')} disabled={!oppTitle || isOpportunitySubmitting} className="bg-primary hover:bg-primary/90 rounded-xl px-8 text-sm text-white disabled:opacity-60 disabled:cursor-not-allowed shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(242,152,73,0.35)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(242,152,73,0.15)] transition duration-200">Continue</Button>
              </div>
            </div>
          )}

          {oppStep === 'final' && (
            <form action={opportunityFormAction} onSubmit={handleOpportunityFormSubmit} className="space-y-4">
              <input type="hidden" name="student_id" value={studentId != null ? String(studentId) : ''} />
              <input type="hidden" name="admin_id" value={selectedOppFellow?.id || ''} />
              <input type="hidden" name="title" value={oppTitle} />
              <input type="hidden" name="description" value={oppDescription} />
              <div>
                <Label htmlFor="opportunity-deadline">Deadline (optional)</Label>
                <InputWithRing id="opportunity-deadline" name="deadline" type="date" value={oppDeadline} onChange={(e) => setOppDeadline(e.target.value)} disabled={isOpportunitySubmitting} className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl" />
              </div>
              <div>
                <Label htmlFor="opportunity-link">Link</Label>
                <InputWithRing  id="opportunity-link" name="link" type="url" placeholder="https://example.com/opportunity" required value={oppLink} onChange={(e) => setOppLink(e.target.value)} disabled={isOpportunitySubmitting} className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl" />
              </div>
              <div className="flex justify-between space-x-2 pt-4">
                <Button variant="outline" className="rounded-xl px-8 text-sm" onClick={() => setOppStep('details')} disabled={isOpportunitySubmitting}>Back</Button>
                <Button className="bg-primary hover:bg-primary/90 rounded-xl px-8 text-sm text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(242,152,73,0.35)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(242,152,73,0.15)] transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed" disabled={isOpportunitySubmitting || !studentId || !selectedOppFellow || !oppTitle.trim() || !oppLink.trim()} type="submit">
                  {isOpportunitySubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isOpportunitySubmitting ? 'Submitting...' : 'Submit Opportunity'}
                </Button>
              </div>
              {(!studentId) && (
                <p className="text-xs text-red-500 pt-1">Your session is missing a student ID. Please wait a moment and try again.</p>
              )}
              {oppState && oppState.message && !oppState.success && (
                <p className="text-xs text-red-500 pt-1">{oppState.message}</p>
              )}
            </form>
          )}

        </div>
        
      </DialogContent>
    </Dialog>

    {/* Multi-step Request Session (Cal.com) */}
    <Dialog open={requestSessionOpen} onOpenChange={(open) => {
      setRequestSessionOpen(open);
      if (!open) { setBookingStep('select-admin'); setSelectedAdmin(null); setSelectedTime(""); }
    }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border-0 [&>button]:!hidden">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl pb-4 font-bold text-gray-900 text-center">
            {bookingStep === 'select-admin' && 'Choose your CRC Fellow'}
            {bookingStep === 'select-time' && 'Select your session time'}
            {bookingStep === 'booking' && 'Confirm your booking'}
          </DialogTitle>
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className={`flex items-center ${bookingStep === 'select-admin' ? 'text-statColors-2' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${bookingStep === 'select-admin' ? 'bg-statColors-2 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
              <span className="ml-2 text-sm font-medium">Fellow</span>
            </div>
            <div className={`w-6 h-px ${bookingStep === 'select-time' ? 'bg-statColors-2' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${bookingStep === 'select-time' ? 'text-statColors-2' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${bookingStep === 'select-time' ? 'bg-statColors-2 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
              <span className="ml-2 text-sm font-medium">Time</span>
            </div>
            <div className={`w-6 h-px bg-gray-200`}></div>
            <div className={`flex items-center ${bookingStep === 'booking' ? 'text-statColors-2' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${bookingStep === 'booking' ? 'bg-statColors-2 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
              <span className="ml-2 text-sm font-medium">Book</span>
            </div>
          </div>
        </DialogHeader>

        {bookingStep === 'select-admin' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {crcFellows.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300 mx-auto mb-3"></div>
                  <p className="text-gray-500 text-sm">Loading fellows...</p>
                </div>
              ) : (
                crcFellows.map((fellow) => (
                  <div key={fellow.id} onClick={() => setSelectedAdmin(fellow)} className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedAdmin?.id === fellow.id ? 'border-statColors-2 bg-statColors-2/10 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'}`}>
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
                ))
              )}
            </div>
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                className="rounded-xl px-8 text-sm" 
                onClick={() => setRequestSessionOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setBookingStep('select-time')} disabled={!selectedAdmin} className="bg-statColors-2 hover:bg-statColors-2/80 rounded-xl px-8 text-sm text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(37,99,235,0.35)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(37,99,235,0.15)] transition duration-200">Continue</Button>
            </div>
          </div>
        )}

        {bookingStep === 'select-time' && (
          <div className="space-y-8">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">With <span className="font-semibold text-gray-900">{selectedAdmin?.name}</span></p>
              <p className="text-gray-500 text-sm">Choose your session duration</p> 
            </div>
            <div className="grid grid-cols-3 gap-3">
              {sessionDurations.map((duration) => (
                <div key={duration.value} onClick={() => setSelectedTime(duration.value)} className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedTime === duration.value ? 'border-statColors-2 bg-statColors-2/10 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'}`}>
                  <div className="text-center">
                    <div className={`text-lg font-semibold mb-1 ${selectedTime === duration.value ? 'text-statColors-2' : 'text-gray-900'}`}>{duration.label}</div>
                    <div className={`text-xs ${selectedTime === duration.value ? 'text-statColors-2' : 'text-gray-500'}`}>{duration.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setBookingStep('select-admin')} className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl px-8">Back</Button>
              <Button onClick={() => setBookingStep('booking')} disabled={!selectedTime} className="bg-statColors-2 hover:bg-statColors-2/80 px-8 py-2 rounded-xl text-white font-medium shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(37,99,235,0.35)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(37,99,235,0.15)] transition duration-200">Continue</Button>
            </div>
          </div>
        )}

        {bookingStep === 'booking' && (
          <div className="space-y-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-statColors-2 shadow-sm">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Session Summary</h3>
                  <p className="text-sm text-gray-500">Review your booking details</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 ">
                  <span className="text-sm text-gray-600">Fellow</span>
                  <span className="text-sm font-medium text-gray-900">{selectedAdmin?.name}</span>
                </div>
                <hr />
                <div className="flex justify-between items-center py-2 "><span className="text-sm text-gray-600">Duration</span><span className="text-sm font-medium text-gray-900">{sessionDurations.find(d => d.value === selectedTime)?.label}</span></div>
              </div>
            </div>
            <div className="text-center">
              <Button onClick={async () => { const cal = await getCalApi({ namespace: 'quick-review' }); cal('modal', { calLink: 'dufitimana-eric/quick-review' }); }} className="w-full bg-statColors-2 hover:bg-statColors-2/80 text-white py-4 px-8 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(37,99,235,0.35)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(37,99,235,0.15)]">Book Your Session</Button>
              <p className="text-xs text-gray-500 mt-3">You&apos;ll be redirected to Cal.com to select your preferred time</p>
            </div>
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={() => setBookingStep('select-time')} className="border-gray-300 text-gray-700 hover:bg-gray-50">Back</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </div>
  );
}


