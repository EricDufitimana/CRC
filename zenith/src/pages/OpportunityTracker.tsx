import React, { useState } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, MessageSquare, FilePlus, Send, Calendar, User, ExternalLink, Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type Opportunity = {
  id: string;
  title: string;
  description: string;
  url: string;
  type: "scholarship" | "internship" | "competition";
  deadline: Date;
  student: {
    id: string;
    name: string;
    email: string;
  };
  status: "requested" | "pending" | "accepted" | "denied";
  submittedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  denialReason?: string;
  notifiedStudents?: boolean;
  addedToResources?: boolean;
};

// Mock data
const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Google Summer of Code 2024',
    description: 'Summer internship program for university students to work on open source projects.',
    url: 'https://summerofcode.withgoogle.com/',
    type: 'internship',
    deadline: new Date('2024-02-20'),
    student: { id: '1', name: 'Alice Johnson', email: 'alice@email.com' },
    status: 'requested',
    submittedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'Microsoft Azure Scholarship',
    description: 'Free Azure certification and training for students.',
    url: 'https://azure.microsoft.com/en-us/developer/students/',
    type: 'scholarship',
    deadline: new Date('2024-03-01'),
    student: { id: '2', name: 'Bob Smith', email: 'bob@email.com' },
    status: 'pending',
    submittedAt: new Date('2024-01-10'),
    reviewedBy: 'current-user'
  },
  {
    id: '3',
    title: 'ACM Programming Contest',
    description: 'International collegiate programming contest with cash prizes.',
    url: 'https://icpc.global/',
    type: 'competition',
    deadline: new Date('2024-01-30'),
    student: { id: '3', name: 'Carol Davis', email: 'carol@email.com' },
    status: 'accepted',
    submittedAt: new Date('2024-01-05'),
    reviewedBy: 'current-user',
    reviewedAt: new Date('2024-01-12'),
    notifiedStudents: true,
    addedToResources: true
  },
  {
    id: '4',
    title: 'Meta Career Prep Program',
    description: 'Career preparation program for underrepresented minorities in tech.',
    url: 'https://www.metacareers.com/careerprograms/',
    type: 'internship',
    deadline: new Date('2024-02-15'),
    student: { id: '4', name: 'David Wilson', email: 'david@email.com' },
    status: 'denied',
    submittedAt: new Date('2024-01-08'),
    reviewedBy: 'current-user',
    reviewedAt: new Date('2024-01-14'),
    denialReason: 'Application deadline has passed and program is at capacity.'
  }
];

const messageTemplates = [
  { value: 'thanks', label: 'Thank you template', content: 'Thank you for submitting this opportunity. We appreciate your contribution to our community.' },
  { value: 'denial', label: 'Denial explanation', content: 'We have reviewed your submission and unfortunately cannot approve it at this time.' },
  { value: 'custom', label: 'Custom message', content: '' }
];

