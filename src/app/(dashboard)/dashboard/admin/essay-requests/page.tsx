"use client";

import { useState, useEffect } from "react";
import { Badge } from "../../../../../../zenith/src/components/ui/badge";
import { Button } from "../../../../../../zenith/src/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../../../../zenith/src/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../../../../zenith/src/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../../zenith/src/components/ui/tabs";
import { Calendar, Clock, Users, FileText, AlertTriangle, Loader2, Send, Inbox, User, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ToggleGroup, ToggleGroupItem } from "../../../../../../zenith/src/components/ui/toggle-group";
import {useUserData} from '@/hooks/useUserData'
import {deferTo} from '@/actions/essays/deferTo'
import {changeReferStatus} from '@/actions/essays/changeReferStatus'
import {essayCompleted} from '@/actions/essays/essayCompleted'
import {markReferralCompleted, markReferralCompletedByEssayId} from '@/actions/essays/markReferralCompleted'
import { showToastPromise, showToastSuccess, showToastError } from "@/components/toasts";

type EssayRequest = {
  id: string;
  student: string;
  class: string;
  essayTitle: string;
  submittedDate: Date;
  wordCount: number;
  urgency: 'low' | 'medium' | 'high';
  status: 'new' | 'pending' | 'done';
  reviewerId?: string;
  deferredBy?: string;
  completedAt?: Date;
};

type Referral = {
  id: string;
  essayId: string;
  essayTitle: string;
  essayLink?: string | null;
  studentName: string;
  referredTo: string;
  referredBy: string;
  referredAt: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  type: 'sent' | 'received';
  deadline?: Date | null;
  submittedAt?: Date | null;
  wordCount: string;
  has_completed?: boolean;
  completed_at?: Date | null;
};

