"use client";

import { useState, useEffect } from "react";
import { Badge } from "../../../../../../zenith/src/components/ui/badge";
import { Button } from "../../../../../../zenith/src/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../../../../../zenith/src/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../../../../zenith/src/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "../../../../../../zenith/src/components/ui/toggle-group";
import { Calendar, Clock, Users, FileText, AlertTriangle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { DashboardHeader } from "../../../../../components/dashboard/DashboardHeader";
import { DashboardSidebar } from "../../../../../components/dashboard/DashboardSidebar";

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

type TeamMember = {
  id: string;
  name: string;
  role: string;
};

const mockEssayRequests: EssayRequest[] = [
  {
    id: "1",
    student: "John Doe",
    class: "Class A",
    essayTitle: "Essay on the importance of education",
    submittedDate: new Date("2023-10-20"),
    wordCount: 1200,
    urgency: "medium",
    status: "new",
  },
  {
    id: "2",
    student: "Jane Smith",
    class: "Class B",
    essayTitle: "Essay on climate change",
    submittedDate: new Date("2023-10-21"),
    wordCount: 1500,
    urgency: "high",
    status: "pending",
    reviewerId: "member1",
    deferredBy: "member2",
    completedAt: new Date("2023-10-25"),
  },
  {
    id: "3",
    student: "Peter Jones",
    class: "Class A",
    essayTitle: "Essay on the future of technology",
    submittedDate: new Date("2023-10-22"),
    wordCount: 1800,
    urgency: "low",
    status: "done",
    reviewerId: "member2",
    completedAt: new Date("2023-10-24"),
  },
];

const mockTeamMembers: TeamMember[] = [
  { id: "member1", name: "Team Member 1", role: "Reviewer" },
  { id: "member2", name: "Team Member 2", role: "Reviewer" },
  { id: "member3", name: "Team Member 3", role: "Reviewer" },
];

export default function EssayRequests() {
  const [activeTab, setActiveTab] = useState<'requests' | 'pending' | 'done'>('requests');
  const [showDeferModal, setShowDeferModal] = useState(false);
  const [selectedEssay, setSelectedEssay] = useState<EssayRequest | null>(null);
  const [essays, setEssays] = useState<EssayRequest[]>(mockEssayRequests);
  const [essayRequests, setEssayRequests] = useState<Array<{id:string, title:string, description:string, deadline:string, link:string, student_id:string, admin_id:string, admin_name:string, student_name:string , created_at:string}>>([]);
  const [isLoading, setIsLoading] = useState(true);


  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-dashboard-destructive text-dashboard-destructive-foreground';
      case 'medium': return 'bg-dashboard-accent text-dashboard-accent-foreground';
      case 'low': return 'bg-dashboard-success text-dashboard-success-foreground';
      default: return 'bg-dashboard-secondary text-dashboard-secondary-foreground';
    }
  };

  const filteredEssays = essays.filter(essay => {
    if (activeTab === 'requests') return essay.status === 'new';
    if (activeTab === 'pending') return essay.status === 'pending';
    if (activeTab === 'done') return essay.status === 'done';
    return false;
  });

  const handleView = (essay: any) => {
    setEssays(prev => prev.map(e =>
      e.id === essay.id
        ? { ...e, status: 'pending' as const, reviewerId: 'current-user' }
        : e
    ));
  };

  const handleMarkDone = (essay: any) => {
    setEssays(prev => prev.map(e =>
      e.id === essay.id
        ? { ...e, status: 'done' as const, completedAt: new Date() }
        : e
    ));
  };

  const handleDefer = (essay: any) => {
    setSelectedEssay(essay);
    setShowDeferModal(true);
  };

  const handleDeferToMember = (memberId: string) => {
    if (selectedEssay) {
      setEssays(prev => prev.map(e =>
        e.id === selectedEssay.id
          ? { ...e, reviewerId: memberId, deferredBy: 'current-user' }
          : e
      ));
    }
    setShowDeferModal(false);
    setSelectedEssay(null);
  };

  const getTabCount = (tab: 'requests' | 'pending' | 'done') => {
    return essays.filter(essay => {
      if (tab === 'requests') return essay.status === 'new';
      if (tab === 'pending') return essay.status === 'pending';
      if (tab === 'done') return essay.status === 'done';
      return false;
    }).length;
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

  const getEssayDeferredBy = (essayId: string) => {
    // Static deferral data - you can customize this
    const deferredMap: { [key: string]: string | null } = {
      '1': null,
      '2': null,
      '3': null
    };
    return deferredMap[essayId] || null;
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
      setIsLoading(true);
      try{
        const response = await fetch('/api/essay-requests');
        if(response.ok){
          const data = await response.json();
          console.log(data);
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
  }, []);


  return (
    <div className="min-h-screen bg-dashboard-background flex w-full">
      <DashboardSidebar 
        isDarkTheme={true} 
      />
      <div className="flex-1 flex flex-col">
        <DashboardHeader isDarkTheme={true} onThemeToggle={() => {}} />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full bg-dashboard-card">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-dashboard-foreground">Essay Requests</h1>
              {isLoading && (
                <div className="flex items-center gap-2 text-dashboard-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              )}
            </div>

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
            </ToggleGroup>

            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid gap-4">
                {essayRequests.map((essay) => (
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
                            <span>Not Yet </span>
                          </div>
                        </div>
                        <Badge className={getUrgencyColor(getEssayUrgency(essay.id))}>
                          Not yet
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-dashboard-muted-foreground" />
                          <span>Submitted: {safeFormatDate(essay.created_at, 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-dashboard-muted-foreground" />
                          <span>Not Yet words</span>
                        </div>
                        {getEssayCompletedAt(essay.id) && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-dashboard-muted-foreground" />
                            <span>Completed: {format(new Date(getEssayCompletedAt(essay.id)!), 'MMM dd, yyyy')}</span>
                          </div>
                        )}
                        {getEssayDeferredBy(essay.id) && (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-dashboard-accent" />
                            <span>Deferred by {getEssayDeferredBy(essay.id)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                      {activeTab === 'requests' && (
                        <>
                          <Button onClick={() => handleView(essay)} size="sm">
                            View
                          </Button>
                          <Button variant="outline" onClick={() => handleDefer(essay)} size="sm">
                            Defer
                          </Button>
                        </>
                      )}
                      {activeTab === 'pending' && (
                        <>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button onClick={() => handleMarkDone(essay)} size="sm">
                            Mark as Done
                          </Button>
                          <Button variant="outline" onClick={() => handleDefer(essay)} size="sm">
                            Defer
                          </Button>
                        </>
                      )}
                      {activeTab === 'done' && (
                        <Button variant="outline" onClick={() => handleDefer(essay)} size="sm">
                          Defer
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
                {essayRequests.length === 0 && !isLoading && (
                  <Card className="p-8 text-center bg-dashboard-card">
                    <p className="text-dashboard-muted-foreground">
                      No essays found.
                    </p>
                  </Card>
                )}
              </div>
            )}
            <Dialog open={showDeferModal} onOpenChange={setShowDeferModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Defer Essay Request</DialogTitle>
                  <DialogDescription>
                    Choose a team member to defer this essay to:
                    {selectedEssay && (
                      <span className="block mt-2 font-medium">
                        "{selectedEssay.essayTitle}" by {selectedEssay.student}
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  {mockTeamMembers.map((member) => (
                    <Button
                      key={member.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleDeferToMember(member.id)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-dashboard-muted-foreground">{member.role}</div>
                      </div>
                    </Button>
                  ))}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeferModal(false)}>
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
} 