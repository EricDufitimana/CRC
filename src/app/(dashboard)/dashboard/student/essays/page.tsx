"use client";

import { useState, useEffect } from "react";
import { StudentSidebar } from "../../../../../components/dashboard/StudentSidebar";
import { DashboardHeader } from "../../../../../components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../zenith/src/components/ui/card";
import { Button } from "../../../../../../zenith/src/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../../../zenith/src/components/ui/dialog";
import { Input } from "../../../../../../zenith/src/components/ui/input";
import { Textarea } from "../../../../../../zenith/src/components/ui/textarea";
import { Label } from "../../../../../../zenith/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../../zenith/src/components/ui/select";
import { FileText, Upload, CheckCircle, Clock } from "lucide-react";

export default function StudentEssays() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [submitEssayOpen, setSubmitEssayOpen] = useState(false);
  const [essayForm, setEssayForm] = useState({
    title: "",
    description: "",
    deadline: "",
    crcFellow: "",
    googleDocsLink: "",
    sessionDuration: ""
  });

  const [crcFellows, setCrcFellows] = useState<Array<{id: string, name: string, specialization: string}>>([]);

  const handleEssayFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEssayForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCrcFellowChange = (value: string) => {
    setEssayForm(prev => ({ ...prev, crcFellow: value }));
  };

  const handleSessionDurationChange = (duration: string) => {
    setEssayForm(prev => ({ ...prev, sessionDuration: duration }));
  };

  const sessionDurations = [
    { value: "20", label: "20 min", description: "Quick review" },
    { value: "40", label: "40 min", description: "Standard session" },
    { value: "60", label: "60 min", description: "Comprehensive review" }
  ];

  const handleSubmitEssay = async () => {
    try {
      console.log("Submitting essay:", essayForm);
      // TODO: Implement actual submission
      setSubmitEssayOpen(false);
      setEssayForm({
        title: "",
        description: "",
        deadline: "",
        crcFellow: "",
        googleDocsLink: "",
        sessionDuration: ""
      });
    } catch (error) {
      console.error("Error submitting essay:", error);
    }
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Essays</h1>
            <p className="text-gray-600">Submit essays and track their review status</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Essay Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No essays submitted yet</p>
                    <p className="text-sm">Submit your first essay for review!</p>
                    <Button 
                      className="mt-4 bg-green-600 hover:bg-green-700"
                      onClick={() => setSubmitEssayOpen(true)}
                    >
                      Submit Essay
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setSubmitEssayOpen(true)}
                  >
                    Submit New Essay
                  </Button>
                  <Button variant="outline" className="w-full">
                    View Guidelines
                  </Button>
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
          <div className="space-y-4">
            <div>
              <Label htmlFor="essay-title">Essay Title</Label>
              <Input
                id="essay-title"
                name="title"
                value={essayForm.title}
                onChange={handleEssayFormChange}
                placeholder="Enter your essay title"
                required
              />
            </div>
            <div>
              <Label htmlFor="essay-description">Description</Label>
              <Textarea
                id="essay-description"
                name="description"
                value={essayForm.description}
                onChange={handleEssayFormChange}
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
                value={essayForm.deadline}
                onChange={handleEssayFormChange}
              />
            </div>
            <div>
              <Label htmlFor="crc-fellow">CRC Fellow</Label>
              <Select value={essayForm.crcFellow} onValueChange={handleCrcFellowChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a CRC Fellow" />
                </SelectTrigger>
                <SelectContent>
                  {crcFellows.map((fellow) => (
                    <SelectItem key={fellow.id} value={fellow.id}>
                      <div>
                        <div className="font-medium">{fellow.name}</div>
                        <div className="text-sm text-gray-500">{fellow.specialization}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="google-docs-link">Google Docs Link</Label>
              <Input
                id="google-docs-link"
                name="googleDocsLink"
                value={essayForm.googleDocsLink}
                onChange={handleEssayFormChange}
                type="url"
                placeholder="https://docs.google.com/document/d/..."
                required
              />
            </div>
            <div>
              <Label>Session Duration</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {sessionDurations.map((duration) => (
                  <div
                    key={duration.value}
                    onClick={() => handleSessionDurationChange(duration.value)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      essayForm.sessionDuration === duration.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`font-semibold text-lg ${
                        essayForm.sessionDuration === duration.value ? 'text-orange-600' : 'text-gray-900'
                      }`}>
                        {duration.label}
                      </div>
                      <div className={`text-sm ${
                        essayForm.sessionDuration === duration.value ? 'text-orange-500' : 'text-gray-500'
                      }`}>
                        {duration.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setSubmitEssayOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEssay} className="bg-green-600 hover:bg-green-700">
              Submit Essay
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 