export default function EssayRequests() {
  const [activeTab, setActiveTab] = useState<'requests' | 'pending' | 'done' | 'referrals'>('requests');
  const [referralSubTab, setReferralSubTab] = useState<'sent' | 'received'>('sent');
  const [showReferModal, setShowReferModal] = useState(false);
  const [selectedEssay, setSelectedEssay] = useState<{id:string, title:string, description:string, deadline:string, essay_link:string, student_id:string, admin_id:string, admin_name:string, student_name:string , created_at:string, completed_at?:string, status:string, word_count:string, grade:string, referred?:boolean} | null>(null);
  const [essayRequests, setEssayRequests] = useState<Array<{id:string, title:string, description:string, deadline:string, essay_link:string, student_id:string, admin_id:string, admin_name:string, student_name:string , created_at:string, completed_at?:string, status:string, word_count:string, grade:string, referred?:boolean}>>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [admins, setAdmins] = useState<Array<{id:string, name:string, role:string}>>([]);
  const [loadingView, setLoadingView] = useState<string | null>(null);
  const [loadingRefer, setLoadingRefer] = useState<string | null>(null);
  const [loadingMarkDone, setLoadingMarkDone] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const {userId, adminId} = useUserData();



  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 hover:text-red-900 hover:border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 hover:text-yellow-900 hover:border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:text-green-900 hover:border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 hover:text-gray-900 hover:border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 hover:text-blue-900 hover:border-blue-300';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 hover:text-yellow-900 hover:border-yellow-300';
      case 'completed': 
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:text-green-900 hover:border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 hover:text-gray-900 hover:border-gray-300';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade === "Enrichment Year") return "bg-yearcolors-ey text-black hover:bg-yearcolors-ey/80 hover:text-black";
    if (grade === "Senior 4") return "bg-yearcolors-s4 text-black hover:bg-yearcolors-s4/80 hover:text-black";
    if (grade === "Senior 5") return "bg-yearcolors-s5 text-black hover:bg-yearcolors-s5/80 hover:text-black";
    if (grade === "Senior 6") return "bg-yearcolors-s6 text-black hover:bg-yearcolors-s6/80 hover:text-black";
    return "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800";
  };

  const filteredEssayRequests = essayRequests
    .filter(essay => {
      if (activeTab === 'requests') {
        const shouldShow = essay.status === 'pending' && !essay.referred;
        return shouldShow;
      }
      if (activeTab === 'pending') {
        const shouldShow = essay.status === 'in_review' && !essay.referred;
        return shouldShow;
      }
      if (activeTab === 'done') {
        const shouldShow = essay.status === 'completed';
        return shouldShow;
      }
      return false;
    })
    .sort((a, b) => {
      if (activeTab === 'done') {
        // Sort by completion date (most recent first) for done section
        const dateA = new Date(a.completed_at || 0);
        const dateB = new Date(b.completed_at || 0);
        return dateB.getTime() - dateA.getTime();
      } else {
        // Sort by submission date (oldest first) for other sections
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateA.getTime() - dateB.getTime();
      }
    });

  const filteredReferrals = referrals
    .filter(referral => {
      if (activeTab === 'referrals') {
        // For sent referrals: show if status is not completed (including has_completed: true ones)
        if (referralSubTab === 'sent') {
          return referral.type === 'sent' && !referral.has_completed;
        }
        // For received referrals: show all (including has_completed: true ones)
        if (referralSubTab === 'received') {
          return referral.type === 'received';
        }
      }
      return false;
    })
    .sort((a, b) => {
      // For sent referrals: has_completed ones go to top, then by date (oldest first)
      // For received referrals: has_completed ones go to bottom, then by date (oldest first)
      const aCompleted = a.has_completed;
      const bCompleted = b.has_completed;
      
      if (a.type === 'sent' && b.type === 'sent') {
        if (aCompleted && !bCompleted) return -1; // a goes to top
        if (!aCompleted && bCompleted) return 1; // b goes to top
      } else if (a.type === 'received' && b.type === 'received') {
        if (aCompleted && !bCompleted) return 1; // a goes to bottom
        if (!aCompleted && bCompleted) return -1; // b goes to bottom
      }
      
      // If both have same completion status, sort by date
      const dateA = new Date(a.submittedAt || a.referredAt || 0);
      const dateB = new Date(b.submittedAt || b.referredAt || 0);
      return dateA.getTime() - dateB.getTime();
    });

  const getTabCount = (tab: 'requests' | 'pending' | 'done' | 'referrals') => {
    if (tab === 'requests') {
      return essayRequests.filter(essay => essay.status === 'pending' && !essay.referred).length;
    }
    if (tab === 'pending') {
      return essayRequests.filter(essay => essay.status === 'in_review' && !essay.referred).length;
    }
    if (tab === 'done') {
      const completedEssays = essayRequests.filter(essay => essay.status === 'completed').length;
      const completedReferrals = getCompletedReferralsCount();
      return completedEssays + completedReferrals;
    }
    if (tab === 'referrals') {
      return getReferralSubTabCount('sent') + getReferralSubTabCount('received');
    }
    return 0;
  };

  const getReferralSubTabCount = (subTab: 'sent' | 'received') => {
    return referrals.filter(referral => {
      if (referral.type !== subTab) return false;
      
      // For sent referrals: only count if essay is still pending in essay_requests table
      if (subTab === 'sent') {
        const actualEssay = essayRequests.find(req => req.id === referral.essayId);
        return actualEssay ? actualEssay.status === 'pending' : false;
      }
      // For received referrals: exclude completed status from count
      if (subTab === 'received') {
        return !referral.has_completed;
      }
      
      return false;
    }).length;
  };

  // Function to get completed referrals count for done tab - REMOVED - done section should only count essays
  const getCompletedReferralsCount = () => {
    return 0; // Done section should only show essays with status completed, not referrals
  };

  const getReferralStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Helper functions to provide static data for missing properties
  const getEssayUrgency = (essayId: string) => {
    // Static urgency mapping - you can customize this
    const urgencyMap: { [key: string]: 'low' | 'medium' | 'high' } = {
      '1': 'high',
      '2': 'medium', 
      '3': 'low'
    };
    return urgencyMap[essayId] || 'medium';
  };

  const getEssayCompletedAt = (essayId: string) => {
    // Static completion data - you can customize this
    const completedMap: { [key: string]: string | null } = {
      '1': null,
      '2': null,
      '3': '2024-11-25T16:20:00Z' // Only essay 3 is completed
    };
    return completedMap[essayId] || null;
  };

  const getEssayReferredBy = (essayId: string) => {
    // Static deferral data - you can customize this
    const deferredMap: { [key: string]: string | null } = {
      '1': null,
      '2': null,
      '3': null
    };
    return deferredMap[essayId] || null;
  };

  // Function to get referral information for an essay
  const getEssayReferralInfo = (essayId: string) => {
    const referral = referrals.find(ref => ref.essayId === essayId);
    return referral ? {
      referredBy: referral.referredBy,
      referredTo: referral.referredTo,
      referredAt: referral.referredAt
    } : null;
  };

  // Function to get essays that have been sent by the current admin
  const getSentEssays = () => {
    return referrals
      .filter(ref => ref.type === 'sent')
      .map(referral => ({
        id: `sent-${referral.id}`, // Make key unique by combining type and referral ID
        essayId: referral.essayId, // Keep original essay ID for other operations
        title: referral.essayTitle,
        description: '', // Not available in referral data
        deadline: referral.deadline,
        essay_link: referral.essayLink,
        student_id: '', // Not available in referral data
        admin_id: '', // Not available in referral data
        admin_name: referral.referredBy,
        student_name: referral.studentName,
        created_at: referral.submittedAt || referral.referredAt,
        completed_at: undefined,
        status: referral.has_completed ? 'completed' : 'pending',
        word_count: referral.wordCount,
        grade: '', // Not available in referral data
        referred: true
      }));
  };

  // Function to get essays that have been received by the current admin
  const getReceivedEssays = () => {
    return referrals
      .filter(ref => ref.type === 'received')
      .map(referral => ({
        id: `received-${referral.id}`, // Make key unique by combining type and referral ID
        essayId: referral.essayId, // Keep original essay ID for other operations
        title: referral.essayTitle,
        description: '', // Not available in referral data
        deadline: referral.deadline,
        essay_link: referral.essayLink,
        student_id: '', // Not available in referral data
        admin_id: '', // Not available in referral data
        admin_name: referral.referredBy,
        student_name: referral.studentName,
        created_at: referral.submittedAt || referral.referredAt,
        completed_at: undefined,
        status: referral.has_completed ? 'completed' : 'pending',
        word_count: referral.wordCount,
        grade: '', // Not available in referral data
        referred: true
      }));
  };

  // Handler functions for essay actions
  const handleView = async (essay: any) => {
    setLoadingView(essay.id);
    try{
      const response = await fetch(`/api/essay-view?id=${essay.id}`);
      if(response.ok){
        const data = await response.json();
        
        setEssayRequests(prevRequests => 
          prevRequests.map(request => 
            request.id === essay.id 
              ? { ...request, status: 'in_review' }
              : request
          )
        );
        
        window.open(essay.essay_link, '_blank', 'noopener,noreferrer');
      }else{
        console.error('Failed to update status');
      }
    }catch(error){
      console.error('Error updating status:', error);
    } finally {
      setLoadingView(null);
    }
  };

  const handleReferPop = (essay: any) => {
    setSelectedEssay(essay);
    setShowReferModal(true);
  };

  const handleRefer = async (essay_id:string, from_admin_id:string, to_admin_id:string) => {
    setLoadingRefer(essay_id);
    
    const promise = Promise.all([
      deferTo(essay_id, from_admin_id, to_admin_id),
      changeReferStatus(essay_id)
    ]).then(([response, referResponse]) => {
      if(response.success && referResponse.success){
        setShowReferModal(false);
        setSelectedMemberId(null);
        
        // Reload the page after successful referral
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        
        return { success: true };
      } else {
        throw new Error(response.message || referResponse.message || "Failed to refer the essay.");
      }
    });
    
    showToastPromise({
      promise,
      loadingText: "Referring essay...",
      successText: "The essay has been referred to the selected admin.",
      errorText: "Failed to refer the essay. Please try again.",
      successHeaderText: "Essay referred successfully!",
      errorHeaderText: "Referral failed",
      direction: 'right'
    });
    
    // Handle loading state
    promise
      .then(() => {
        setLoadingRefer(null);
      })
      .catch(() => {
        setLoadingRefer(null);
      });
  };

  const handleReferView = async (essay:any) => {
    setLoadingView(essay.id);
    try{
      // Add 2-second delay with spinner
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if it's a referral (has essayLink) or regular essay (has essay_link)
      const essayLink = essay.essayLink || essay.essay_link;
      
      if (essayLink) {
        window.open(essayLink, '_blank', 'noopener,noreferrer');
      } else {
        console.error('No essay link found');
      }
    }catch(error){
      console.error('Error viewing essay:', error);
    }finally{
      setLoadingView(null);
    }
  }


  const handleMarkDone = async (essay_id: string) => {
    setLoadingMarkDone(essay_id);
    
    const promise = Promise.all([
      markReferralCompletedByEssayId(essay_id),
      essayCompleted(essay_id)
    ]).then(([referralResponse, essayResponse]) => {
      if(referralResponse.success && essayResponse.success){
        // Update the referral status in local state
        setReferrals(prevReferrals =>
          prevReferrals.map(referral =>
            referral.essayId === essay_id
              ? { ...referral, has_completed: true }
              : referral
          )
        );
        
        // Update the essay status in local state
        setEssayRequests(prevRequests => 
          prevRequests.map(request => 
            request.id === essay_id 
              ? { ...request, status: 'completed', completed_at: new Date().toISOString() }
              : request
          )
        );
        
        return { success: true };
      } else {
        throw new Error(referralResponse.message || essayResponse.message || "Failed to complete the essay.");
      }
    });
    
    showToastPromise({
      promise,
      loadingText: "Marking essay as done...",
      successText: "The essay has been successfully completed.",
      errorText: "Failed to mark essay as done. Please try again.",
      successHeaderText: "Essay marked as done!",
      errorHeaderText: "Failed to mark essay as done",
      direction: 'right'
    });
    
    // Handle loading state
    promise
      .then(() => {
        setLoadingMarkDone(null);
      })
      .catch(() => {
        setLoadingMarkDone(null);
      });
  };



  // Function to handle marking referrals as completed (for received referrals)
  const handleMarkReferralCompleted = async (referral_id: string) => {
    setLoadingMarkDone(referral_id);
    
    const promise = markReferralCompleted(referral_id).then((response) => {
      if(response.success){
        // Update the referral status in local state
        setReferrals(prevReferrals =>
          prevReferrals.map(referral =>
            referral.id === referral_id
              ? { ...referral, has_completed: true, status: 'completed' }
              : referral
          )
        );
        
        return { success: true };
      } else {
        throw new Error(response.message || "Failed to complete the referral.");
      }
    });
    
    showToastPromise({
      promise,
      loadingText: "Marking referral as completed...",
      successText: "The referral has been successfully completed.",
      errorText: "Failed to mark referral as completed. Please try again.",
      successHeaderText: "Referral marked as completed!",
      errorHeaderText: "Failed to mark referral as completed",
      direction: 'right'
    });
    
    // Handle loading state
    promise
      .then(() => {
        setLoadingMarkDone(null);
      })
      .catch(() => {
        setLoadingMarkDone(null);
      });
  };

  const handleReferToMember = async (memberId: string) => {
    if (!selectedEssay) return;
    
    setLoadingRefer(selectedEssay.id);
    try {
      await handleRefer(selectedEssay.id, adminId!, memberId);
      
      // Update the essay status in the local state
      setEssayRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === selectedEssay.id 
            ? { ...request, status: 'referred' }
            : request
        )
      );
      
      setShowReferModal(false);
      setSelectedMemberId(null);
    } catch (error) {
      console.error('Error referring essay:', error);
    } finally {
      setLoadingRefer(null);
    }
  };

  // Helper function to safely parse dates
  const safeFormatDate = (dateValue: any, formatString: string) => {
    if (!dateValue) return 'Not specified';
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, formatString);
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Helper function to get relative time (e.g., "3 days ago", "2 weeks ago")
  const getRelativeTime = (dateValue: any) => {
    if (!dateValue) return 'Not specified';
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      const diffInWeeks = Math.floor(diffInDays / 7);
      const remainingDays = diffInDays % 7;
      
      if (diffInDays === 0) {
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        if (diffInHours === 0) {
          const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
          if (diffInMinutes === 0) {
            return 'Just now';
          }
          return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
        }
        return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
      } else if (diffInDays === 1) {
        return 'Yesterday';
      } else if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
      } else if (diffInWeeks === 1) {
        return remainingDays === 0 ? '1 week ago' : `1 week and ${remainingDays} day${remainingDays === 1 ? '' : 's'} ago`;
      } else if (diffInWeeks < 4) {
        return remainingDays === 0 ? `${diffInWeeks} weeks ago` : `${diffInWeeks} weeks and ${remainingDays} day${remainingDays === 1 ? '' : 's'} ago`;
      } else {
        const diffInMonths = Math.floor(diffInWeeks / 4);
        const remainingWeeks = diffInWeeks % 4;
        if (remainingWeeks === 0) {
          return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
        }
        return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} and ${remainingWeeks} week${remainingWeeks === 1 ? '' : 's'} ago`;
      }
    } catch (error) {
      return 'Invalid date';
    }
  };



  // Helper function to get color based on completion time (descending order - most recent first)
  const getCompletionTimeColor = (dateValue: any) => {
    if (!dateValue) {
      return 'bg-gray-50 text-gray-800 border-gray-300 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-400';
    }
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return 'bg-gray-50 text-gray-800 border-gray-300 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-400';
      }
      
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) {
        return 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100 hover:text-green-900 hover:border-green-400';
      } else if (diffInDays >= 1 && diffInDays <= 3) {
        return 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100 hover:text-green-900 hover:border-green-400';
      } else if (diffInDays >= 4 && diffInDays <= 7) {
        return 'bg-yellow-50 text-yellow-800 border-yellow-300 hover:bg-yellow-100 hover:text-yellow-900 hover:border-yellow-400';
      } else if (diffInDays > 7) {
        return 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100 hover:text-red-900 hover:border-red-400';
      } else {
        return 'bg-green-50 text-green-800 border-green-300 hover:bg-green-100 hover:text-green-900 hover:border-green-400';
      }
    } catch (error) {
      return 'bg-gray-50 text-gray-800 border-gray-300 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-400';
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid gap-4">
      {[1, 2, 3].map((index) => (
        <Card key={index} className="border border-dashboard-border bg-dashboard-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="h-6 bg-dashboard-muted animate-pulse rounded w-3/4"></div>
                <div className="flex items-center gap-4">
                  <div className="h-4 bg-dashboard-muted animate-pulse rounded w-1/3"></div>
                  <div className="h-4 bg-dashboard-muted animate-pulse rounded w-1/4"></div>
                </div>
              </div>
              <div className="h-6 bg-dashboard-muted animate-pulse rounded w-16"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-dashboard-muted animate-pulse rounded"></div>
                <div className="h-4 bg-dashboard-muted animate-pulse rounded w-32"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-dashboard-muted animate-pulse rounded"></div>
                <div className="h-4 bg-dashboard-muted animate-pulse rounded w-24"></div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <div className="h-8 bg-dashboard-muted animate-pulse rounded w-16"></div>
            <div className="h-8 bg-dashboard-muted animate-pulse rounded w-16"></div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  useEffect(() => {
    const fetchEssayRequests = async () => {
      if (!adminId) {
        return;
      }
      
      setIsLoading(true);
      try{
        const response = await fetch(`/api/essay-requests?admin_id=${adminId}`);
        if(response.ok){
          const data = await response.json();
          setEssayRequests(data);
        }else{
          console.error('Failed to fetch essay requests');
        }
      }catch(error){
        console.error('Error fetching essay requests:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEssayRequests();
  }, [adminId]);
  
  useEffect(() => {
    const fetchAdmin = async() => {
      try{
        const response = await fetch('/api/fellows');
        if(response.ok){
          const data = await response.json();
          setAdmins(data);
        }else{
          console.error('Failed to fetch admin');
        }
      }catch(error){
        console.error('Error fetching admin:', error);
      }
    }
    fetchAdmin();
  }, []);

  // Fetch referrals data
  useEffect(() => {
    const fetchReferrals = async () => {
      if (!adminId) {
        return;
      }
      
      try {
        const response = await fetch(`/api/essay-referrals?admin_id=${adminId}&type=all`);
        if (response.ok) {
          const data = await response.json();
          setReferrals(data);
        } else {
          console.error('Failed to fetch referrals');
        }
      } catch (error) {
        console.error('Error fetching referrals:', error);
      }
    };
    
    fetchReferrals();
  }, [adminId, referralSubTab]);

  return (
    <div className="p-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold font-cal-sans text-gray-800 mb-3">Essay Requests</h1>
          <p className="text-md text-gray-600">
            Review and manage student essay submissions
          </p>
        </div>

        {/* Tabs */}
        <ToggleGroup
              type="single"
              value={activeTab}
              onValueChange={(value) => value && setActiveTab(value as any)}
              className="justify-start"
            >
              <ToggleGroupItem value="requests" className="data-[state=on]:bg-dashboard-primary data-[state=on]:text-dashboard-primary-foreground">
                {`Requests (${getTabCount('requests')})`}
              </ToggleGroupItem>
              <ToggleGroupItem value="pending" className="data-[state=on]:bg-dashboard-primary data-[state=on]:text-dashboard-primary-foreground">
                {`Pending (${getTabCount('pending')})`}
              </ToggleGroupItem>
              <ToggleGroupItem value="done" className="data-[state=on]:bg-dashboard-primary data-[state=on]:text-dashboard-primary-foreground">
                {`Done (${getTabCount('done')})`}
              </ToggleGroupItem>
              <ToggleGroupItem value="referrals" className="data-[state=on]:bg-dashboard-primary data-[state=on]:text-dashboard-primary-foreground">
                {`Referrals (${getTabCount('referrals')})`}
              </ToggleGroupItem>
            </ToggleGroup>

            {/* Referrals Sub-tabs */}
            {activeTab === 'referrals' && (
              <div className="border-b border-dashboard-border">
                <ToggleGroup
                  type="single"
                  value={referralSubTab}
                  onValueChange={(value) => value && setReferralSubTab(value as any)}
                  className="justify-start"
                >
                  <ToggleGroupItem value="sent" className="data-[state=on]:bg-dashboard-primary data-[state=on]:text-dashboard-primary-foreground">
                    <Send className="h-4 w-4 mr-2" />
                    {`Sent (${getReferralSubTabCount('sent')})`}
                  </ToggleGroupItem>
                  <ToggleGroupItem value="received" className="data-[state=on]:bg-dashboard-primary data-[state=on]:text-dashboard-primary-foreground">
                    <Inbox className="h-4 w-4 mr-2" />
                    {`Received (${getReferralSubTabCount('received')})`}
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            )}

            {activeTab === 'referrals' && (
              <>
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <div className="grid gap-4">
                    {referralSubTab === 'sent' && getSentEssays().map((essay) => {
                      const referral = referrals.find(ref => ref.essayId === essay.essayId && ref.type === 'sent');
                      if (!referral) return null;
                      
                      return (
                        <Card key={essay.id} className="border border-dashboard-border bg-dashboard-card">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-lg text-dashboard-foreground">{essay.title}</CardTitle>
                                <div className="flex items-center gap-4 text-sm text-dashboard-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {essay.student_name}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Send className="h-4 w-4" />
                                    <span>Sent to:</span>
                                    <span className="font-medium">{referral.referredTo}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                {(() => {
                                  console.log('🔍 Debug referral data:', {
                                    id: referral.id,
                                    has_completed: referral.has_completed,
                                    completed_at: referral.completed_at,
                                    completed_at_type: typeof referral.completed_at,
                                    status: referral.status
                                  });
                                  return (
                                    <Badge className={referral.has_completed ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                                      {referral.has_completed ? (
                                        <div className="flex items-center gap-1">
                                          <span>Completed</span>
                                          <span className="text-xs">
                                            {referral.completed_at ? getRelativeTime(referral.completed_at) : 'No date'}
                                          </span>
                                        </div>
                                      ) : (
                                        'Pending'
                                      )}
                                    </Badge>
                                  );
                                })()}
                              </div>
                            </div>
                          </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-dashboard-muted-foreground" />
                              <span>Deadline: {essay.deadline ? format(new Date(essay.deadline), 'MMM dd, yyyy') : 'Not specified'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-dashboard-muted-foreground" />
                              <span>Submitted: </span>
                              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 hover:text-gray-900 hover:border-gray-400">
                                {getRelativeTime(essay.created_at)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-dashboard-muted-foreground" />
                              <span>Word Count: {essay.word_count} words</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Send className="h-4 w-4 text-dashboard-muted-foreground" />
                              <span>Referred: {format(new Date(referral.referredAt), 'MMM dd, yyyy')}</span>
                            </div>
                           
                          </div>
                        </CardContent>
                        <CardFooter className="gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="px-8"
                            onClick={() => handleReferView(essay)}
                            disabled={!essay.essay_link || loadingView === essay.essayId}
                          >
                            {loadingView === essay.essayId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "View Essay"
                            )}
                          </Button>
                          
                          {/* For sent essays that haven't been completed */}
                          {referral.has_completed && (() => {
                            // Find the actual essay from essayRequests to check its status
                            const actualEssay = essayRequests.find(req => req.id === essay.essayId);
                            return actualEssay ? actualEssay.status !== 'completed' : true;
                          })() && (
                            <Button 
                              onClick={() => handleMarkDone(essay.essayId)}
                              size="sm"
                              className="bg-orange-500 text-white hover:bg-orange-700 px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(255,165,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(255,165,0,0.1)] transition duration-200"
                              disabled={loadingMarkDone === essay.essayId}
                            >
                              {loadingMarkDone === essay.essayId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Mark as Done"
                              )}
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                      );
                    })}
                    {referralSubTab === 'received' && getReceivedEssays().map((essay) => {
                      const referral = referrals.find(ref => ref.essayId === essay.essayId && ref.type === 'received');
                      if (!referral) return null;
                      
                      return (
                        <Card key={essay.id} className="border border-dashboard-border bg-dashboard-card">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-lg text-dashboard-foreground">{essay.title}</CardTitle>
                                <div className="flex items-center gap-4 text-sm text-dashboard-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {essay.student_name}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Inbox className="h-4 w-4" />
                                    <span>Received from:</span>
                                    <span className="font-medium">{referral.referredBy}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge className={referral.has_completed ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                                  {referral.has_completed ? (
                                    <div className="flex items-center gap-1">
                                      <span>Completed</span>
                                      <span className="text-xs">
                                        {referral.completed_at ? getRelativeTime(referral.completed_at) : 'No date'}
                                      </span>
                                    </div>
                                  ) : (
                                    'Pending'
                                  )}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-dashboard-muted-foreground" />
                                <span>Deadline: {essay.deadline ? format(new Date(essay.deadline), 'MMM dd, yyyy') : 'Not specified'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-dashboard-muted-foreground" />
                                <span>Submitted: </span>
                                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 hover:text-gray-900 hover:border-gray-400">
                                  {getRelativeTime(essay.created_at)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-dashboard-muted-foreground" />
                                <span>Word Count: {essay.word_count} words</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Send className="h-4 w-4 text-dashboard-muted-foreground" />
                                <span>Referred: {format(new Date(referral.referredAt), 'MMM dd, yyyy')}</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="px-8"
                              onClick={() => handleReferView(essay)}
                              disabled={!essay.essay_link || loadingView === essay.essayId}
                            >
                              {loadingView === essay.essayId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "View Essay"
                              )}
                            </Button>
      
                            
                            {/* For received essays that haven't been completed */}
                            {!referral.has_completed && (
                              <Button 
                                onClick={() => handleMarkReferralCompleted(referral.id)}
                                size="sm"
                                className="bg-orange-500 text-white hover:bg-orange-700 px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(255,165,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(255,165,0,0.1)] transition duration-200"
                                disabled={loadingMarkDone === referral.id}
                              >
                                {loadingMarkDone === referral.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Mark as Done"
                                )}
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      );
                    })}
                    {((referralSubTab === 'sent' && getSentEssays().length === 0) || (referralSubTab === 'received' && getReceivedEssays().length === 0)) && (
                      <Card className="p-8 text-center bg-dashboard-card">
                        <p className="text-dashboard-muted-foreground">
                          No {referralSubTab} essays found.
                        </p>
                      </Card>
                    )}
                                      </div>
                  )}
                </>
              )}

            {activeTab !== 'referrals' && (
              <>
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <div className="grid gap-4">
                    {filteredEssayRequests.map((essay) => (
                  <Card key={essay.id} className="border border-dashboard-border bg-dashboard-card">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg text-dashboard-foreground">{essay.title}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-dashboard-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {essay.student_name}
                            </div>
                            {essay.grade && (
                              <Badge variant="outline" className={getGradeColor(essay.grade)}>
                                {essay.grade}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {essay.status === 'completed' ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Completed {essay.completed_at ? getRelativeTime(essay.completed_at) : ''}
                          </Badge>
                        ) : (
                          <Badge className={getStatusColor(essay.status)}>
                            {essay.status === 'pending' ? 'New Request' : 
                             essay.status === 'in_review' ? 'In Review' : 
                             essay.status === 'completed' ? 'Completed' : essay.status}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-dashboard-muted-foreground" />
                          <span>Submitted: {getRelativeTime(essay.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-dashboard-muted-foreground" />
                          <span>{essay.word_count || 'Not specified'} words</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-dashboard-muted-foreground" />
                          <span>Deadline: {essay.deadline ? format(new Date(essay.deadline), 'MMM dd, yyyy') : 'Not specified'}</span>
                        </div>

                        {essay.referred && getEssayReferralInfo(essay.id) && (
                          <>
                            <div className="flex items-center gap-2">
                              <Send className="h-4 w-4 text-dashboard-accent" />
                              <span>Referred from: {getEssayReferralInfo(essay.id)?.referredBy}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-dashboard-accent" />
                              <span>Referred to: {getEssayReferralInfo(essay.id)?.referredTo}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-dashboard-accent" />
                              <span>Referred on: {getEssayReferralInfo(essay.id)?.referredAt ? format(new Date(getEssayReferralInfo(essay.id)!.referredAt), 'MMM dd, yyyy') : 'Not specified'}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                      {activeTab === 'requests' && (
                        <>
                          <Button 
                            onClick={() => handleView(essay)} 
                            size="sm" 
                            className="bg-green-600 text-white hover:bg-green-700 px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200"
                            disabled={loadingView === essay.id}
                          >
                            {loadingView === essay.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "View Essay"
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleReferPop(essay)} 
                            size="sm" 
                            className="px-8"
                            disabled={loadingRefer === essay.id}
                          >
                            {loadingRefer === essay.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Refer"
                            )}
                          </Button>
                        </>
                      )}
                      {activeTab === 'pending' && (
                        <>
                          <Button 
                            onClick={() => handleReferView(essay)} 
                            size="sm" 
                            className="bg-green-600 text-white hover:bg-green-700 px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200"
                            disabled={loadingView === essay.id}
                          >
                            {loadingView === essay.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "View Essay"
                            )}
                          </Button>
                          <Button 
                            onClick={() => handleMarkDone(String(essay.id))} 
                            size="sm"
                            className="bg-orange-500 text-white hover:bg-orange-700 px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(255,165,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(255,165,0,0.1)] transition duration-200"
                            disabled={loadingMarkDone === essay.id}
                          >
                            {loadingMarkDone === essay.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Mark as Done"
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleReferPop(essay)} 
                            size="sm"
                            className="px-8"
                            disabled={loadingRefer === essay.id}
                          >
                            {loadingRefer === essay.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Refer"
                            )}
                          </Button>
                        </>
                      )}
                      {activeTab === 'done' && (
                        <>
                          <Button 
                            onClick={() => handleReferView(essay)} 
                            size="sm" 
                            className="bg-green-600 text-white hover:bg-green-700 px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200"
                            disabled={loadingView === essay.id}
                          >
                            {loadingView === essay.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "View Essay"
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleReferPop(essay)} 
                            size="sm"
                            className="px-8"
                            disabled={loadingRefer === essay.id}
                          >
                            {loadingRefer === essay.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Refer"
                            )}
                          </Button>
                        </>
                      )}
                    </CardFooter>
                  </Card>
                ))}
                {filteredEssayRequests.length === 0 && !isLoading && (
                  <Card className="p-8 text-center bg-dashboard-card">
                    <p className="text-dashboard-muted-foreground">
                      No essays found.
                    </p>
                  </Card>
                )}
                
                {/* Show completed referrals in done tab - REMOVED - done section should only show essays with status completed */}
                {activeTab === 'done' && false && (
                  <>
                    {referrals.filter(ref => ref.status === 'completed').map((referral) => (
                      <Card key={`ref-${referral.id}`} className="border border-dashboard-border bg-dashboard-card">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg text-dashboard-foreground">{referral.essayTitle}</CardTitle>
                              <div className="flex items-center gap-4 text-sm text-dashboard-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {referral.studentName}
                                </div>
                                <div className="flex items-center gap-1">
                                  {referral.type === 'sent' ? (
                                    <>
                                      <Send className="h-4 w-4" />
                                      <span>Sent to:</span>
                                      <span className="font-medium">{referral.referredTo}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Inbox className="h-4 w-4" />
                                      <span>Received from:</span>
                                      <span className="font-medium">{referral.referredBy}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                Completed
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {referral.type === 'sent' ? 'Sent' : 'Received'}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-dashboard-muted-foreground" />
                              <span>Deadline: {referral.deadline ? format(new Date(referral.deadline), 'MMM dd, yyyy') : 'Not specified'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-dashboard-muted-foreground" />
                              <span>Submitted: </span>
                              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 hover:text-gray-900 hover:border-gray-400">
                                {getRelativeTime(referral.submittedAt)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-dashboard-muted-foreground" />
                              <span>Word Count: {referral.wordCount} words</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Send className="h-4 w-4 text-dashboard-muted-foreground" />
                              <span>Referred: {format(new Date(referral.referredAt), 'MMM dd, yyyy')}</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="px-8"
                            onClick={() => handleReferView(referral)}
                            disabled={!referral.essayLink || loadingView === referral.id}
                          >
                            {loadingView === referral.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "View Essay"
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </>
                )}
              </div>
                )}
              </>
            )}
            <Dialog open={showReferModal} onOpenChange={setShowReferModal}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Refer Essay Request
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Choose a team member to refer this essay to:
                  </DialogDescription>
                  {selectedEssay && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                      <div className="font-semibold text-gray-900">{selectedEssay.title}</div>
                      <div className="text-sm text-gray-600">by {selectedEssay.student_name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Submitted: {safeFormatDate(selectedEssay.created_at, 'MMM dd, yyyy')}
                      </div>
                    </div>
                  )}
                </DialogHeader>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {(() => {
                    const filteredAdmins = admins.filter(member => {
                      const memberIdStr = String(member.id);
                      const adminIdStr = String(adminId);
                      return memberIdStr !== adminIdStr;
                    });
                    
                    if (filteredAdmins.length > 0) {
                      return filteredAdmins.map((member) => (
                        <Button
                          key={member.id}
                          variant="outline"
                          className={`w-full justify-start h-auto p-4 transition-colors ${
                            selectedMemberId === member.id 
                              ? 'bg-slate-100' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedMemberId(selectedMemberId === member.id ? null : member.id)}
                          disabled={loadingRefer === selectedEssay?.id}
                        >
                          <div className="text-left w-full flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-600">{member.role}</div>
                            </div>
                            {selectedMemberId === member.id && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                        </Button>
                      ));
                    } else {
                      return (
                        <div className="text-center py-4 text-gray-500">
                          No other team members available to refer to
                        </div>
                      );
                    }
                  })()}
                </div>
                <DialogFooter className="gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowReferModal(false);
                      setSelectedMemberId(null);
                    }}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => selectedMemberId && selectedEssay?.id && handleRefer(selectedEssay.id, adminId!, selectedMemberId)}
                    disabled={!selectedMemberId || loadingRefer === selectedEssay?.id}
                    className="bg-green-600 text-white hover:bg-green-700 px-6 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200"
                  >
                    {loadingRefer === selectedEssay?.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Refer"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
      </div>
    </div>
  );
} 