"use client";

import { submitEssayHandler } from "@/actions/submitEssayHandler";
import { submitOpportunityHandler } from "@/actions/submitOpportunityHandler";
import { requestSessionHandler } from "@/actions/requestSessionHandler";
import { useSupabase } from "@/hooks/useSupabase";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useActionState } from "react";
import { getCalApi } from "@calcom/embed-react";
import { DashboardHeader } from "../../../../components/dashboard/DashboardHeader";
import { StudentSidebar } from "../../../../components/dashboard/StudentSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../zenith/src/components/ui/card";
import { Button } from "../../../../../zenith/src/components/ui/button";
import { Badge } from "../../../../../zenith/src/components/ui/badge";
import { Progress } from "../../../../../zenith/src/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../../zenith/src/components/ui/dialog";
import { Input } from "../../../../../zenith/src/components/ui/input";
import { Textarea } from "../../../../../zenith/src/components/ui/textarea";
import { Label } from "../../../../../zenith/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../zenith/src/components/ui/select";
import { 
  BookOpen, 
  Calendar, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Star,
  Award,
  FileText,
  Users,
  Briefcase,
  GraduationCap
} from "lucide-react";


export default function StudentDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [submitEssayOpen, setSubmitEssayOpen] = useState(false); const [submitOpportunityOpen, setSubmitOpportunityOpen] = useState(false);
  const [requestSessionOpen, setRequestSessionOpen] = useState(false);
  const [selectedSessionDuration, setSelectedSessionDuration] = useState<string>("");
  const [crcFellows, setCrcFellows] = useState<Array<{id: string, name: string, specialization: string}>>([]);
  const [studentId, setStudentId] = useState<number | null>(null);
  
  // Multi-step booking state
  const [bookingStep, setBookingStep] = useState<'select-admin' | 'select-time' | 'booking'>('select-admin');
  const [selectedAdmin, setSelectedAdmin] = useState<{id: string, name: string, specialization: string} | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  
  // Move hook to top level
  const { getUserId } = useSupabase();
  console.log("Selected Time: ", selectedTime);
  // Mock data for student dashboard
  const studentStats = [
    { 
      title: "Sessions Completed", 
      value: "24", 
      description: "This semester", 
      icon: CheckCircle, 
      trend: "+8 from last month", 
      color: "text-green-500",
      bgColor: "bg-green-100"
    },
    { 
      title: "Essays Submitted", 
      value: "12", 
      description: "Pending review: 3", 
      icon: FileText, 
      trend: "2 approved this week", 
      color: "text-blue-500",
      bgColor: "bg-blue-100"
    },
    { 
      title: "Opportunities Applied", 
      value: "8", 
      description: "3 interviews scheduled", 
      icon: Briefcase, 
      trend: "+2 new applications", 
      color: "text-purple-500",
      bgColor: "bg-purple-100"
    }
  ];

  const upcomingSessions = [
    {
      id: 1,
      title: "Essay Review Session",
      mentor: "Dr. Sarah Johnson",
      date: "Tomorrow, 2:00 PM",
      duration: "45 min",
      type: "Virtual",
      status: "confirmed"
    },
    {
      id: 2,
      title: "Career Planning Workshop",
      mentor: "Prof. Michael Chen",
      date: "Friday, 10:00 AM",
      duration: "60 min",
      type: "In-person",
      status: "confirmed"
    }
  ];

  const recentProgress = [
    { skill: "Essay Writing", progress: 85, improvement: "+15%" },
    { skill: "Interview Skills", progress: 72, improvement: "+8%" },
    { skill: "Research Methods", progress: 90, improvement: "+12%" }
  ];

  const quickActions = [
    { title: "Request Session", icon: Calendar, action: "request-session", color: "bg-blue-500" },
    { title: "Submit Essay", icon: FileText, action: "submit-essay", color: "bg-green-500" },
    { title: "Submit Opportunity", icon: Briefcase, action: "submit-opportunity", color: "bg-purple-500" },
    { title: "Update Profile", icon: Users, href: "/dashboard/student/profile", color: "bg-orange-500" }
  ];




  const sessionDurations = [
    { value: "20_min", label: "20 min", description: "Quick review" },
    { value: "40_min", label: "40 min", description: "Standard session" },
    { value: "60_min", label: "60 min", description: "Comprehensive review" }
  ];

  // Removed handleSubmitEssay - using useActionState instead

    
  const handleQuickAction = (action: string | undefined, href: string | undefined) => {
    if (action === "submit-essay") {
      setSubmitEssayOpen(true);
    } else if (action === "submit-opportunity") {
      setSubmitOpportunityOpen(true);
    } else if (action === "request-session") {
      setRequestSessionOpen(true);
      // Reset booking state
      setBookingStep('select-admin');
      setSelectedAdmin(null);
      setSelectedTime("");
    } else if (href) {
      // Handle navigation
      console.log("Navigate to:", href);
    }
  };

  const handleSessionDurationSelect = (duration: string) => {
    setSelectedSessionDuration(duration);
  };

  // Fetch fellows from API endpoint
  useEffect(() => {
    const fetchFellows = async () => {
      try {
        const response = await fetch('/api/fellows');
        if (response.ok) {
          const data = await response.json();
          setCrcFellows(data);
        } else {
          console.error('Failed to fetch fellows');
        }
      } catch (error) {
        console.error('Error fetching fellows:', error);
      }
    };

    fetchFellows();
  }, []);

  const getSession = async () => {
    const userId = await getUserId()
    
    if (userId) {
      try {
        const response = await fetch(`/api/studentId?userId=${userId}`);
        const data = await response.json();
        console.log('User ID:', userId);
        console.log('Student data:', data);
        
        if (data.studentId) {
          setStudentId(data.studentId);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    } else {
      console.log('No user session found');
    }
  }
  useEffect(() => {
    getSession();
  }, []);

  // Wrapper function to pass IDs to the action
  const handleEssaySubmission = async (prevState: any, formData: FormData) => {
    if (!studentId) {
      return {
        success: false,
        message: 'Student ID not found. Please refresh the page.',
      }
    }
    
    // Add student_id to formData
    formData.append('student_id', studentId.toString());
    
    return await submitEssayHandler(prevState, formData);
  };

  const[state, formAction, isPending] = useActionState(handleEssaySubmission, {
    success: false,
    message: '',
    data: null
  });

    // Show success/error message for essay
  useEffect(() => {
    if (state.success) {
      console.log('Essay submitted successfully:', state.message);
      setSubmitEssayOpen(false);
      // Form resets automatically with useActionState
    } else if (state.message) {
      console.error('Essay submission failed:', state.message);
    }
  }, [state]);

  // Wrapper function for opportunity submission
  const handleOpportunitySubmission = async (prevState: any, formData: FormData) => {
    if(!studentId) {
      return {
        success: false,
        message: 'Student ID not found. Please refresh the page.',
      }
    }
    formData.append('student_id', studentId.toString());
    return await submitOpportunityHandler(prevState, formData);
  };

  const [opportunityState, opportunityFormAction, isOpportunityPending] = useActionState(handleOpportunitySubmission, {
    success: false,
    message: ''
  });

  // Show success/error message for opportunity
  useEffect(() => {
    if (opportunityState?.success) {
      console.log('Opportunity submitted successfully:', opportunityState.message);
      setSubmitOpportunityOpen(false);
      // Form resets automatically with useActionState
    } else if (opportunityState?.message) {
      console.error('Opportunity submission failed:', opportunityState.message);
    }
  }, [opportunityState]);

  const handleRequestSession = async (prevState: any, formData: FormData) => {
    if(!studentId) {
      return {
        success: false,
        message: 'Student ID not found. Please refresh the page.',
      }
    }
    formData.append('student_id', studentId.toString());
    return await requestSessionHandler(prevState, formData);
  };
  const [requestSessionState, requestSessionFormAction, isRequestSessionPending] = useActionState(handleRequestSession, {
    success: false,
    message: '',
    data: null
  });

  // Show success/error message for session request
  useEffect(() => {
    if (requestSessionState?.success) {
      console.log('Session request submitted successfully:', requestSessionState.message);
      setRequestSessionOpen(false);
      setSelectedSessionDuration(""); // Reset duration selection
      // Form resets automatically with useActionState
    } else if (requestSessionState?.message) {
      console.error('Session request submission failed:', requestSessionState.message);
    }
  }, [requestSessionState]);

  // Add Cal.com integration
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({"namespace":"20min"});
      cal("floatingButton", {"calLink":"dufitimana-eric/20min","config":{"layout":"month_view"}});
      cal("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
    })();
  }, [])


  // Handles which cal.com link to use based on the selected time
  // const getCalLink = () => {
  //   if(selectedTime === '20_min') {
  //     return {
  //       url: 'https://cal.com/dufitimana-eric/20min',
  //       name-space:'quick-review',
  //     }
  //   } else if (selectedTime === '40_min') {
  //     return {
  //       url: 'https://cal.com/dufitimana-eric/40min',
  //       name-space:'',
  //     }
  //   } else if (selectedTime === '60_min') {
  //     return {
  //       url: 'https://cal.com/dufitimana-eric/60min',
  //       name-space:'quick-review',
  //     }
  //   }
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex w-full">
      <StudentSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        isDarkTheme={isDarkTheme}
      />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader 
          isDarkTheme={isDarkTheme}
          onThemeToggle={() => setIsDarkTheme(!isDarkTheme)}
        />
        
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Welcome back, Alex! 👋
                </h1>
                <p className="text-gray-600">
                  Ready to continue your academic journey? Here's what's happening today.
                </p>
              </div>
            </div>
            
            {/* Achievement Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full">
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">Top Performer - This Week</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2/3 - Stats and Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {studentStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index} className="shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                          {stat.title}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                          <Icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {stat.description}
                        </div>
                        <div className="flex items-center text-xs text-green-600">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {stat.trend}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                         {quickActions.map((action, index) => {
                       const Icon = action.icon;
                       return (
                         <Button
                           key={index}
                           variant="ghost"
                           onClick={() => handleQuickAction(action.action, action.href)}
                           className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-all duration-200"
                         >
                           <div className={`p-3 rounded-full ${action.color} text-white`}>
                             <Icon className="h-6 w-6" />
                           </div>
                           <span className="text-sm font-medium text-gray-700">{action.title}</span>
                         </Button>
                       );
                     })}
                  </div>
                </CardContent>
              </Card>

              {/* Progress Tracking */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentProgress.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">{item.skill}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{item.progress}%</span>
                            <Badge variant="secondary" className="text-xs text-green-600 bg-green-100">
                              {item.improvement}
                            </Badge>
                          </div>
                        </div>
                        <Progress value={item.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right 1/3 - Sessions and Calendar */}
            <div className="space-y-6">
              {/* Upcoming Sessions */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Upcoming Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{session.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {session.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{session.mentor}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {session.duration}
                                                    </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                    View All Sessions
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                      <Award className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Essay Excellence Award</p>
                        <p className="text-xs text-gray-600">2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Interview Success</p>
                        <p className="text-xs text-gray-600">1 week ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Submit Essay Dialog */}
      <Dialog open={submitEssayOpen} onOpenChange={setSubmitEssayOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Submit Essay for Review</DialogTitle>
          </DialogHeader>
          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="essay-title">Essay Title</Label>
              <Input
                id="essay-title"
                name="title"
                placeholder="Enter your essay title"
                required
              />
            </div>
            <div>
              <Label htmlFor="essay-description">Description</Label>
              <Textarea
                id="essay-description"
                name="description"
                placeholder="Brief description of your essay topic and requirements"
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="essay-deadline">Deadline (Optional)</Label>
              <Input
                id="essay-deadline"
                name="deadline"
                type="date"
              />
            </div>
            <div>
              <Label htmlFor="crc-fellow">CRC Fellow *</Label>
              <Select name="admin_id" required>
                <SelectTrigger className="w-full min-w-[200px]">
                  <SelectValue placeholder="Select a CRC Fellow" />
                </SelectTrigger>
                <SelectContent className="w-full min-w-[200px]">
                  {crcFellows.length === 0 ? (
                    <SelectItem value="loading" disabled>
                      Loading fellows...
                    </SelectItem>
                  ) : (
                    crcFellows
                      .filter(fellow => fellow.id) // Filter out empty IDs
                      .map((fellow) => (
                        <SelectItem key={fellow.id} value={fellow.id} className="whitespace-normal">
                          <div className="w-full">
                            <div className="font-medium">{fellow.name}</div>
                            <div className="text-sm text-gray-500">{fellow.specialization}</div>
                          </div>
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="google-docs-link">Google Docs Link</Label>
              <Input
                id="google-docs-link"
                name="googleDocsLink"
                type="url"
                placeholder="https://docs.google.com/document/d/..."
                required
              />
            </div>
            <div>
              <Label htmlFor="word-count">Word Count (Optional)</Label>
              <Input
                id="word-count"
                name="word_count"
                type="number"
                placeholder="Enter word count"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setSubmitEssayOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isPending}>
                {isPending ? 'Submitting...' : 'Submit Essay'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Submit Opportunity Dialog */}
      <Dialog open={submitOpportunityOpen} onOpenChange={setSubmitOpportunityOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Submit Opportunity</DialogTitle>
          </DialogHeader>
          <form action={opportunityFormAction}>
            <div className="space-y-4">
              
              <div>
                <Label htmlFor="opportunity-title">Title</Label>
                <Input
                  id="opportunity-title"
                  name="title"
                  placeholder="Enter opportunity title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="opportunity-description">Description (optional)</Label>
                <Textarea
                  id="opportunity-description"
                  name="description"
                  placeholder="Brief description of the opportunity"
                  rows={3}
                />
              </div>
                            <div>
                <Label htmlFor="opportunity-crc-fellow">CRC Fellow *</Label>
                <Select name="admin_id" required>
                  <SelectTrigger className="w-full min-w-[200px]">
                    <SelectValue placeholder="Select a CRC Fellow" />
                  </SelectTrigger>
                  <SelectContent className="w-full min-w-[200px]">
                    {crcFellows.length === 0 ? (
                      <SelectItem value="loading" disabled>
                        Loading fellows...
                      </SelectItem>
                    ) : (
                      crcFellows
                        .filter(fellow => fellow.id) // Filter out empty IDs
                        .map((fellow) => (
                          <SelectItem key={fellow.id} value={fellow.id} className="whitespace-normal">
                            <div className="w-full">
                              <div className="font-medium">{fellow.name}</div>
                              <div className="text-sm text-gray-500">{fellow.specialization}</div>
                            </div>
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="opportunity-deadline">Deadline</Label>
                <Input
                  id="opportunity-deadline"
                  name="deadline"
                  type="date"
                  required
                />
              </div>
              <div>
                <Label htmlFor="opportunity-link">Link</Label>
                <Input
                  id="opportunity-link"
                  name="link"
                  type="url"
                  placeholder="https://example.com/opportunity"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setSubmitOpportunityOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700" disabled={isOpportunityPending}>
                  {isOpportunityPending ? 'Submitting...' : 'Submit Opportunity'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* OLD: Request Session Dialog - Commented out as requested */}
      {/* <Dialog open={requestSessionOpen} onOpenChange={setRequestSessionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Request a Session</DialogTitle>
          </DialogHeader>
          <form action={requestSessionFormAction}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="session-topic">Topic</Label>
                <Input
                  id="session-topic"
                  name="topic"
                  placeholder="Enter session topic"
                  required
                />
              </div>
              <div>
                <Label htmlFor="session-description">Description</Label>
                <Textarea
                  id="session-description"
                  name="description"
                  placeholder="Describe what you'd like to discuss or work on"
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="session-crc-fellow">CRC Fellow</Label>
                <Select name="admin_id" required>
                  <SelectTrigger className="w-full min-w-[200px]">
                    <SelectValue placeholder="Select a CRC Fellow" />
                  </SelectTrigger>
                  <SelectContent className="w-full min-w-[200px]">
                    {crcFellows.length === 0 ? (
                      <SelectItem value="loading" disabled>
                        Loading fellows...
                      </SelectItem>
                    ) : (
                      crcFellows
                        .filter(fellow => fellow.id) // Filter out empty IDs
                        .map((fellow) => (
                          <SelectItem key={fellow.id} value={fellow.id} className="whitespace-normal">
                            <div className="w-full">
                              <div className="font-medium">{fellow.name}</div>
                              <div className="text-sm text-gray-500">{fellow.specialization}</div>
                            </div>
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="session-date">Requested Date</Label>
                <Input
                  id="session-date"
                  name="requested_date"
                  type="date"
                  required
                />
              </div>
              <div>
                <Label htmlFor="session-time">Requested Time</Label>
                <Input
                  id="session-time"
                  name="requested_time"
                  type="time"
                  min="08:00"
                  max="21:00"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Available time: 8:00 AM - 9:00 PM</p>
              </div>
              <div>
                <Label htmlFor="session-duration">Session Duration</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {sessionDurations.map((duration) => (
                    <Button
                      key={duration.value}
                      type="button"
                      variant="outline"
                      onClick={() => handleSessionDurationSelect(duration.value)}
                      className={`h-auto p-3 flex flex-col items-center justify-center transition-all duration-200 ${
                        selectedSessionDuration === duration.value
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`font-medium ${
                        selectedSessionDuration === duration.value ? 'text-orange-600' : 'text-gray-900'
                      }`}>
                        {duration.label}
                      </div>
                      <div className={`text-sm ${
                        selectedSessionDuration === duration.value ? 'text-orange-500' : 'text-gray-500'
                      }`}>
                        {duration.description}
                      </div>
                      <input
                        type="radio"
                        name="session_duration"
                        value={duration.value}
                        checked={selectedSessionDuration === duration.value}
                        onChange={() => handleSessionDurationSelect(duration.value)}
                        className="sr-only"
                        required
                      />
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setRequestSessionOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" disabled={isRequestSessionPending}>
                  {isRequestSessionPending ? 'Requesting...' : 'Request Session'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog> */}

      {/* NEW: Cal.com-Style Multi-step Session Booking Implementation */}
      <Dialog open={requestSessionOpen} onOpenChange={(open) => {
        setRequestSessionOpen(open);
        if (!open) {
          // Reset booking state when dialog closes
          setBookingStep('select-admin');
          setSelectedAdmin(null);
          setSelectedTime("");
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border-0">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
              {bookingStep === 'select-admin' && 'Choose your CRC Fellow'}
              {bookingStep === 'select-time' && 'Select your session time'}
              {bookingStep === 'booking' && 'Confirm your booking'}
            </DialogTitle>
            
            {/* Clean Progress Steps */}
            <div className="flex items-center justify-center space-x-6 mt-8">
              <div className={`flex items-center ${bookingStep === 'select-admin' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  bookingStep === 'select-admin' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium">Fellow</span>
              </div>
              <div className={`w-6 h-px ${bookingStep === 'select-admin' ? 'bg-gray-200' : 'bg-blue-600'}`}></div>
              <div className={`flex items-center ${bookingStep === 'select-time' ? 'text-blue-600' : bookingStep === 'booking' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  bookingStep === 'select-time' ? 'bg-blue-600 text-white' : bookingStep === 'booking' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium">Time</span>
              </div>
              <div className={`w-6 h-px ${bookingStep === 'booking' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center ${bookingStep === 'booking' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  bookingStep === 'booking' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  3
                </div>
                <span className="ml-2 text-sm font-medium">Book</span>
              </div>
            </div>
          </DialogHeader>
          
                    {/* Step 1: Select Admin */}
          {bookingStep === 'select-admin' && (
            <div className="space-y-8">
              <p className="text-gray-500 text-center text-sm">
                Select the CRC Fellow you'd like to meet with
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {crcFellows.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-gray-500 text-sm">Loading fellows...</p>
                  </div>
                ) : (
                  crcFellows.map((fellow) => (
                    <div
                      key={fellow.id}
                      onClick={() => setSelectedAdmin(fellow)}
                      className={`p-6 border rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedAdmin?.id === fellow.id
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">{fellow.name}</h3>
                          <p className="text-sm text-gray-500">{fellow.specialization}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setBookingStep('select-time')}
                  disabled={!selectedAdmin}
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-2 rounded-lg font-medium"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Select Time */}
          {bookingStep === 'select-time' && (
            <div className="space-y-8">
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">
                  With <span className="font-semibold text-gray-900">{selectedAdmin?.name}</span>
                </p>
                <p className="text-gray-500 text-sm">
                  Choose your session duration
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {sessionDurations.map((duration) => (
                  <div
                    key={duration.value}
                    onClick={() => setSelectedTime(duration.value)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedTime === duration.value
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`text-lg font-semibold mb-1 ${
                        selectedTime === duration.value ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {duration.label}
                      </div>
                      <div className={`text-xs ${
                        selectedTime === duration.value ? 'text-blue-500' : 'text-gray-500'
                      }`}>
                        {duration.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setBookingStep('select-admin')}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setBookingStep('booking')}
                  disabled={!selectedTime}
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-2 rounded-lg font-medium"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Cal.com Booking */}
          {bookingStep === 'booking' && (
            <div className="space-y-8">
              {/* Session Summary */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Session Summary</h3>
                    <p className="text-sm text-gray-500">Review your booking details</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Fellow</span>
                    <span className="text-sm font-medium text-gray-900">{selectedAdmin?.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="text-sm font-medium text-gray-900">
                      {sessionDurations.find(d => d.value === selectedTime)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Type</span>
                    <span className="text-sm font-medium text-gray-900">In-person</span>
                  </div>
                </div>
              </div>
              
              {/* Primary CTA */}
              <div className="text-center">
                <Button 
                // {selectedTime == '20_min' && (

                // )}
                  onClick={async () => {
                    // Open Cal.com widget
                    const cal = await getCalApi({"namespace":"quick-review"});
                    cal("modal", {"calLink":"dufitimana-eric/quick-review"});
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Book Your Session
                </Button>
                <p className="text-xs text-gray-500 mt-3">
                  You'll be redirected to Cal.com to select your preferred time
                </p>
              </div>
              
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setBookingStep('select-time')}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}