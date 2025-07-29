"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../zenith/src/components/ui/dialog";
import { Button } from "../../../zenith/src/components/ui/button";
import { Badge } from "../../../zenith/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../zenith/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../zenith/src/components/ui/select";
import { Textarea } from "../../../zenith/src/components/ui/textarea";
import { Label } from "../../../zenith/src/components/ui/label";
import { 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  FileText, 
  User, 
  Mail, 
  Calendar,
  Edit,
  Send,
  Download,
  Eye
} from "lucide-react";

interface Session {
  id: string;
  student_id: string;
  admin_id: string;
  title: string;
  essay_link: string;
  word_count: string;
  description: string;
  deadline: string | null;
  submitted_at: string;
  defer: boolean;
  status: string;
  admin_name: string;
  student_name: string;
  student_email: string;
}

interface SessionDetailsDialogProps {
  session: Session | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (session: Session, action: string) => void;
}

export function SessionDetailsDialog({ session, open, onOpenChange, onAction }: SessionDetailsDialogProps) {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [selectedFellow, setSelectedFellow] = useState('');

  // Mock fellows data
  const fellows = [
    { id: '1', name: 'Dr. Sarah Johnson' },
    { id: '2', name: 'Prof. Michael Chen' },
    { id: '3', name: 'Dr. Emily Rodriguez' },
    { id: '4', name: 'Prof. David Thompson' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_review': return <FileText className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAction = () => {
    if (session && selectedAction) {
      onAction(session, selectedAction);
      setSelectedAction('');
      setNotes('');
      setSelectedFellow('');
    }
  };

  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{session.title}</DialogTitle>
              <DialogDescription>
                Session details and management options
              </DialogDescription>
            </div>
            <Badge className={getStatusColor(session.status)}>
              <span className="flex items-center gap-1">
                {getStatusIcon(session.status)}
                {session.status.replace('_', ' ')}
              </span>
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Session Information */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Essay Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-dashboard-muted-foreground">Word Count</Label>
                  <p className="text-lg font-semibold">{session.word_count} words</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-dashboard-muted-foreground">Description</Label>
                  <p className="text-sm">{session.description}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-dashboard-muted-foreground">Essay Link</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(session.essay_link, '_blank')}
                    className="mt-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Essay
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-dashboard-muted-foreground">Name</Label>
                  <p className="font-medium">{session.student_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-dashboard-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-dashboard-muted-foreground" />
                    <p className="text-sm">{session.student_email}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-dashboard-muted-foreground">Student ID</Label>
                  <p className="text-sm font-mono">{session.student_id}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-dashboard-muted-foreground">Submitted</Label>
                  <p className="text-sm">{formatDate(session.submitted_at)}</p>
                </div>
                {session.deadline && (
                  <div>
                    <Label className="text-sm font-medium text-dashboard-muted-foreground">Deadline</Label>
                    <p className="text-sm">{formatDate(session.deadline)}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-dashboard-muted-foreground">Assigned Admin</Label>
                  <p className="text-sm">{session.admin_name}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions and Management */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(session.essay_link, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            {session.status === 'pending' && (
              <Card>
                <CardHeader>
                  <CardTitle>Session Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Action</Label>
                    <Select value={selectedAction} onValueChange={setSelectedAction}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accept">Accept Session</SelectItem>
                        <SelectItem value="postpone">Postpone Session</SelectItem>
                        <SelectItem value="defer">Defer to Another Fellow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedAction === 'accept' && (
                    <div className="space-y-2">
                      <Label>Assign to Fellow</Label>
                      <Select value={selectedFellow} onValueChange={setSelectedFellow}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a CRC fellow" />
                        </SelectTrigger>
                        <SelectContent>
                          {fellows.map((fellow) => (
                            <SelectItem key={fellow.id} value={fellow.id}>
                              {fellow.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedAction === 'defer' && (
                    <div className="space-y-2">
                      <Label>Defer to Fellow</Label>
                      <Select value={selectedFellow} onValueChange={setSelectedFellow}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a different CRC fellow" />
                        </SelectTrigger>
                        <SelectContent>
                          {fellows.map((fellow) => (
                            <SelectItem key={fellow.id} value={fellow.id}>
                              {fellow.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      placeholder="Add any additional notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={handleAction}
                    disabled={!selectedAction || (selectedAction === 'accept' && !selectedFellow) || (selectedAction === 'defer' && !selectedFellow)}
                    className="w-full"
                  >
                    {selectedAction === 'accept' && 'Accept Session'}
                    {selectedAction === 'postpone' && 'Postpone Session'}
                    {selectedAction === 'defer' && 'Defer Session'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {session.status === 'in_review' && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Review Status</span>
                      <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <p className="text-xs text-dashboard-muted-foreground">
                      Estimated completion: 2 days remaining
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {session.status === 'completed' && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Complete</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium">Review completed successfully</span>
                    </div>
                    <p className="text-xs text-dashboard-muted-foreground">
                      Feedback has been sent to the student
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 