"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Progress } from "../../../../components/ui/progress";

import { 
  FileText, 
  Briefcase, 
  Megaphone, 
  Users, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { format, startOfWeek, endOfWeek, isWithinInterval, subWeeks } from "date-fns";
import { useUserData } from "@/hooks/useUserData";

interface EssayRequest {
  id: string;
  title: string;
  student_name: string;
  created_at: string;
  status: string;
  grade: string;
}

interface Opportunity {
  id: string;
  title: string;
  deadline: string;
  posted_by: string;
  created_at: string;
  status: 'pending' | 'in_review' | 'accepted' | 'denied' | 'completed';
}

interface Assignment {
  id: string;
  title: string;
  submission_idate: string;
  workshop_crc_class: string;
  workshop_title: string;
  workshop_id?: string;
  crc_class_id?: string;
  crc_class_name?: string;
}

interface Announcement {
  id: string;
  message: string;
  created_at: string;
}

interface AttendanceRecord {
  id: number;
  workshop_title: string;
  class_name: string;
  present_count: number;
  total_count: number;
  date: string;
}

interface DashboardStats {
  essayRequestsThisWeek: number;
  essayRequestsLastWeek: number;
  opportunitiesAddedThisWeek: number;
  opportunitiesAddedLastWeek: number;
  newAnnouncements: number;
  newAnnouncementsLastWeek: number;
  attendanceTaken: number;
  attendanceTakenLastWeek: number;
  assignmentsThisWeek: number;
  assignmentsLastWeek: number;
}

export default function DashboardHome() {
  const router = useRouter();
  const { userId, adminId, isLoading, error } = useUserData();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<DashboardStats>({
    essayRequestsThisWeek: 0,
    essayRequestsLastWeek: 0,
    opportunitiesAddedThisWeek: 0,
    opportunitiesAddedLastWeek: 0,
    newAnnouncements: 0,
    newAnnouncementsLastWeek: 0,
    attendanceTaken: 0,
    attendanceTakenLastWeek: 0,
    assignmentsThisWeek: 0,
    assignmentsLastWeek: 0
  });
  const [essayRequests, setEssayRequests] = useState<EssayRequest[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attentionNeeded, setAttentionNeeded] = useState<string[]>([]);
  const [workshopsWithoutAttendance, setWorkshopsWithoutAttendance] = useState<any[]>([]);
  const [essaysNeedingAttention, setEssaysNeedingAttention] = useState<any[]>([]);
  const [opportunitiesNeedingAttention, setOpportunitiesNeedingAttention] = useState<any[]>([]);
  const [assignmentsNeedingAttention, setAssignmentsNeedingAttention] = useState<any[]>([]);
  const [attendanceByWorkshop, setAttendanceByWorkshop] = useState<any>({});
  const [adminName, setAdminName] = useState<string>('');

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!adminId) return;
      
      try {
        setLoading(true);
        
        // Calculate this week's and last week's date ranges
        const now = new Date();
        const startOfThisWeek = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        const endOfThisWeek = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
        const startOfLastWeek = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        const endOfLastWeek = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        
        // Load essay requests
        const essayResponse = await fetch(`/api/essay-requests?admin_id=${adminId}`);
        let essayData: any[] = [];
        if (essayResponse.ok) {
          essayData = await essayResponse.json();
          const thisWeekEssays = essayData.filter((essay: EssayRequest) => {
            const essayDate = new Date(essay.created_at);
            return isWithinInterval(essayDate, { start: startOfThisWeek, end: endOfThisWeek });
          });
          const lastWeekEssays = essayData.filter((essay: EssayRequest) => {
            const essayDate = new Date(essay.created_at);
            return isWithinInterval(essayDate, { start: startOfLastWeek, end: endOfLastWeek });
          });
          setEssayRequests(thisWeekEssays.slice(0, 5)); // Latest 5
          setStats(prev => ({ 
            ...prev, 
            essayRequestsThisWeek: thisWeekEssays.length,
            essayRequestsLastWeek: lastWeekEssays.length
          }));
        }

                // Load assignments
        const assignmentsResponse = await fetch('/api/admin/assignments/for-management');
        let allAssignments: any[] = [];
     
        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          allAssignments = assignmentsData.assignments || [];
          
          const thisWeekAssignments = allAssignments.filter((assignment: Assignment) => {
            const dueDate = new Date(assignment.submission_idate);
            return isWithinInterval(dueDate, { start: startOfThisWeek, end: endOfThisWeek });
          });
          const lastWeekAssignments = allAssignments.filter((assignment: Assignment) => {
            const dueDate = new Date(assignment.submission_idate);
            return isWithinInterval(dueDate, { start: startOfLastWeek, end: endOfLastWeek });
          });
          
          setAssignments(thisWeekAssignments.slice(0, 5)); // Latest 5
          setStats(prev => ({ 
            ...prev, 
            assignmentsThisWeek: thisWeekAssignments.length,
            assignmentsLastWeek: lastWeekAssignments.length
          }));
        }

        // Load announcements
        const announcementsResponse = await fetch('/api/announcements/fetch');
        if (announcementsResponse.ok) {
          const responseData = await announcementsResponse.json();
          const announcementsData = responseData.announcements || [];
          const thisWeekAnnouncements = announcementsData.filter((announcement: Announcement) => {
            const announcementDate = new Date(announcement.created_at);
            return isWithinInterval(announcementDate, { start: startOfThisWeek, end: endOfThisWeek });
          });
          const lastWeekAnnouncements = announcementsData.filter((announcement: Announcement) => {
            const announcementDate = new Date(announcement.created_at);
            return isWithinInterval(announcementDate, { start: startOfLastWeek, end: endOfLastWeek });
          });
          setStats(prev => ({ 
            ...prev, 
            newAnnouncements: thisWeekAnnouncements.length,
            newAnnouncementsLastWeek: lastWeekAnnouncements.length
          }));
        }

        // Load attendance records
        const attendanceResponse = await fetch('/api/attendance/record');
        if (attendanceResponse.ok) {
          const attendanceData = await attendanceResponse.json();
          const thisWeekAttendance = attendanceData.data?.filter((record: any) => {
            const recordDate = new Date(record.created_at);
            return isWithinInterval(recordDate, { start: startOfThisWeek, end: endOfThisWeek });
          }) || [];
          const lastWeekAttendance = attendanceData.data?.filter((record: any) => {
            const recordDate = new Date(record.created_at);
            return isWithinInterval(recordDate, { start: startOfLastWeek, end: endOfLastWeek });
          }) || [];
          
          // Group attendance by workshop
          const attendanceByWorkshop = thisWeekAttendance.reduce((acc: any, record: any) => {
            const key = `${record.session?.workshop?.title}-${record.session?.class?.name}`;
            if (!acc[key]) {
              acc[key] = {
                workshop_title: record.session?.workshop?.title || 'Unknown Workshop',
                class_name: record.session?.class?.name || 'Unknown Class',
                present_count: 0,
                total_count: 0,
                date: record.created_at
              };
            }
            acc[key].total_count++;
            if (record.status === 'present') {
              acc[key].present_count++;
            }
            return acc;
          }, {});
          
          setAttendanceRecords(Object.values(attendanceByWorkshop));
          setAttendanceByWorkshop(attendanceByWorkshop);
          setStats(prev => ({ 
            ...prev, 
            attendanceTaken: Object.keys(attendanceByWorkshop).length,
            attendanceTakenLastWeek: lastWeekAttendance.length > 0 ? 1 : 0 // Simplified for now
          }));

          // Load workshops to check for missing attendance
          const workshopsResponse = await fetch('/api/workshops/fetch');
          if (workshopsResponse.ok) {
            const workshopsData = await workshopsResponse.json();
            console.log('Workshops data:', workshopsData);
            const workshops = workshopsData.data || [];
       
            
            // Get workshop-class combinations that have attendance records
            const workshopsWithAttendance = new Set(
              Object.values(attendanceByWorkshop).map((record: any) => `${record.workshop_title}-${record.class_name}`)
            );
            
            // Find ALL workshops without attendance records for all their CRC classes
            const workshopsWithoutAttendance = workshops.filter((workshop: any) => {
              // Check if the workshop has CRC classes
              if (!workshop.crc_classes || workshop.crc_classes.length === 0) {
                return true; // Consider it missing attendance if no CRC classes
              }
              
              // Check if ALL CRC classes for this workshop have attendance records
              const missingAttendanceClasses = workshop.crc_classes.filter((crcClass: any) => {
                const workshopClassKey = `${workshop.title}-${crcClass.name}`;
                const hasAttendance = workshopsWithAttendance.has(workshopClassKey);
                return !hasAttendance;
              });
              
              const hasMissingAttendance = missingAttendanceClasses.length > 0;
              
              return hasMissingAttendance;
            });
            
           
            // Store workshops without attendance for attention needed
            setWorkshopsWithoutAttendance(workshopsWithoutAttendance);
          }
        }

        // Load opportunities
        const opportunitiesResponse = await fetch(`/api/opportunity-requests?admin_id=${adminId}`);
        let opportunitiesData: any[] = [];
        if (opportunitiesResponse.ok) {
          opportunitiesData = await opportunitiesResponse.json();
          const thisWeekOpportunities = opportunitiesData.filter((opportunity: Opportunity) => {
            const opportunityDate = new Date(opportunity.created_at);
            return isWithinInterval(opportunityDate, { start: startOfThisWeek, end: endOfThisWeek });
          });
          const lastWeekOpportunities = opportunitiesData.filter((opportunity: Opportunity) => {
            const opportunityDate = new Date(opportunity.created_at);
            return isWithinInterval(opportunityDate, { start: startOfLastWeek, end: endOfLastWeek });
          });
          setOpportunities(thisWeekOpportunities.slice(0, 5)); // Latest 5
          setStats(prev => ({ 
            ...prev, 
            opportunitiesAddedThisWeek: thisWeekOpportunities.length,
            opportunitiesAddedLastWeek: lastWeekOpportunities.length
          }));
        }

        // Generate attention needed items after all data is loaded
        
        // Check for essays submitted a week ago that are still pending
        let oldPendingEssays: any[] = [];
        if (essayData.length > 0) {
          const weekAgo = subWeeks(new Date(), 1);
          oldPendingEssays = essayData.filter(essay => {
            const essayDate = new Date(essay.created_at);
            return essay.status === 'pending' && essayDate < weekAgo;
          });
          setEssaysNeedingAttention(oldPendingEssays);
        }
        
        // Check for assignments due this week
        let dueThisWeek: any[] = [];
        if (allAssignments.length > 0) {
          dueThisWeek = allAssignments.filter(assignment => {
            const dueDate = new Date(assignment.submission_idate);
            return dueDate <= new Date();
          });
          setAssignmentsNeedingAttention(dueThisWeek);
        }
        
        // Check for opportunities submitted a week ago that are still pending
        let oldPendingOpportunities: any[] = [];
        if (opportunitiesData.length > 0) {
          const weekAgo = subWeeks(new Date(), 1);
          oldPendingOpportunities = opportunitiesData.filter(opportunity => {
            const opportunityDate = new Date(opportunity.created_at);
            return opportunity.status === 'pending' && opportunityDate < weekAgo;
          });
          setOpportunitiesNeedingAttention(oldPendingOpportunities);
        }



      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [adminId]);

  // Fetch admin name when adminId is available
  useEffect(() => {
    const fetchAdminName = async () => {
      if (!adminId) return;
      
      try {
        const response = await fetch(`/api/admin/profile?admin_id=${adminId}`);
        if (response.ok) {
          const adminData = await response.json();
          const fullName = [adminData.honorific, adminData.first_name, adminData.last_name]
            .filter(Boolean)
            .join(' ');
          console.log('Admin name:', fullName);
          console.log('Admin data:', adminData);
          setAdminName(fullName || 'Admin');
        } else {
          setAdminName('Admin');
        }
      } catch (error) {
        console.error('Error fetching admin name:', error);
        setAdminName('Admin');
      }
    };

    fetchAdminName();
  }, [adminId]);

  // Helper function to calculate trend
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 'up' : 'neutral';
    const change = current - previous;
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'neutral';
  };

  // Helper function to get trend text
  const getTrendText = (current: number, previous: number) => {
    const change = Math.abs(current - previous);
    if (previous === 0) return current > 0 ? `+${current} new` : 'No change';
    if (current === previous) return 'No change';
    return `${current > previous ? '+' : '-'}${change} from last week`;
  };

  const handleAssignmentClick = (assignment: Assignment) => {
    // Build URL with all available IDs for precise navigation
    const params = new URLSearchParams();
    params.set('assignmentId', assignment.id);
    
    if (assignment.workshop_title) {
      params.set('workshopId', assignment.workshop_title);
    }
    
    if (assignment.crc_class_name) {
      params.set('crcClassId', assignment.crc_class_name);
      // Also set subClassId to the numeric ID for compatibility
      if (assignment.crc_class_id) {
        params.set('subClassId', assignment.crc_class_id);
      }
    }
    
    console.log('🔍 Assignment click - Data:', {
      assignmentId: assignment.id,
      workshopId: assignment.workshop_title,
      crcClassId: assignment.crc_class_name,
      subClassId: assignment.crc_class_id,
      allParams: params.toString(),
      finalUrl: `/dashboard/admin/assignments-management?${params.toString()}`
    });
    
    router.push(`/dashboard/admin/assignments-management?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="text-3xl font-bold font-cal-sans text-gray-900 mb-1">
          Welcome back, <span className="font-cal-sans font-bold">{adminName || 'Admin'}</span> 👋
        </div>
        <p className="text-gray-600 text-md">
          Here&apos;s what&apos;s happening with your students this week
        </p>
      </div>

      {/* 🔝 Top Row → Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Assignments This Week */}
        <Card className="shadow-none border hover:shadow-sm transition-shadow ">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Assignments</p>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-900">{stats.assignmentsThisWeek}</p>
                    <p className="text-xs text-gray-500 mt-1">Due this week</p>
                  </>
                )}
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
            {loading ? (
              <div className="mt-4 flex items-center text-xs">
                <div className="h-3 w-3 bg-gray-200 rounded animate-pulse mr-1" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : (
              <div className="mt-4 flex items-center text-xs">
                {calculateTrend(stats.assignmentsThisWeek, stats.assignmentsLastWeek) === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : calculateTrend(stats.assignmentsThisWeek, stats.assignmentsLastWeek) === 'down' ? (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                ) : null}
                <span className={`font-medium ${
                  calculateTrend(stats.assignmentsThisWeek, stats.assignmentsLastWeek) === 'up' ? 'text-green-600' : 
                  calculateTrend(stats.assignmentsThisWeek, stats.assignmentsLastWeek) === 'down' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {getTrendText(stats.assignmentsThisWeek, stats.assignmentsLastWeek)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workshops This Week */}
        <Card className="shadow-none border hover:shadow-sm transition-shadow ">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Workshops</p>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-900">{stats.attendanceTaken}</p>
                    <p className="text-xs text-gray-500 mt-1">This week</p>
                  </>
                )}
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
            </div>
            {loading ? (
              <div className="mt-4 flex items-center text-xs">
                <div className="h-3 w-3 bg-gray-200 rounded animate-pulse mr-1" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : (
              <div className="mt-4 flex items-center text-xs">
                {calculateTrend(stats.attendanceTaken, stats.attendanceTakenLastWeek) === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : calculateTrend(stats.attendanceTaken, stats.attendanceTakenLastWeek) === 'down' ? (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                ) : null}
                <span className={`font-medium ${
                  calculateTrend(stats.attendanceTaken, stats.attendanceTakenLastWeek) === 'up' ? 'text-green-600' : 
                  calculateTrend(stats.attendanceTaken, stats.attendanceTakenLastWeek) === 'down' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {getTrendText(stats.attendanceTaken, stats.attendanceTakenLastWeek)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Essay Requests This Week */}
        <Card className="shadow-none border hover:shadow-sm transition-shadow ">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Essay Requests</p>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-900">{stats.essayRequestsThisWeek}</p>
                    <p className="text-xs text-gray-500 mt-1">This week</p>
                  </>
                )}
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
            </div>
            {loading ? (
              <div className="mt-4 flex items-center text-xs">
                <div className="h-3 w-3 bg-gray-200 rounded animate-pulse mr-1" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : (
              <div className="mt-4 flex items-center text-xs">
                {calculateTrend(stats.essayRequestsThisWeek, stats.essayRequestsLastWeek) === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : calculateTrend(stats.essayRequestsThisWeek, stats.essayRequestsLastWeek) === 'down' ? (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                ) : null}
                <span className={`font-medium ${
                  calculateTrend(stats.essayRequestsThisWeek, stats.essayRequestsLastWeek) === 'up' ? 'text-green-600' : 
                  calculateTrend(stats.essayRequestsThisWeek, stats.essayRequestsLastWeek) === 'down' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {getTrendText(stats.essayRequestsThisWeek, stats.essayRequestsLastWeek)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Opportunities Found */}
        <Card className="shadow-none border hover:shadow-sm transition-shadow ">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Opportunities</p>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-900">{stats.opportunitiesAddedThisWeek}</p>
                    <p className="text-xs text-gray-500 mt-1">Found this week</p>
                  </>
                )}
              </div>
              <div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                <Briefcase className="h-6 w-6" />
              </div>
            </div>
            {loading ? (
              <div className="mt-4 flex items-center text-xs">
                <div className="h-3 w-3 bg-gray-200 rounded animate-pulse mr-1" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : (
              <div className="mt-4 flex items-center text-xs">
                {calculateTrend(stats.opportunitiesAddedThisWeek, stats.opportunitiesAddedLastWeek) === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : calculateTrend(stats.opportunitiesAddedThisWeek, stats.opportunitiesAddedLastWeek) === 'down' ? (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                ) : null}
                <span className={`font-medium ${
                  calculateTrend(stats.opportunitiesAddedThisWeek, stats.opportunitiesAddedLastWeek) === 'up' ? 'text-green-600' : 
                  calculateTrend(stats.opportunitiesAddedThisWeek, stats.opportunitiesAddedLastWeek) === 'down' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {getTrendText(stats.opportunitiesAddedThisWeek, stats.opportunitiesAddedLastWeek)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 📊 Middle Row → Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Wide) - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
                    {/* Assignments Due This Week */}
          <Card className="shadow-none border hover:shadow-sm transition-all duration-200 h-[55vh]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Assignments Due This Week</CardTitle>
                    <p className="text-sm text-gray-500">Upcoming deadlines</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{assignments.length}</div>
                  <div className="text-xs text-gray-500">due</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[calc(52vh-80px)] overflow-y-auto pt-2">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : assignments.length > 0 ? (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div 
                      key={assignment.id} 
                      className="group relative p-4 border border-gray-200 rounded-xl hover:border-purple-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-transparent transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                      onClick={() => handleAssignmentClick(assignment)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleAssignmentClick(assignment);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`View assignment: ${assignment.title}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <h4 className="font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                              {assignment.title}
                            </h4>
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-gray-600 mb-1">
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {(() => {
                                const groupName = assignment.workshop_crc_class;
                                if (groupName?.includes('S4') || groupName?.includes('Senior 4')) {
                                  return 'Senior 4';
                                } else if (groupName?.includes('EY') || groupName?.includes('Enrichment Year')) {
                                  return 'Enrichment Year';
                                }
                                return groupName;
                              })()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Workshop: {assignment.workshop_title}
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-sm font-semibold text-red-600">
                              {format(new Date(assignment.submission_idate), "MMM dd")}
                            </div>
                            <div className="text-xs text-gray-500">Due Date</div>
                          </div>
                          <div className="mt-2 flex justify-end">
                            <ArrowRight className="h-4 w-4 text-purple-500 group-hover:text-purple-600 transition-all duration-200 group-hover:translate-x-1 group-hover:scale-110" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="relative">
                    <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <div className="absolute inset-0 bg-purple-100 rounded-full opacity-20 animate-pulse"></div>
                  </div>
                  <p className="text-lg font-medium text-gray-400 mb-2">No assignments due this week</p>
                  <p className="text-sm text-gray-400">All caught up! 🎉</p>
                </div>
              )}
            </CardContent>
          </Card>


        </div>

        {/* Right Column (Slim) - 1/3 */}
        <div className="space-y-6">
          {/* ⚠️ Attention Needed */}
          <Card className="shadow-none border hover:shadow-sm transition-all duration-200 h-[55vh]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Attention Needed</CardTitle>
                    <p className="text-sm text-gray-500">Items requiring action</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">
                    {essaysNeedingAttention.length + opportunitiesNeedingAttention.length + workshopsWithoutAttendance.length + assignmentsNeedingAttention.length}
                  </div>
                  <div className="text-xs text-gray-500">items</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[calc(50vh-80px)] overflow-y-auto pt-2">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="group relative p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-4 w-4 bg-red-200 rounded mr-3 flex-shrink-0 animate-pulse"></div>
                        <div className="h-4 w-32 bg-red-200 rounded animate-pulse"></div>
                      </div>
                      <div className="absolute top-2 right-2 w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (essaysNeedingAttention.length > 0 || opportunitiesNeedingAttention.length > 0 || workshopsWithoutAttendance.length > 0 || assignmentsNeedingAttention.length > 0) ? (
                <div className="space-y-3">
                  {/* Workshops missing attendance */}
                  {workshopsWithoutAttendance.map((workshop, index) => {
                    // Find which CRC classes are missing attendance
                    const missingClasses = workshop.crc_classes ? workshop.crc_classes.filter((crcClass: any) => {
                      const workshopClassKey = `${workshop.title}-${crcClass.name}`;
                      const hasAttendance = Object.values(attendanceByWorkshop || {}).some((record: any) => 
                        `${record.workshop_title}-${record.class_name}` === workshopClassKey
                      );
                      return !hasAttendance;
                    }) : [];
                    
                    return (
                      <div key={`workshop-${index}`} className="group relative p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all duration-200">
                        <div className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="text-sm text-red-800 font-medium">{workshop.title}</span>
                            <div className="text-xs text-red-600 mt-1">
                              Missing attendance for: {missingClasses.map((c: any) => c.name).join(', ')}
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                    );
                  })}
                  {/* Essays needing attention */}
                  {essaysNeedingAttention.map((essay, index) => (
                    <div key={`essay-${index}`} className="group relative p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all duration-200">
                      <div className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-sm text-red-800 font-medium">{essay.title}</span>
                          <div className="text-xs text-red-600 mt-1">Essay pending for over a week</div>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  ))}
                  
                  {/* Opportunities needing attention */}
                  {opportunitiesNeedingAttention.map((opportunity, index) => (
                    <div key={`opportunity-${index}`} className="group relative p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all duration-200">
                      <div className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-sm text-red-800 font-medium">{opportunity.title}</span>
                          <div className="text-xs text-red-600 mt-1">Opportunity pending for over a week</div>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  ))}
                  
                  {/* Assignments needing attention */}
                  {assignmentsNeedingAttention.map((assignment, index) => (
                    <div 
                      key={`assignment-${index}`} 
                      className="group relative p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all duration-200 cursor-pointer"
                      onClick={() => handleAssignmentClick(assignment)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleAssignmentClick(assignment);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`View assignment: ${assignment.title}`}
                    >
                      <div className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-sm text-red-800 font-medium">{assignment.title}</span>
                          <div className="text-xs text-red-600 mt-1">Assignment due soon or overdue</div>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          <ArrowRight className="h-3 w-3 text-red-500 group-hover:text-red-600 transition-colors" />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  ))}
                  
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="relative">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <div className="absolute inset-0 bg-green-100 rounded-full opacity-20 animate-pulse"></div>
                  </div>
                  <p className="text-lg font-medium text-gray-600 mb-2">All caught up!</p>
                  <p className="text-sm text-gray-400">No items require attention</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

            {/* 📋 Bottom Section (Full Width) - Attendance Overview */}
      <Card className="shadow-none border hover:shadow-sm transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Attendance Overview</CardTitle>
                <p className="text-sm text-gray-500">Workshop attendance this week</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">{attendanceRecords.length}</div>
              <div className="text-xs text-gray-500">workshops</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="space-y-2">
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : attendanceRecords.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {attendanceRecords.map((record, index) => {
                const attendancePercentage = Math.round((record.present_count / record.total_count) * 100);
                const getAttendanceColor = (percentage: number) => {
                  if (percentage >= 90) return 'text-green-600 bg-green-50 border-green-200';
                  if (percentage >= 75) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
                  return 'text-red-600 bg-red-50 border-red-200';
                };
                const getAttendanceIcon = (percentage: number) => {
                  if (percentage >= 90) return <CheckCircle className="h-4 w-4" />;
                  if (percentage >= 75) return <AlertCircle className="h-4 w-4" />;
                  return <XCircle className="h-4 w-4" />;
                };
                
                return (
                  <div key={index} className="group relative p-4 border border-gray-200 rounded-xl hover:border-orange-200 hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent transition-all duration-200 cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate group-hover:text-orange-700 transition-colors mb-1">
                          {record.workshop_title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">{record.class_name}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(record.date), "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                      <div className={`ml-3 p-2 rounded-lg ${getAttendanceColor(attendancePercentage)}`}>
                        {getAttendanceIcon(attendancePercentage)}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Attendance</span>
                        <span className="text-lg font-bold text-gray-900">
                          {record.present_count}/{record.total_count}
                        </span>
                      </div>
                      
                      <Progress 
                        value={attendancePercentage} 
                        className={`h-[4px] transition-all duration-300 ${
                          attendancePercentage >= 90 ? '[&>div]:bg-statColors-1' : 
                          attendancePercentage >= 75 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'
                        }`}
                      />
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Percentage</span>
                        <span className={`font-semibold ${
                          attendancePercentage >= 90 ? 'text-green-600' : 
                          attendancePercentage >= 75 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {attendancePercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="relative">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <div className="absolute inset-0 bg-orange-100 rounded-full opacity-20 animate-pulse"></div>
              </div>
              <p className="text-lg font-medium text-gray-600 mb-2">No attendance records this week</p>
              <p className="text-sm text-gray-400">No workshops have been tracked yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 