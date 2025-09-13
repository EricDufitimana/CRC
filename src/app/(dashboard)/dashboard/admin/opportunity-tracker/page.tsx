"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "../../../../../../zenith/src/components/ui/badge";
import { Button } from "../../../../../../zenith/src/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../../../../../zenith/src/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../../../../zenith/src/components/ui/dialog";
import { Calendar, Clock, Users, FileText, AlertTriangle, Loader2, Send, Inbox, User, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { Label } from "../../../../../../zenith/src/components/ui/label";
import { Textarea } from "../../../../../../zenith/src/components/ui/textarea";
import { format } from "date-fns";
import { ToggleGroup, ToggleGroupItem } from "../../../../../../zenith/src/components/ui/toggle-group";
import { useUserData } from '@/hooks/useUserData';
import { changeOpportunityStatus } from '@/actions/opportunities/changeOpportunityStatus';
import { deferOpportunityTo } from '@/actions/opportunities/deferOpportunityTo';
import { changeOpportunityReferStatus } from '@/actions/opportunities/changeOpportunityReferStatus';
import { markOpportunityReferralCompleted } from '@/actions/opportunities/markOpportunityReferralCompleted';
import { acceptOpportunityReferral } from '@/actions/opportunities/acceptOpportunityReferral';
import { denyOpportunityReferral } from '@/actions/opportunities/denyOpportunityReferral';
import { showToastPromise, showToastSuccess, showToastError } from "@/components/toasts";
import { 
  sendOpportunityBeingReviewedEmailServer,
  sendOpportunityAcceptedEmailServer,
  sendOpportunityDeniedEmailServer
} from "@/actions/opportunities/sendOpportunityEmail";
import { sendOpportunityEmail } from "@/actions/emails/sendOpportunityEmail";
import MDEditor from '@uiw/react-md-editor';
import MarkdownIt from 'markdown-it';

type Opportunity = {
  id: string;
  title: string;
  description: string;
  deadline: string;
  link: string;
  student_id: string;
  admin_id: string;
  admin_name: string;
  student_name: string;
  student_email: string;
  student_grade?: string;
  created_at: string;
  status: 'pending' | 'in_review' | 'accepted' | 'denied' | 'completed';
  ai_category?: string;
  referred?: boolean;
  markdown_pitch?: string;
  reason?: string | null;
  accepted_at?: string | null;
  referral_info?: {
    referred_by: string | null;
    referred_to: string | null;
    referred_at: string | null;
    status: string;
  } | null;
};

type Referral = {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  opportunityLink?: string | null;
  studentName: string;
  studentEmail?: string | null;
  referredTo: string;
  referredBy: string;
  referredAt: Date;
  status: 'pending' | 'accepted' | 'denied';
  type: 'sent' | 'received';
  deadline?: Date | null;
  submittedAt?: Date | null;
  has_completed?: boolean;
  opportunityReason?: string | null;
  opportunityStatus?: string | null;
  accepted_at?: string | null;
};

export default function OpportunityTracker() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'requests' | 'pending' | 'done' | 'referrals'>('requests');
  const [referralSubTab, setReferralSubTab] = useState<'sent' | 'received'>('sent');
  const [doneSubTab, setDoneSubTab] = useState<'accepted' | 'denied'>('accepted');
  const [showReferModal, setShowReferModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [admins, setAdmins] = useState<Array<{id:string, name:string, role:string}>>([]);
  const [loadingView, setLoadingView] = useState<string | null>(null);
  const [loadingRefer, setLoadingRefer] = useState<string | null>(null);
  const [loadingAccept, setLoadingAccept] = useState<string | null>(null);
  const [loadingDeny, setLoadingDeny] = useState<string | null>(null);
  const [loadingMarkDone, setLoadingMarkDone] = useState<string | null>(null);
  const [showAcceptDenyModal, setShowAcceptDenyModal] = useState(false);
  const [selectedReferralForAction, setSelectedReferralForAction] = useState<Referral | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'deny'>('accept');
  const [reason, setReason] = useState('');
  const [referralEmailType, setReferralEmailType] = useState<'template' | 'personal'>('template');
  const [referralPersonalEmail, setReferralPersonalEmail] = useState('');
  const [referralEmailSent, setReferralEmailSent] = useState(false);
  const [sendingReferralEmail, setSendingReferralEmail] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedOpportunityForAccept, setSelectedOpportunityForAccept] = useState<Opportunity | null>(null);
  const [emailType, setEmailType] = useState<'template' | 'personal'>('template');
  const [personalEmail, setPersonalEmail] = useState('');
  const [showAddToOpportunities, setShowAddToOpportunities] = useState(false);
  const [acceptingOpportunity, setAcceptingOpportunity] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [selectedOpportunityForDeny, setSelectedOpportunityForDeny] = useState<Opportunity | null>(null);
  const [denyReason, setDenyReason] = useState('');
  const [denyingOpportunity, setDenyingOpportunity] = useState(false);
  const [denyEmailType, setDenyEmailType] = useState<'template' | 'personal'>('template');
  const [denyPersonalEmail, setDenyPersonalEmail] = useState('');
  const [denyEmailSent, setDenyEmailSent] = useState(false);
  const [sendingDenyEmail, setSendingDenyEmail] = useState(false);
  const md = new MarkdownIt();
  const { userId, adminId } = useUserData();
  console.log("Admin ID:", adminId);

  // Scroll prevention when modals are open
  useEffect(() => {
    const isAnyModalOpen = showReferModal || showAcceptModal || showDenyModal || showAcceptDenyModal;
    
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showReferModal, showAcceptModal, showDenyModal, showAcceptDenyModal]);

  const getStatusColor = (status: 'pending' | 'in_review' | 'accepted' | 'denied' | 'completed') => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-200';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-800 hover:border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800 hover:border-green-200';
      case 'denied':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100 hover:text-red-800 hover:border-red-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800 hover:border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100 hover:text-gray-800 hover:border-gray-200';
    }
  };

  const getReferralStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-800 hover:border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800 hover:border-green-200';
      case 'denied':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100 hover:text-red-800 hover:border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100 hover:text-gray-800 hover:border-gray-200';
    }
  };

  // Generate consistent colors for AI categories
  const getAICategoryColor = (category: string | undefined) => {
    if (!category) return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100 hover:text-gray-800 hover:border-gray-200';
    
    // Create a hash from the category string to get consistent colors
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      const char = category.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use the hash to select from ai_category_colors with hover states
    const aiCategoryColors = [
      'bg-ai_category_colors-1 text-white hover:bg-ai_category_colors-1 hover:text-white',
      'bg-ai_category_colors-2 text-white hover:bg-ai_category_colors-2 hover:text-white',
      'bg-ai_category_colors-3 text-white hover:bg-ai_category_colors-3 hover:text-white',
      'bg-ai_category_colors-4 text-white hover:bg-ai_category_colors-4 hover:text-white',
      'bg-ai_category_colors-5 text-white hover:bg-ai_category_colors-5 hover:text-white',
      'bg-ai_category_colors-6 text-white hover:bg-ai_category_colors-6 hover:text-white',
      'bg-ai_category_colors-7 text-white hover:bg-ai_category_colors-7 hover:text-white',
      'bg-ai_category_colors-8 text-white hover:bg-ai_category_colors-8 hover:text-white',
      'bg-ai_category_colors-9 text-white hover:bg-ai_category_colors-9 hover:text-white',
      'bg-ai_category_colors-10 text-white hover:bg-ai_category_colors-10 hover:text-white',
    ];
    
    const index = Math.abs(hash) % aiCategoryColors.length;
    return aiCategoryColors[index];
  };

  const getGradeColor = (grade: string | undefined) => {
    if (!grade) return "bg-gray-200 text-gray-700 hover:bg-gray-200 hover:text-gray-700";
    if (grade === "Enrichment Year") return "bg-yearcolors-ey text-black hover:bg-yearcolors-ey hover:text-black";
    if (grade === "Senior 4") return "bg-yearcolors-s4 text-black hover:bg-yearcolors-s4 hover:text-black";
    if (grade === "Senior 5") return "bg-yearcolors-s5 text-black hover:bg-yearcolors-s5 hover:text-black";
    if (grade === "Senior 6") return "bg-yearcolors-s6 text-black hover:bg-yearcolors-s6 hover:text-black";
    return "bg-gray-200 text-gray-700 hover:bg-gray-200 hover:text-gray-700";
  };

  const filteredOpportunities = opportunities
    .filter(opp => {
      if (activeTab === 'requests') {
        return opp.status === 'pending' && !opp.referred;
      }
      if (activeTab === 'pending') {
        return opp.status === 'in_review';
      }
      if (activeTab === 'done') {
        if (doneSubTab === 'accepted') {
          return opp.status === 'accepted';
        }
        if (doneSubTab === 'denied') {
          return opp.status === 'denied';
        }
        return false;
      }
      return false;
    })
    .sort((a, b) => {
      if (activeTab === 'done') {
        // For accepted/denied opportunities, sort by accepted_at (most recent first)
        const aAcceptedAt = a.accepted_at ? new Date(a.accepted_at) : null;
        const bAcceptedAt = b.accepted_at ? new Date(b.accepted_at) : null;
        
        // Handle null cases - put nulls at the end
        if (aAcceptedAt && !bAcceptedAt) return -1; // a has date, b doesn't
        if (!aAcceptedAt && bAcceptedAt) return 1;  // b has date, a doesn't
        if (!aAcceptedAt && !bAcceptedAt) {
          // Both are null, fall back to created_at (newest first)
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB.getTime() - dateA.getTime();
        }
        
        // Both have accepted_at dates, sort by most recent first
        return bAcceptedAt!.getTime() - aAcceptedAt!.getTime();
      } else {
        // For other tabs, sort by created_at (oldest first)
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateA.getTime() - dateB.getTime();
      }
    });

  const filteredReferrals = referrals
    .filter(referral => {
      if (activeTab === 'referrals') {
        if (referralSubTab === 'sent') {
          // Show all sent referrals regardless of completion status
          return referral.type === 'sent';
        }
        if (referralSubTab === 'received') {
          return referral.type === 'received';
        }
      }
      return false;
    })
    .sort((a, b) => {
      const aCompleted = a.has_completed;
      const bCompleted = b.has_completed;
      const aStatus = a.status;
      const bStatus = b.status;
      
      console.log('🔍 Sorting referrals:', {
        aId: a.id,
        aType: a.type,
        aCompleted: aCompleted,
        aStatus: aStatus,
        bId: b.id,
        bType: b.type,
        bCompleted: bCompleted,
        bStatus: bStatus
      });
      
      // First priority: Pending referrals come first
      if (aStatus === 'pending' && bStatus !== 'pending') return -1;
      if (aStatus !== 'pending' && bStatus === 'pending') return 1;
      
      // Second priority: Within same status, sort by completion
      if (a.type === 'sent' && b.type === 'sent') {
        if (aCompleted && !bCompleted) return 1; // Move completed to bottom
        if (!aCompleted && bCompleted) return -1;
      } else if (a.type === 'received' && b.type === 'received') {
        if (aCompleted && !bCompleted) return 1; // Move completed to bottom
        if (!aCompleted && bCompleted) return -1;
      }
      
      // Third priority: Sort by date (most recent first for all referrals)
      const dateA = new Date(a.submittedAt || a.referredAt || 0);
      const dateB = new Date(b.submittedAt || b.referredAt || 0);
      
      // Always show most recent first
      return dateB.getTime() - dateA.getTime();
    });

  const getTabCount = (tab: 'requests' | 'pending' | 'done' | 'referrals') => {
    if (tab === 'requests') {
      return opportunities.filter(opp => opp.status === 'pending' && !opp.referred).length;
    }
    if (tab === 'pending') {
      return opportunities.filter(opp => opp.status === 'in_review').length;
    }
    if (tab === 'done') {
      const completedOpps = opportunities.filter(opp => opp.status === 'accepted' || opp.status === 'denied').length;
      console.log('Done tab count - Total opportunities:', opportunities.length);
      console.log('Done tab count - Accepted opportunities:', opportunities.filter(opp => opp.status === 'accepted').length);
      console.log('Done tab count - Denied opportunities:', opportunities.filter(opp => opp.status === 'denied').length);
      console.log('Done tab count - Completed opportunities:', completedOpps);
      return completedOpps; // Only count opportunities, not referrals
    }
    if (tab === 'referrals') {
      // Count should be sum of sent + received active referrals
      const sentCount = getReferralSubTabCount('sent');
      const receivedCount = getReferralSubTabCount('received');
      const totalCount = sentCount + receivedCount;
      console.log('Main referrals count (sum):', totalCount, '(sent:', sentCount, 'received:', receivedCount, ')');
      return totalCount;
    }
    return 0;
  };

  const getReferralSubTabCount = (subTab: 'sent' | 'received') => {
    const filteredReferrals = referrals.filter(referral => {
      if (referral.type !== subTab) return false;
      
      if (subTab === 'sent') {
        // Don't count if has_completed is true OR if opportunity has already been reviewed (accepted/denied)
        return !referral.has_completed && !(referral.opportunityStatus === 'accepted' || referral.opportunityStatus === 'denied');
      }
      if (subTab === 'received') {
        // Don't count if has_completed is true OR if opportunity has already been reviewed (accepted/denied)
        return !referral.has_completed && !(referral.opportunityStatus === 'accepted' || referral.opportunityStatus === 'denied');
      }
      
      return false;
    });
    
    console.log(`${subTab} referrals count:`, filteredReferrals.length);
    console.log(`${subTab} referrals:`, filteredReferrals.map(r => ({ id: r.id, has_completed: r.has_completed, opportunityStatus: r.opportunityStatus })));
    
    return filteredReferrals.length;
  };

  const getCompletedReferralsCount = () => {
    return referrals.filter(referral => referral.has_completed || referral.status === 'accepted' || referral.status === 'denied').length;
  };

  const handleView = async (opportunity: Opportunity) => {
    setLoadingView(opportunity.id);
    
    try {
      // Show spinner for 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Open the opportunity link in a new window
      window.open(opportunity.link, '_blank', 'noopener,noreferrer');
      
      // Change status from 'pending' to 'in_review' using the action
      if (opportunity.status === 'pending') {
        const result = await changeOpportunityStatus(opportunity.id, 'in_review');
        
        if (result.success) {
          // Send email notification to student
          try {
            await sendOpportunityBeingReviewedEmailServer(
              opportunity.student_email,
              opportunity.title,
              opportunity.student_name
            );
            console.log('Opportunity review email sent successfully');
          } catch (emailError) {
            console.error('Failed to send opportunity review email:', emailError);
            // Don't fail the whole operation if email fails
          }
          
          // Update local state
          setOpportunities(prevOpps => 
            prevOpps.map(opp => 
              opp.id === opportunity.id 
                ? { ...opp, status: 'in_review' }
                : opp
            )
          );
          console.log('Opportunity status changed from pending to in_review:', opportunity.id);
        } else {
          console.error('Failed to update opportunity status:', result.message);
        }
      } else {
        console.log('Opportunity viewed (non-pending):', opportunity.id);
      }
      
    } catch (error) {
      console.error('Error viewing opportunity:', error);
    } finally {
      setLoadingView(null);
    }
  };

  const handleViewPending = async (opportunity: Opportunity) => {
    setLoadingView(opportunity.id);
    try {
      // Show spinner for 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Open the opportunity link in a new window without changing status
      window.open(opportunity.link, '_blank', 'noopener,noreferrer');
      
      console.log('Opportunity viewed (pending):', opportunity.id);
      
    } catch (error) {
      console.error('Error viewing opportunity:', error);
    } finally {
      setLoadingView(null);
    }
  };

  const handleAcceptClick = (opportunity: Opportunity) => {
    setSelectedOpportunityForAccept(opportunity);
    setShowAcceptModal(true);
    setEmailType('template');
    setPersonalEmail('');
    setShowAddToOpportunities(false);
    setEmailSent(false);
  };

    const handleAccept = async (opportunity: Opportunity) => {
    setAcceptingOpportunity(true);
    
    const promise = (async () => {
      try {
        console.log('handleAccept called for opportunity:', opportunity.id);
        console.log('Email type:', emailType);
        console.log('Personal email content length:', personalEmail?.length);
        
        // Send email notification
        if (emailType === 'personal' && personalEmail) {
          console.log('Sending personal email...');
          try {
            await sendOpportunityEmail(
              opportunity.student_email,
              `${opportunity.title} Opportunity Has Been Found Valid`,
              personalEmail,
              opportunity.title,
              opportunity.student_name,
              'accepted'
            );
            console.log('Personal accept email sent successfully');
            setEmailSent(true);
            setPersonalEmail(''); // Clear the email content
          } catch (error) {
            console.error('Error sending personal accept email:', error);
            // Still mark as sent to not block the UI
            setEmailSent(true);
          }
        } else if (emailType === 'template') {
          // For template email, send using new server action
          try {
            await sendOpportunityAcceptedEmailServer(
              opportunity.student_email,
              opportunity.title,
              opportunity.student_name
            );
            console.log('Template accept email sent successfully');
            setEmailSent(true);
          } catch (error) {
            console.error('Error sending template accept email:', error);
            // Still mark as sent to not block the UI
            setEmailSent(true);
          }
        } else {
          console.log('Skipping email send - type:', emailType, 'content length:', personalEmail?.length);
        }
        
        console.log('Updating opportunity status to accepted...');
        const result = await changeOpportunityStatus(opportunity.id, 'accepted');
        
        if (result.success) {
          console.log('Opportunity status updated successfully');
          setOpportunities(prevOpps => 
            prevOpps.map(opp => 
              opp.id === opportunity.id 
                ? { ...opp, status: 'accepted', accepted_at: new Date().toISOString() }
                : opp
            )
          );
          console.log('Opportunity accepted:', opportunity.id);
          
          // Show the add to opportunities question immediately
          setShowAddToOpportunities(true);
          
          return { success: true };
        } else {
          throw new Error(result.message || 'Failed to accept opportunity');
        }
      } catch (error) {
        console.error('Error accepting opportunity:', error);
        throw error;
      }
    })();

    showToastPromise({
      promise,
      loadingText: "Accepting opportunity and sending email...",
      successText: "You’ve successfully marked this opportunity as valid.",
      errorText: "Failed to accept opportunity. Please try again.",
      successHeaderText: "Opportunity Accepted Successfully!",
      errorHeaderText: "Acceptance Failed",
      direction: 'right'
    });
    
    // Keep the spinner active until the promise resolves
    promise.finally(() => {
      setAcceptingOpportunity(false);
    });
  };

  const handleDenyClick = (opportunity: Opportunity) => {
    setSelectedOpportunityForDeny(opportunity);
    setShowDenyModal(true);
    setDenyReason('');
    setDenyEmailType('template');
    setDenyPersonalEmail('');
    setDenyEmailSent(false);
    setSendingDenyEmail(false);
  };

  const handleDeny = async (opportunity: Opportunity) => {
    setDenyingOpportunity(true);
    
    const promise = (async () => {
      try {
        console.log('Denying opportunity:', opportunity.id, 'with reason:', denyReason);
        
        const result = await (changeOpportunityStatus as any)(opportunity.id, 'denied', denyReason);
        
        if (result.success) {
          // Update local state to move opportunity to denied section
          setOpportunities(prevOpps => 
            prevOpps.map(opp => 
              opp.id === opportunity.id 
                ? { ...opp, status: 'denied', reason: denyReason, accepted_at: new Date().toISOString() }
                : opp
            )
          );
          
          // Send email notification
          if (denyEmailType === 'personal' && denyPersonalEmail.trim()) {
            setSendingDenyEmail(true);
            try {
              await sendOpportunityEmail(
                opportunity.student_email,
                `${opportunity.title} Opportunity Update`,
                denyPersonalEmail,
                opportunity.title,
                opportunity.student_name,
                'denied'
              );
              console.log('Personal deny email sent successfully');
              setDenyEmailSent(true);
              setDenyPersonalEmail('');
            } catch (error) {
              console.error('Error sending personal deny email:', error);
              // Still mark as sent to not block the UI
              setDenyEmailSent(true);
            } finally {
              setSendingDenyEmail(false);
            }
          } else if (denyEmailType === 'template') {
            // For template email, send using new server action
            try {
              await sendOpportunityDeniedEmailServer(
                opportunity.student_email,
                opportunity.title,
                denyReason,
                opportunity.student_name
              );
              console.log('Template deny email sent successfully');
              setDenyEmailSent(true);
            } catch (error) {
              console.error('Error sending template deny email:', error);
              // Still mark as sent to not block the UI
              setDenyEmailSent(true);
            }
          }

          // Close modal immediately after successful denial
          setShowDenyModal(false);
          setSelectedOpportunityForDeny(null);
          setDenyReason('');
          setDenyEmailType('template');
          setDenyPersonalEmail('');
          setDenyEmailSent(false);
          setSendingDenyEmail(false);
          
          console.log('Opportunity denied:', opportunity.id);
          
          return { success: true };
        } else {
          throw new Error(result.message || 'Failed to deny opportunity');
        }
      } catch (error) {
        console.error('Error denying opportunity:', error);
        throw error;
      }
    })();
    
    showToastPromise({
      promise,
      loadingText: "Denying opportunity and sending email...",
      successText: "You’ve marked this opportunity as invalid.",
      errorText: "Failed to deny opportunity. Please try again.",
      successHeaderText: "Opportunity Denied!",
      errorHeaderText: "Denial Failed",
      direction: 'right'
    });
    
    // Keep the spinner active until the promise resolves
    promise.finally(() => {
      setDenyingOpportunity(false);
    });
  };

  const handleReferPop = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowReferModal(true);
  };

  const handleReferToMember = async (memberId: string) => {
    if (!selectedOpportunity) return;
    
    setLoadingRefer(selectedOpportunity.id);
    
    // Create a promise for the referral process
    const referralPromise = new Promise(async (resolve, reject) => {
      try {
        console.log('Referring opportunity:', selectedOpportunity.id, 'to member:', memberId);
        
        const response = await deferOpportunityTo(selectedOpportunity.id, adminId, memberId);
        const referResponse = await changeOpportunityReferStatus(selectedOpportunity.id);
        
        if(response.success && referResponse.success){
          setShowReferModal(false);
          setSelectedMemberId(null);
          
          // Small delay before reload to show success message
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          
          resolve('Success');
        } else {
          console.error('Error deferring opportunity:', response.message);
          console.error('Error changing refer status:', referResponse.message);
          reject(new Error('Failed to refer opportunity'));
        }
      } catch (error) {
        console.error('Error in handleRefer:', error);
        reject(error);
      } finally {
        setLoadingRefer(null);
      }
    });
    
    // Show promise toast for referral process
    showToastPromise({
      promise: referralPromise,
      loadingText: 'Referring opportunity...',
      successText: 'Opportunity referred successfully!',
      errorText: 'Failed to refer opportunity',
      direction: 'right'
    });
  };

  const handleReferView = async (referral: Referral) => {
    setLoadingView(referral.id);
    
    // Create a promise for the view process
    const viewPromise = new Promise((resolve, reject) => {
      try {
        const opportunityLink = referral.opportunityLink;
        
        if (opportunityLink) {
          window.open(opportunityLink, '_blank', 'noopener,noreferrer');
          resolve('Success');
        } else {
          console.error('No opportunity link found');
          reject(new Error('No opportunity link found'));
        }
      } catch (error) {
        console.error('Error viewing opportunity:', error);
        reject(error);
      } finally {
        setLoadingView(null);
      }
    });
    
    // Show promise toast for referral view process
    showToastPromise({
      promise: viewPromise,
      loadingText: 'Opening opportunity...',
      successText: 'Opportunity opened successfully!',
      errorText: 'Failed to open opportunity',
      direction: 'right'
    });
  };

  const handleMarkReferralDone = async (referral_id: string) => {
    console.log('🔍 Starting mark referral as done process...');
    console.log('🔍 Referral ID:', referral_id);
    console.log('🔍 Current referrals state:', referrals);
    
    setLoadingMarkDone(referral_id);
    try{
      console.log('🔍 Calling markOpportunityReferralCompleted action...');
      const response = await markOpportunityReferralCompleted(referral_id);
      console.log('🔍 Mark referral response:', response);
      
      if(response.success){
        console.log('🔍 Action successful, updating local state...');
        // Update the referral status in the local state directly
        setReferrals(prevReferrals => {
          console.log('🔍 Previous referrals state:', prevReferrals);
          const updatedReferrals = prevReferrals.map(referral => 
            referral.id === referral_id 
              ? { ...referral, has_completed: true, status: 'accepted' as const } as Referral
              : referral
          );
          console.log('🔍 Updated referrals state:', updatedReferrals);
          return updatedReferrals;
        });
        console.log('🔍 Successfully updated referral status locally');
      } else {
        console.error('❌ Opportunity referral completion failed:', response.message);
      }
    }catch(error){
      console.error('❌ Error completing opportunity referral:', error);
    }finally{
      console.log('🔍 Clearing loading state for referral:', referral_id);
      setLoadingMarkDone(null);
    }
  };

  const handleAcceptDenyClick = (referral: Referral, type: 'accept' | 'deny') => {
    setSelectedReferralForAction(referral);
    setActionType(type);
    setReason('');
    setReferralEmailType('template');
    setReferralPersonalEmail('');
    setReferralEmailSent(false);
    setSendingReferralEmail(false);
    setShowAcceptDenyModal(true);
  };

  const handleAcceptDenySubmit = async () => {
    
    if (!selectedReferralForAction) return;
    if (actionType === 'deny' && !reason.trim()) return;
    
    const loadingState = actionType === 'accept' ? setLoadingAccept : setLoadingDeny;
    
    loadingState(selectedReferralForAction.id);
    try {
      console.log('🔍 Submitting accept/deny action:', { actionType, reason });
      let response;
      if (actionType === 'accept') {
        response = await acceptOpportunityReferral(selectedReferralForAction.id, null);
      } else {
        response = await denyOpportunityReferral(selectedReferralForAction.id, reason);
      }
      console.log('🔍 Accept/deny response:', response);
      
      if (response.success) {
        console.log('🔍 Action successful, updating local state...');
        setReferrals(prevReferrals => {
          const updatedReferrals = prevReferrals.map(referral => 
            referral.id === selectedReferralForAction.id 
              ? { ...referral, status: actionType === 'accept' ? 'accepted' : 'denied', accepted_at: new Date().toISOString() }
              : referral
          );
          console.log('🔍 Updated referrals state:', updatedReferrals);
          return updatedReferrals as Referral[];
        });

        // Send email notification
        if (referralEmailType === 'personal' && referralPersonalEmail.trim()) {
          setSendingReferralEmail(true);
          try {
            const emailSubject = actionType === 'accept' 
              ? `${selectedReferralForAction.opportunityTitle} Opportunity Has Been Found Valid`
              : `${selectedReferralForAction.opportunityTitle} Opportunity Update`;
            
            await sendOpportunityEmail(
              selectedReferralForAction.studentEmail || '',
              emailSubject,
              referralPersonalEmail,
              selectedReferralForAction.opportunityTitle,
              selectedReferralForAction.studentName || '',
              actionType
            );
            console.log('Personal referral email sent successfully');
            setReferralEmailSent(true);
            setReferralPersonalEmail('');
          } catch (error) {
            console.error('❌ Error sending personal referral email:', error);
            // Still mark as sent to not block the UI
            setReferralEmailSent(true);
          } finally {
            setSendingReferralEmail(false);
          }
        } else if (referralEmailType === 'template') {
          // For template email, send using new server action
          try {
            if (actionType === 'accept') {
              await sendOpportunityAcceptedEmailServer(
                selectedReferralForAction.studentEmail || '',
                selectedReferralForAction.opportunityTitle,
                selectedReferralForAction.studentName || ''
              );
            } else {
              await sendOpportunityDeniedEmailServer(
                selectedReferralForAction.studentEmail || '',
                selectedReferralForAction.opportunityTitle,
                reason,
                selectedReferralForAction.studentName || ''
              );
            }
            console.log('Template referral email sent successfully');
            setReferralEmailSent(true);
          } catch (error) {
            console.error('Error sending template referral email:', error);
            // Still mark as sent to not block the UI
            setReferralEmailSent(true);
          }
        }

        // Close modal immediately after successful action
        setShowAcceptDenyModal(false);
        setSelectedReferralForAction(null);
        setReason('');
        setReferralEmailType('template');
        setReferralPersonalEmail('');
        setReferralEmailSent(false);
        setSendingReferralEmail(false);
      } else {
        console.error('❌ Accept/deny action failed');
      }
    } catch (error) {
      console.error('❌ Error in accept/deny action:', error);
    } finally {
      loadingState(null);
    }
  };

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
      } else {
        return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
      }
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getSubmissionTimeColor = (dateValue: any) => {
    if (!dateValue) return 'bg-gray-200 text-gray-800 border-gray-300';
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return 'bg-gray-200 text-gray-800 border-gray-300';
      }
      
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInDays >= 1 && diffInDays <= 3) {
        return 'bg-green-50 text-green-800 border-green-300';
      } else if (diffInDays >= 4 && diffInDays <= 7) {
        return 'bg-yellow-50 text-yellow-800 border-yellow-300';
      } else if (diffInDays > 7) {
        return 'bg-red-50 text-red-800 border-red-300';
      } else {
        return 'bg-green-200 text-green-800 border-green-300';
      }
    } catch (error) {
      return 'bg-gray-200 text-gray-800 border-gray-300';
    }
  };

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

  // Handle body scroll when modals open/close
  useEffect(() => {
    if (showAcceptModal || showReferModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showAcceptModal, showReferModal]);

  useEffect(() => {
    const fetchOpportunities = async () => {
      if (!adminId) {
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/opportunity-requests?admin_id=${adminId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched opportunities:', data);
          console.log('AI categories found:', data.map((opp: any) => ({ id: opp.id, ai_category: opp.ai_category })));
          setOpportunities(data);
        } else {
          console.error('Failed to fetch opportunities');
        }
      } catch (error) {
        console.error('Error fetching opportunities:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOpportunities();
  }, [adminId]);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await fetch('/api/fellows');
        if (response.ok) {
          const data = await response.json();
          setAdmins(data);
        } else {
          console.error('Failed to fetch admins');
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
      }
    };
    fetchAdmins();
  }, []);

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!adminId) {
        return;
      }
      
      try {
        const response = await fetch(`/api/opportunity-referrals?admin_id=${adminId}&type=all`);
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
          <h1 className="text-4xl font-bold font-cal-sans text-gray-800 mb-3">Opportunity Tracker</h1>
          <p className="text-md text-gray-600">
            Review and manage student-submitted opportunities
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

        {/* Done Sub-tabs */}
        {activeTab === 'done' && (
          <div className="border-b border-dashboard-border">
            <ToggleGroup
              type="single"
              value={doneSubTab}
              onValueChange={(value) => value && setDoneSubTab(value as any)}
              className="justify-start"
            >
              <ToggleGroupItem value="accepted" className="data-[state=on]:bg-dashboard-primary data-[state=on]:text-dashboard-primary-foreground">
                <CheckCircle className="h-4 w-4 mr-2" />
                {`Accepted (${opportunities.filter(opp => opp.status === 'accepted').length})`}
              </ToggleGroupItem>
              <ToggleGroupItem value="denied" className="data-[state=on]:bg-dashboard-primary data-[state=on]:text-dashboard-primary-foreground">
                <XCircle className="h-4 w-4 mr-2" />
                {`Denied (${opportunities.filter(opp => opp.status === 'denied').length})`}
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
                {filteredReferrals.map((referral) => {
                  const isCompletedReceived = (referral.has_completed || (!referral.has_completed && (referral.opportunityStatus === 'accepted' || referral.opportunityStatus === 'denied'))) && referral.type === 'received';
                  const isCompletedSent = (referral.has_completed || (!referral.has_completed && (referral.opportunityStatus === 'accepted' || referral.opportunityStatus === 'denied'))) && referral.type === 'sent';
                  
                  return (
                    <Card key={referral.id} className={`border border-dashboard-border bg-dashboard-card ${
                      isCompletedReceived || isCompletedSent ? 'opacity-60' : ''
                    }`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className={`text-lg text-dashboard-foreground ${
                              isCompletedReceived || isCompletedSent ? 'line-through' : ''
                            }`}>{referral.opportunityTitle}</CardTitle>
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
                          <Badge className={
                            (referral.type === 'sent' || referral.type === 'received') && (referral.opportunityStatus === 'accepted' || referral.opportunityStatus === 'denied')
                              ? getStatusColor(referral.opportunityStatus as 'accepted' | 'denied')
                              : getReferralStatusColor(referral.status)
                          }>
                            {(referral.type === 'sent' || referral.type === 'received') && (referral.opportunityStatus === 'accepted' || referral.opportunityStatus === 'denied')
                              ? (referral.opportunityStatus === 'accepted' ? 'Accepted' : 'Denied')
                              : referral.status.charAt(0).toUpperCase() + referral.status.slice(1)
                            }
                          </Badge>
                          {referral.type === 'sent' && referral.status === 'denied' && referral.opportunityReason && (
                            <div className="text-xs text-red-600 mt-1 max-w-48 text-right">
                              Reason: {referral.opportunityReason}
                            </div>
                          )}
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
                          <span>Submitted: {getRelativeTime(referral.submittedAt)}</span>
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
                        disabled={!referral.opportunityLink || loadingView === referral.id}
                      >
                        {loadingView === referral.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "View Opportunity"
                        )}
                      </Button>
                      {referral.type === 'sent' && !referral.has_completed && (referral.opportunityStatus === 'accepted' || referral.opportunityStatus === 'denied') && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-md">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-800 font-medium">Opportunity has already been reviewed</span>
                        </div>
                      )}
                      {referral.type === 'received' && referral.status === 'pending' && (
                        <>
                          {!referral.has_completed && (referral.opportunityStatus === 'accepted' || referral.opportunityStatus === 'denied') ? (
                            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-md">
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm text-yellow-800 font-medium">Opportunity has already been reviewed</span>
                            </div>
                          ) : (
                            <>
                              <Button 
                                variant="default" 
                                size="sm"
                                className=" text-white px-8 bg-green-600 hover:bg-green-700 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200"
                                onClick={() => handleAcceptDenyClick(referral, 'accept')}
                                disabled={loadingAccept === referral.id}
                              >
                                {loadingAccept === referral.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Accept"
                                )}
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                className=" text-white px-8 bg-red-600 hover:bg-red-700 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(220,38,38,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(220,38,38,0.1)] transition duration-200"
                                onClick={() => handleAcceptDenyClick(referral, 'deny')}
                                disabled={loadingDeny === referral.id}
                              >
                                {loadingDeny === referral.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Deny"
                                )}
                              </Button>
                            </>
                          )}
                        </>
                      )}

                    </CardFooter>
                  </Card>
                );
              })}
              {filteredReferrals.length === 0 && (
                  <Card className="p-8 text-center bg-dashboard-card">
                    <p className="text-dashboard-muted-foreground">
                      No {referralSubTab} referrals found.
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
                {filteredOpportunities.map((opportunity) => {
                  const isAlreadyReviewed = activeTab === 'pending' && opportunity.referred && (opportunity.status === 'accepted' || opportunity.status === 'denied');
                  
                  return (
                    <Card key={opportunity.id} className={`border border-dashboard-border bg-dashboard-card ${
                      isAlreadyReviewed ? 'opacity-60' : ''
                    }`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className={`text-lg text-dashboard-foreground ${
                              isAlreadyReviewed ? 'line-through' : ''
                            }`}>{opportunity.title}</CardTitle>
                          </div>
                          <div className={`flex items-center gap-4 text-sm text-dashboard-muted-foreground ${
                            isAlreadyReviewed ? 'line-through' : ''
                          }`}>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {opportunity.student_name}
                            </div>
                            {opportunity.student_grade && (
                              <Badge className={getGradeColor(opportunity.student_grade)}>
                                {opportunity.student_grade}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge className={activeTab === 'requests' || activeTab === 'pending' ? 
                          getAICategoryColor(opportunity.ai_category || '') : 
                          getStatusColor(opportunity.status)}>
                          {activeTab === 'requests' || activeTab === 'pending' ? 
                           (() => {
                             console.log(`Opportunity ${opportunity.id} AI category:`, opportunity.ai_category);
                             return opportunity.ai_category || 'No Category';
                           })() : 
                           (opportunity.status === 'pending' ? 'New Request' : 
                           opportunity.status === 'in_review' ? 'In Review' : 
                           opportunity.status === 'accepted' ? 'Accepted' : 
                           opportunity.status === 'denied' ? 'Denied' : opportunity.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className={`grid ${activeTab === 'done' ? 'grid-cols-3' : 'grid-cols-2'} gap-4 text-sm ${
                        isAlreadyReviewed ? 'line-through' : ''
                      }`}>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-dashboard-muted-foreground" />
                          <span>Submitted: {getRelativeTime(opportunity.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-dashboard-muted-foreground" />
                          <span>Deadline: {opportunity.deadline ? format(new Date(opportunity.deadline), 'MMM dd, yyyy') : 'Not specified'}</span>
                        </div>
                        {activeTab === 'done' && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-dashboard-muted-foreground" />
                            <span>
                              {doneSubTab === 'accepted' ? 'Accepted' : 'Denied'}: {
                                opportunity.accepted_at 
                                  ? getRelativeTime(opportunity.accepted_at)
                                  : 'Date not recorded'
                              }
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Referral Information */}
                      {(activeTab === 'done' || activeTab === 'pending') && opportunity.referred && opportunity.referral_info && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Send className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Referral Information:</span>
                          </div>
                          <div className="space-y-1 text-sm text-blue-700">
                            <div>Referred by: {opportunity.referral_info.referred_by}</div>
                            <div>Referred to: {opportunity.referral_info.referred_to}</div>
                            <div>Referred at: {opportunity.referral_info.referred_at ? format(new Date(opportunity.referral_info.referred_at), 'MMM dd, yyyy') : 'Not specified'}</div>
                          </div>
                        </div>
                      )}
                      
                      {activeTab === 'done' && doneSubTab === 'denied' && opportunity.reason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium text-red-800">Denial Reason:</span>
                          </div>
                          <p className="text-sm text-red-700">{opportunity.reason}</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="gap-2">
                      {activeTab === 'requests' && (
                        <>
                          <Button 
                            onClick={() => handleView(opportunity)} 
                            size="sm" 
                            className="bg-green-600 text-white hover:bg-green-700 px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200"
                            disabled={loadingView === opportunity.id}
                          >
                            {loadingView === opportunity.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "View Opportunity"
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleReferPop(opportunity)} 
                            size="sm" 
                            className="px-8"
                            disabled={loadingRefer === opportunity.id}
                          >
                            {loadingRefer === opportunity.id ? (
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
                            onClick={() => handleViewPending(opportunity)} 
                            size="sm" 
                            className="bg-orange-500 text-white hover:bg-orange-600 px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(255,165,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(255,165,0,0.1)] transition duration-200"
                            disabled={loadingView === opportunity.id}
                          >
                            {loadingView === opportunity.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "View Opportunity"
                            )}
                          </Button>
                          {opportunity.referred && (opportunity.status === 'accepted' || opportunity.status === 'denied') ? (
                            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-md">
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm text-yellow-800 font-medium">Opportunity has already been reviewed</span>
                            </div>
                          ) : (
                            <>
                              <Button 
                                onClick={() => handleAcceptClick(opportunity)} 
                                size="sm"
                                className="bg-green-600 text-white hover:bg-green-700 px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200"
                                disabled={loadingAccept === opportunity.id}
                              >
                                {loadingAccept === opportunity.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Accept
                                  </>
                                )}
                              </Button>
                              <Button 
                                onClick={() => handleDenyClick(opportunity)} 
                                size="sm"
                                className="bg-red-600 text-white hover:bg-red-700 px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(220,38,38,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(220,38,38,0.1)] transition duration-200"
                                disabled={denyingOpportunity}
                              >
                                {denyingOpportunity ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Deny
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="outline" 
                            onClick={() => handleReferPop(opportunity)} 
                            size="sm"
                            className="px-8"
                            disabled={loadingRefer === opportunity.id}
                          >
                            {loadingRefer === opportunity.id ? (
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
                            onClick={() => handleView(opportunity)} 
                            size="sm" 
                            className="bg-green-600 text-white hover:bg-green-700 px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200"
                            disabled={loadingView === opportunity.id}
                          >
                            {loadingView === opportunity.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "View Opportunity"
                            )}
                          </Button>
                        </>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
                {filteredOpportunities.length === 0 && !isLoading && (
                  <Card className="p-8 text-center bg-dashboard-card">
                    <p className="text-dashboard-muted-foreground">
                      No opportunities found.
                    </p>
                  </Card>
                )}
              </div>
            )}
          </>
        )}

        {/* Accept Modal */}
        <Dialog open={showAcceptModal} onOpenChange={setShowAcceptModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Accept Opportunity
              </DialogTitle>
              <DialogDescription className="text-base">
                Choose how to notify the student about the acceptance:
              </DialogDescription>
              {selectedOpportunityForAccept && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="font-semibold text-gray-900">{selectedOpportunityForAccept.title}</div>
                  <div className="text-sm text-gray-600">by {selectedOpportunityForAccept.student_name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Submitted: {format(new Date(selectedOpportunityForAccept.created_at), 'MMM dd, yyyy')}
                  </div>
                </div>
              )}
            </DialogHeader>
            
            {!showAddToOpportunities && !emailSent ? (
              <>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="template-email"
                        name="email-type"
                        value="template"
                        checked={emailType === 'template'}
                        onChange={(e) => setEmailType(e.target.value as 'template' | 'personal')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor="template-email" className="text-sm font-medium text-gray-700">
                        Use template email
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="personal-email"
                        name="email-type"
                        value="personal"
                        checked={emailType === 'personal'}
                        onChange={(e) => setEmailType(e.target.value as 'template' | 'personal')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor="personal-email" className="text-sm font-medium text-gray-700">
                        Write personal email
                      </label>
                    </div>
                  </div>
                  
                  {emailType === 'personal' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Personal Email Content:
                      </label>
                      <div data-color-mode="light">
                        <MDEditor 
                          value={personalEmail} 
                          onChange={(value) => setPersonalEmail(value || "")}
                          preview="live"
                          height={200}
                          textareaProps={{
                            placeholder: "Write your personal email message here...",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <DialogFooter className="gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAcceptModal(false);
                      setSelectedOpportunityForAccept(null);
                      setEmailType('template');
                      setPersonalEmail('');
                      document.body.style.overflow = '';
                    }}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => selectedOpportunityForAccept && handleAccept(selectedOpportunityForAccept)}
                    disabled={!selectedOpportunityForAccept || acceptingOpportunity}
                    className="bg-green-600 text-white hover:bg-green-700 px-6 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200"
                  >
                    {acceptingOpportunity ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Opportunity Accepted!</h3>
                  <p className="text-gray-600 mb-6">
                    Do you want to add this to the new opportunities page?
                  </p>
                </div>
                <DialogFooter className="gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAcceptModal(false);
                      setSelectedOpportunityForAccept(null);
                      setEmailType('template');
                      setPersonalEmail('');
                      setShowAddToOpportunities(false);
                      setEmailSent(false);
                    }}
                    className="px-6"
                  >
                    No, Close
                  </Button>
                  <Button 
                    onClick={() => {
                      // TODO: Add logic to add to new opportunities page
                      console.log('Adding to new opportunities page:', selectedOpportunityForAccept?.id);
                      setShowAcceptModal(false);
                      setSelectedOpportunityForAccept(null);
                      setEmailType('template');
                      setPersonalEmail('');
                      setShowAddToOpportunities(false);
                      setEmailSent(false);  
                      router.push('/dashboard/admin/content-management');
                    }}
                    className="bg-green-600 text-white hover:bg-green-700 px-6 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200"
                  >
                    Add Resource
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Refer Modal */}
        <Dialog open={showReferModal} onOpenChange={setShowReferModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Refer Opportunity
              </DialogTitle>
              <DialogDescription className="text-base">
                Choose a team member to refer this opportunity to:
              </DialogDescription>
              {selectedOpportunity && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="font-semibold text-gray-900">{selectedOpportunity.title}</div>
                  <div className="text-sm text-gray-600">by {selectedOpportunity.student_name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Submitted: {format(new Date(selectedOpportunity.created_at), 'MMM dd, yyyy')}
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
                      disabled={loadingRefer === selectedOpportunity?.id}
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
                onClick={() => selectedMemberId && selectedOpportunity?.id && handleReferToMember(selectedMemberId)}
                disabled={!selectedMemberId || loadingRefer === selectedOpportunity?.id}
                className="bg-green-600 text-white hover:bg-green-700 px-6 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200"
              >
                {loadingRefer === selectedOpportunity?.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Refer"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Accept/Deny Modal */}
        <Dialog open={showAcceptDenyModal} onOpenChange={setShowAcceptDenyModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {actionType === 'accept' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                {actionType === 'accept' ? 'Accept' : 'Deny'} Opportunity Referral
              </DialogTitle>
              <DialogDescription className="text-base">
                {actionType === 'accept' 
                  ? 'Please provide a reason for accepting this opportunity referral:'
                  : 'Please provide a reason for denying this opportunity referral:'
                }
              </DialogDescription>
              {selectedReferralForAction && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="font-semibold text-gray-900">{selectedReferralForAction.opportunityTitle}</div>
                  <div className="text-sm text-gray-600">by {selectedReferralForAction.studentName}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Referred by: {selectedReferralForAction.referredBy}
                  </div>
                </div>
              )}
            </DialogHeader>
            
            {!referralEmailSent ? (
              <>
                <div className="space-y-4">
                  {actionType === 'deny' && (
                    <div>
                      <Label htmlFor="reason">Reason for Denial</Label>
                      <Textarea
                        id="reason"
                        placeholder="Enter your reason for denying this referral..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="mt-2"
                        rows={4}
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Email Notification:
                    </Label>
                    <div className="mt-2 space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="template-email"
                          name="emailType"
                          value="template"
                          checked={referralEmailType === 'template'}
                          onChange={(e) => setReferralEmailType(e.target.value as 'template' | 'personal')}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <Label htmlFor="template-email" className="text-sm text-gray-700">
                          Send template email
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="personal-email"
                          name="emailType"
                          value="personal"
                          checked={referralEmailType === 'personal'}
                          onChange={(e) => setReferralEmailType(e.target.value as 'template' | 'personal')}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <Label htmlFor="personal-email" className="text-sm text-gray-700">
                          Write personal email
                        </Label>
                      </div>
                    </div>
                  </div>

                  {referralEmailType === 'personal' && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Personal Email Content:
                      </Label>
                      <div data-color-mode="light">
                        <MDEditor
                          value={referralPersonalEmail}
                          onChange={(value) => setReferralPersonalEmail(value || "")}
                          preview="live"
                          height={200}
                          textareaProps={{
                            placeholder: "Write your personal email message here...",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <DialogFooter className="gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAcceptDenyModal(false);
                      setSelectedReferralForAction(null);
                      setReason('');
                      setReferralEmailType('template');
                      setReferralPersonalEmail('');
                      setReferralEmailSent(false);
                      setSendingReferralEmail(false);
                    }}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAcceptDenySubmit}
                    disabled={
                      (actionType === 'deny' && !reason.trim()) || 
                      (referralEmailType === 'personal' && !referralPersonalEmail.trim()) ||
                      (actionType === 'accept' ? loadingAccept === selectedReferralForAction?.id : loadingDeny === selectedReferralForAction?.id) ||
                      sendingReferralEmail
                    }
                    className={`px-6 text-white ${
                      actionType === 'accept' 
                        ? 'bg-green-600 hover:bg-green-700 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)]'
                        : 'bg-red-600 hover:bg-red-700 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(220,38,38,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(220,38,38,0.1)]'
                    } transition duration-200`}
                  >
                    {(actionType === 'accept' ? loadingAccept : loadingDeny) === selectedReferralForAction?.id || sendingReferralEmail ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      actionType === 'accept' ? 'Accept' : 'Deny'
                    )}
                  </Button>
                </DialogFooter>
              </>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Deny Modal */}
        <Dialog open={showDenyModal} onOpenChange={setShowDenyModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Deny Opportunity
              </DialogTitle>
              <DialogDescription className="text-base">
                Please provide a reason for denying this opportunity:
              </DialogDescription>
              {selectedOpportunityForDeny && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="font-semibold text-gray-900">{selectedOpportunityForDeny.title}</div>
                  <div className="text-sm text-gray-600">by {selectedOpportunityForDeny.student_name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Submitted: {format(new Date(selectedOpportunityForDeny.created_at), 'MMM dd, yyyy')}
                  </div>
                </div>
              )}
            </DialogHeader>
            
            {!denyEmailSent ? (
              <>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="deny-reason">Reason for Denial</Label>
                    <Textarea
                      id="deny-reason"
                      placeholder="Enter your reason for denying this opportunity..."
                      value={denyReason}
                      onChange={(e) => setDenyReason(e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Email Notification:
                    </Label>
                    <div className="mt-2 space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="deny-template-email"
                          name="denyEmailType"
                          value="template"
                          checked={denyEmailType === 'template'}
                          onChange={(e) => setDenyEmailType(e.target.value as 'template' | 'personal')}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        />
                        <Label htmlFor="deny-template-email" className="text-sm text-gray-700">
                          Send template email
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="deny-personal-email"
                          name="denyEmailType"
                          value="personal"
                          checked={denyEmailType === 'personal'}
                          onChange={(e) => setDenyEmailType(e.target.value as 'template' | 'personal')}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        />
                        <Label htmlFor="deny-personal-email" className="text-sm text-gray-700">
                          Write personal email
                        </Label>
                      </div>
                    </div>
                  </div>

                  {denyEmailType === 'personal' && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Personal Email Content:
                      </Label>
                      <div data-color-mode="light">
                        <MDEditor
                          value={denyPersonalEmail}
                          onChange={(value) => setDenyPersonalEmail(value || "")}
                          preview="live"
                          height={200}
                          textareaProps={{
                            placeholder: "Write your personal email message here...",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <DialogFooter className="gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowDenyModal(false);
                      setSelectedOpportunityForDeny(null);
                      setDenyReason('');
                      setDenyEmailType('template');
                      setDenyPersonalEmail('');
                      setDenyEmailSent(false);
                      setSendingDenyEmail(false);
                    }}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => selectedOpportunityForDeny && handleDeny(selectedOpportunityForDeny)}
                    disabled={
                      !denyReason.trim() || 
                      (denyEmailType === 'personal' && !denyPersonalEmail.trim()) ||
                      denyingOpportunity ||
                      sendingDenyEmail
                    }
                    className="bg-red-600 text-white hover:bg-red-700 px-6 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(220,38,38,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(220,38,38,0.1)] transition duration-200"
                  >
                    {denyingOpportunity || sendingDenyEmail ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Deny Opportunity"
                    )}
                  </Button>
                </DialogFooter>
              </>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}