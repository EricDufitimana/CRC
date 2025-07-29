"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../zenith/src/components/ui/card";
import { Button } from "../../../zenith/src/components/ui/button";
import { Badge } from "../../../zenith/src/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../../zenith/src/components/ui/dialog";
import { Calendar, CalendarContent, CalendarDay, CalendarGrid, CalendarHeader, CalendarHead, CalendarRow, CalendarTitle } from "../ui/calendar";
import { 
  Calendar as CalendarIcon, 
  ExternalLink, 
  Plus, 
  Settings, 
  RefreshCw,
  Clock,
  CheckCircle,
  FileText,
  User,
  Mail
} from "lucide-react";

interface Session {
  id: string;
  title: string;
  student_name: string;
  student_email: string;
  deadline: string | null;
  submitted_at: string;
  status: string;
  essay_link: string;
  word_count: string;
  description: string;
}

interface GoogleCalendarIntegrationProps {
  sessions: Session[];
  onSessionClick: (session: Session) => void;
}

export function GoogleCalendarIntegration({ sessions, onSessionClick }: GoogleCalendarIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock Google Calendar connection status
  useEffect(() => {
    // In a real app, this would check if the user has connected their Google Calendar
    setIsConnected(false);
  }, []);

  const connectGoogleCalendar = () => {
    setLoading(true);
    // Simulate Google Calendar OAuth flow
    setTimeout(() => {
      setIsConnected(true);
      setLoading(false);
      // In a real app, this would redirect to Google OAuth
    }, 2000);
  };

  const syncCalendar = () => {
    setLoading(true);
    // Simulate syncing calendar events
    setTimeout(() => {
      const mockEvents = sessions.map(session => ({
        id: session.id,
        title: `Review: ${session.title}`,
        start: session.deadline ? new Date(session.deadline) : new Date(session.submitted_at),
        end: session.deadline ? new Date(new Date(session.deadline).getTime() + 60 * 60 * 1000) : new Date(new Date(session.submitted_at).getTime() + 60 * 60 * 1000),
        color: getStatusColor(session.status),
        session: session
      }));
      setCalendarEvents(mockEvents);
      setLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#fbbf24'; // yellow
      case 'in_review': return '#3b82f6'; // blue
      case 'completed': return '#10b981'; // green
      default: return '#6b7280'; // gray
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

  const getSessionsForDate = (date: Date) => {
    return sessions.filter(session => {
      const sessionDate = session.deadline ? new Date(session.deadline) : new Date(session.submitted_at);
      return sessionDate.toDateString() === date.toDateString();
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Google Calendar Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Google Calendar Integration
              </CardTitle>
              <CardDescription>
                Sync your sessions with Google Calendar for better scheduling
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              {isConnected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncCalendar}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Sync
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 mx-auto text-dashboard-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-dashboard-foreground mb-2">
                Connect Google Calendar
              </h3>
              <p className="text-sm text-dashboard-muted-foreground mb-4">
                Sync your sessions with Google Calendar to manage your schedule more effectively
              </p>
              <Button onClick={connectGoogleCalendar} disabled={loading}>
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Connect Google Calendar
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">Connected to Google Calendar</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Pending Sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>In Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Completed</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>Session Calendar</CardTitle>
          <CardDescription>
            View and manage your sessions in a calendar format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar className="w-full">
            <CalendarHeader>
              <CalendarTitle>July 2024</CalendarTitle>
            </CalendarHeader>
            <CalendarGrid>
              <CalendarHead>
                <CalendarRow>
                  <CalendarDay>Sun</CalendarDay>
                  <CalendarDay>Mon</CalendarDay>
                  <CalendarDay>Tue</CalendarDay>
                  <CalendarDay>Wed</CalendarDay>
                  <CalendarDay>Thu</CalendarDay>
                  <CalendarDay>Fri</CalendarDay>
                  <CalendarDay>Sat</CalendarDay>
                </CalendarRow>
              </CalendarHead>
              <CalendarContent>
                {/* This is a simplified calendar view - in a real app, you'd use a proper calendar library */}
                <div className="p-8 text-center">
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 35 }, (_, i) => {
                      const date = new Date(2024, 6, 1 + i);
                      const daySessions = getSessionsForDate(date);
                      const isToday = date.toDateString() === new Date().toDateString();
                      
                      return (
                        <div
                          key={i}
                          className={`p-2 min-h-[80px] border rounded-md cursor-pointer hover:bg-dashboard-background transition-colors ${
                            isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                          }`}
                          onClick={() => setSelectedDate(date)}
                        >
                          <div className="text-sm font-medium mb-1">
                            {date.getDate()}
                          </div>
                          {daySessions.length > 0 && (
                            <div className="space-y-1">
                              {daySessions.slice(0, 2).map((session) => (
                                <div
                                  key={session.id}
                                  className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSessionClick(session);
                                  }}
                                >
                                  {session.title.substring(0, 15)}...
                                </div>
                              ))}
                              {daySessions.length > 2 && (
                                <div className="text-xs text-dashboard-muted-foreground">
                                  +{daySessions.length - 2} more
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CalendarContent>
            </CalendarGrid>
          </Calendar>
        </CardContent>
      </Card>

      {/* Selected Date Sessions */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>Sessions for {formatDate(selectedDate)}</CardTitle>
          </CardHeader>
          <CardContent>
            {getSessionsForDate(selectedDate).length > 0 ? (
              <div className="space-y-3">
                {getSessionsForDate(selectedDate).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-dashboard-background cursor-pointer"
                    onClick={() => onSessionClick(session)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getStatusColor(session.status)} bg-opacity-20`}>
                        {getStatusIcon(session.status)}
                      </div>
                      <div>
                        <h4 className="font-medium text-dashboard-foreground">
                          {session.title}
                        </h4>
                        <p className="text-sm text-dashboard-muted-foreground">
                          {session.student_name} • {session.word_count} words
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-dashboard-muted-foreground">
                <CalendarIcon className="h-8 w-8 mx-auto mb-2" />
                <p>No sessions scheduled for this date</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Google Calendar Settings</DialogTitle>
            <DialogDescription>
              Configure your Google Calendar integration preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Auto-sync frequency</label>
              <select className="w-full p-2 border rounded-md">
                <option>Every 15 minutes</option>
                <option>Every hour</option>
                <option>Every 6 hours</option>
                <option>Daily</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Calendar to sync with</label>
              <select className="w-full p-2 border rounded-md">
                <option>Primary Calendar</option>
                <option>Work Calendar</option>
                <option>Create new calendar</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="notifications" className="rounded" />
              <label htmlFor="notifications" className="text-sm">
                Send notifications for upcoming sessions
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowSettings(false)}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 