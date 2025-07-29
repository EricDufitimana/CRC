import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar, Clock, Users, FileText, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Dashboard } from "@/components/Dashboard";

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
    id: '1',
    student: 'Alice Johnson',
    class: 'English 101',
    essayTitle: 'The Impact of Social Media on Modern Communication',
    submittedDate: new Date('2024-01-15'),
    wordCount: 1200,
    urgency: 'high',
    status: 'new'
  },
  {
    id: '2',
    student: 'Bob Smith',
    class: 'History 201',
    essayTitle: 'World War II: A Comprehensive Analysis',
    submittedDate: new Date('2024-01-14'),
    wordCount: 1500,
    urgency: 'medium',
    status: 'new'
  },
  {
    id: '3',
    student: 'Carol Davis',
    class: 'Literature 301',
    essayTitle: 'Symbolism in Modern Poetry',
    submittedDate: new Date('2024-01-10'),
    wordCount: 800,
    urgency: 'low',
    status: 'pending',
    reviewerId: 'current-user'
  },
  {
    id: '4',
    student: 'David Wilson',
    class: 'Philosophy 201',
    essayTitle: 'Ethics in the Digital Age',
    submittedDate: new Date('2024-01-08'),
    wordCount: 1100,
    urgency: 'medium',
    status: 'done',
    reviewerId: 'current-user',
    completedAt: new Date('2024-01-12')
  }
];

const mockTeamMembers: TeamMember[] = [
  { id: '1', name: 'Sarah Wilson', role: 'Senior Reviewer' },
  { id: '2', name: 'Mike Chen', role: 'Literature Specialist' },
  { id: '3', name: 'Emma Davis', role: 'History Expert' },
  { id: '4', name: 'James Taylor', role: 'Writing Coach' }
];

const EssayRequests = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'pending' | 'done'>('requests');
  const [showDeferModal, setShowDeferModal] = useState(false);
  const [selectedEssay, setSelectedEssay] = useState<EssayRequest | null>(null);
  const [essays, setEssays] = useState<EssayRequest[]>(mockEssayRequests);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const filteredEssays = essays.filter(essay => {
    if (activeTab === 'requests') return essay.status === 'new';
    if (activeTab === 'pending') return essay.status === 'pending';
    if (activeTab === 'done') return essay.status === 'done';
    return false;
  });

  const handleView = (essay: EssayRequest) => {
    setEssays(prev => prev.map(e => 
      e.id === essay.id 
        ? { ...e, status: 'pending' as const, reviewerId: 'current-user' }
        : e
    ));
  };

  const handleMarkDone = (essay: EssayRequest) => {
    setEssays(prev => prev.map(e => 
      e.id === essay.id 
        ? { ...e, status: 'done' as const, completedAt: new Date() }
        : e
    ));
  };

  const handleDefer = (essay: EssayRequest) => {
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

  return (
    <Dashboard>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Essay Requests</h1>
        </div>

        <ToggleGroup 
          type="single" 
          value={activeTab} 
          onValueChange={(value) => value && setActiveTab(value as any)}
          className="justify-start"
        >
          <ToggleGroupItem value="requests" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            Requests ({getTabCount('requests')})
          </ToggleGroupItem>
          <ToggleGroupItem value="pending" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            Pending ({getTabCount('pending')})
          </ToggleGroupItem>
          <ToggleGroupItem value="done" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            Done ({getTabCount('done')})
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="grid gap-4">
          {filteredEssays.map((essay) => (
            <Card key={essay.id} className="border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{essay.essayTitle}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {essay.student}
                      </div>
                      <span>{essay.class}</span>
                    </div>
                  </div>
                  <Badge className={getUrgencyColor(essay.urgency)}>
                    {essay.urgency.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Submitted: {format(essay.submittedDate, 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{essay.wordCount} words</span>
                  </div>
                  {essay.completedAt && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Completed: {format(essay.completedAt, 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                  {essay.deferredBy && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span>Deferred by {essay.deferredBy}</span>
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
                    <Button 
                      variant="outline" 
                      onClick={() => handleDefer(essay)}
                      size="sm"
                    >
                      Defer
                    </Button>
                  </>
                )}
                
                {activeTab === 'pending' && (
                  <>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button 
                      onClick={() => handleMarkDone(essay)}
                      size="sm"
                    >
                      Mark as Done
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleDefer(essay)}
                      size="sm"
                    >
                      Defer
                    </Button>
                  </>
                )}
                
                {activeTab === 'done' && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleDefer(essay)}
                    size="sm"
                  >
                    Defer
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
          
          {filteredEssays.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No essays in {activeTab} state.
              </p>
            </Card>
          )}
        </div>

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
                    <div className="text-sm text-muted-foreground">{member.role}</div>
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
    </Dashboard>
  );
};

export default EssayRequests;