export default function OpportunityTracker() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(mockOpportunities);
  const [activeTab, setActiveTab] = useState<'requested' | 'pending' | 'completed'>('requested');
  
  // Modal states
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [denyOpen, setDenyOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  
  // Form states
  const [notifyStudents, setNotifyStudents] = useState(true);
  const [denialReason, setDenialReason] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('thanks');
  const [customMessage, setCustomMessage] = useState('');

  // Filter opportunities by status
  const requestedOpportunities = opportunities.filter(opp => opp.status === 'requested');
  const pendingOpportunities = opportunities.filter(opp => opp.status === 'pending');
  const acceptedOpportunities = opportunities.filter(opp => opp.status === 'accepted');
  const deniedOpportunities = opportunities.filter(opp => opp.status === 'denied');

  const handleReview = (opportunity: Opportunity) => {
    setOpportunities(prev => 
      prev.map(opp => 
        opp.id === opportunity.id 
          ? { ...opp, status: 'pending', reviewedBy: 'current-user' }
          : opp
      )
    );
    window.open(opportunity.url, '_blank');
  };

  const handleAcceptClick = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setAcceptOpen(true);
  };

  const handleDenyClick = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setDenyOpen(true);
  };

  const handleAccept = () => {
    if (selectedOpportunity) {
      setOpportunities(prev => 
        prev.map(opp => 
          opp.id === selectedOpportunity.id 
            ? { 
                ...opp, 
                status: 'accepted', 
                reviewedAt: new Date(),
                notifiedStudents: notifyStudents,
                addedToResources: true
              }
            : opp
        )
      );
    }
    setAcceptOpen(false);
    setSelectedOpportunity(null);
    setNotifyStudents(true);
  };

  const confirmDenial = () => {
    if (selectedOpportunity) {
      setOpportunities(prev => 
        prev.map(opp => 
          opp.id === selectedOpportunity.id 
            ? { 
                ...opp, 
                status: 'denied', 
                reviewedAt: new Date(),
                denialReason
              }
            : opp
        )
      );
    }
    setDenyOpen(false);
    setSelectedOpportunity(null);
    setDenialReason('');
  };

  const openMessageComposer = () => {
    setMessageOpen(true);
    setAcceptOpen(false);
    setDenyOpen(false);
  };

  const sendMessage = () => {
    // Simulate sending message
    console.log('Sending message to:', selectedOpportunity?.student.email);
    setMessageOpen(false);
    setCustomMessage('');
    setMessageTemplate('thanks');
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'scholarship': return 'secondary';
      case 'internship': return 'default';
      case 'competition': return 'outline';
      default: return 'secondary';
    }
  };

  const getUrgencyVariant = (deadline: Date) => {
    const daysUntil = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 3) return 'destructive';
    if (daysUntil <= 7) return 'secondary';
    return 'outline';
  };

  const getUrgencyIcon = (deadline: Date) => {
    const daysUntil = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 3) return <AlertTriangle className="h-3 w-3" />;
    if (daysUntil <= 7) return <Clock className="h-3 w-3" />;
    return <Calendar className="h-3 w-3" />;
  };

  const OpportunityCard = ({ opportunity, showActions }: { opportunity: Opportunity; showActions?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary/20">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {opportunity.status === 'requested' && (
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  New
                </Badge>
              )}
              <Badge variant={getTypeVariant(opportunity.type)} className="capitalize">
                {opportunity.type}
              </Badge>
            </div>
            <CardTitle className="text-xl mb-2 group">
              <div className="flex items-center gap-2">
                {opportunity.title}
                <ExternalLink 
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-muted-foreground hover:text-primary" 
                  onClick={() => window.open(opportunity.url, '_blank')}
                />
              </div>
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Submitted by <strong>{opportunity.student.name}</strong></span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground mb-4 leading-relaxed">{opportunity.description}</p>
        <div className="flex gap-2 flex-wrap">
          <Badge variant={getUrgencyVariant(opportunity.deadline)} className="flex items-center gap-1">
            {getUrgencyIcon(opportunity.deadline)}
            Deadline: {opportunity.deadline.toLocaleDateString()}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(opportunity.submittedAt)} ago
          </Badge>
        </div>
        {opportunity.denialReason && (
          <div className="mt-4 p-3 bg-destructive/5 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">
              <strong>Denial Reason:</strong> {opportunity.denialReason}
            </p>
          </div>
        )}
        {opportunity.status === 'accepted' && (
          <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Accepted and added to resources</span>
          </div>
        )}
      </CardContent>
      {showActions && (
        <CardFooter className="pt-0">
          {opportunity.status === 'requested' && (
            <Button 
              onClick={() => handleReview(opportunity)} 
              className="w-full"
              size="lg"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Review Application
            </Button>
          )}
          {opportunity.status === 'pending' && (
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button 
                onClick={() => handleAcceptClick(opportunity)}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Accept
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDenyClick(opportunity)}
                size="lg"
              >
                <XCircle className="mr-2 h-4 w-4" /> Deny
              </Button>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );

  return (
    <Dashboard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Opportunity Tracker</h1>
            <p className="text-muted-foreground mt-2">Review and manage student-submitted opportunities</p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-muted rounded-lg p-1">
            <TabsTrigger 
              value="requested" 
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Clock className="w-4 h-4" />
              <span>Requested</span>
              <Badge variant="secondary" className="ml-1">
                {requestedOpportunities.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="pending"
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <User className="w-4 h-4" />
              <span>Pending</span>
              <Badge variant="secondary" className="ml-1">
                {pendingOpportunities.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Completed</span>
              <Badge variant="secondary" className="ml-1">
                {acceptedOpportunities.length + deniedOpportunities.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

        <TabsContent value="requested">
          <div className="space-y-4">
            {requestedOpportunities.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No new opportunity requests</p>
              </Card>
            ) : (
              requestedOpportunities.map(opportunity => (
                <OpportunityCard 
                  key={opportunity.id} 
                  opportunity={opportunity} 
                  showActions 
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="space-y-4">
            {pendingOpportunities.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No opportunities pending review</p>
              </Card>
            ) : (
              pendingOpportunities.map(opportunity => (
                <OpportunityCard 
                  key={opportunity.id} 
                  opportunity={opportunity} 
                  showActions 
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="accepted">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500 h-5 w-5" />
                  Accepted Opportunities ({acceptedOpportunities.length})
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {acceptedOpportunities.map(opportunity => (
                    <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="denied">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <XCircle className="text-red-500 h-5 w-5" />
                  Denied Opportunities ({deniedOpportunities.length})
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {deniedOpportunities.map(opportunity => (
                    <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>

      {/* Accept Modal */}
      <Dialog open={acceptOpen} onOpenChange={setAcceptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Opportunity</DialogTitle>
            <DialogDescription>
              {selectedOpportunity?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="notify"
                checked={notifyStudents}
                onCheckedChange={(checked) => setNotifyStudents(checked === true)}
              />
              <label htmlFor="notify" className="text-sm">
                Notify relevant students
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => console.log('Update resources')}>
                <FilePlus className="mr-2 h-4 w-4" /> Update Resources
              </Button>
              <Button variant="secondary" onClick={openMessageComposer}>
                <MessageSquare className="mr-2 h-4 w-4" /> Message Submitter
              </Button>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setAcceptOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAccept}>
                Confirm Accept
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deny Modal */}
      <Dialog open={denyOpen} onOpenChange={setDenyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Opportunity</DialogTitle>
            <DialogDescription>
              {selectedOpportunity?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea 
              placeholder="Reason for denial..."
              value={denialReason}
              onChange={(e) => setDenialReason(e.target.value)}
            />
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDenyOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDenial}>
                Confirm Denial
              </Button>
              <Button onClick={openMessageComposer}>
                <MessageSquare className="mr-2 h-4 w-4" /> Send Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Composer Modal */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message Submitter</DialogTitle>
            <DialogDescription>
              Contact {selectedOpportunity?.student.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Select value={messageTemplate} onValueChange={setMessageTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {messageTemplates.map(template => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Textarea 
              placeholder="Type your message..."
              value={messageTemplate === 'custom' ? customMessage : messageTemplates.find(t => t.value === messageTemplate)?.content || ''}
              onChange={(e) => {
                if (messageTemplate === 'custom') {
                  setCustomMessage(e.target.value);
                }
              }}
              readOnly={messageTemplate !== 'custom'}
            />
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setMessageOpen(false)}>
                Cancel
              </Button>
              <Button onClick={sendMessage}>
                <Send className="mr-2 h-4 w-4" /> Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </Dashboard>
  );
}