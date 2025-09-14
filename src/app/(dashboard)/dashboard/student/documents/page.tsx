"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../../zenith/src/components/ui/card";
import { Button } from "../../../../../../zenith/src/components/ui/button";
import { Input } from "../../../../../../zenith/src/components/ui/input";
import { Label } from "../../../../../../zenith/src/components/ui/label";
import { FileUpload } from "../../../../../../zenith/src/components/ui/file-upload";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Upload, FileText, Link as LinkIcon, Download, Eye, Trash2, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { Alert, AlertDescription, AlertTitle } from "../../../../../../zenith/src/components/ui/alert";
import { showToastPromise } from "@/components/toasts";

interface StudentDocuments {
  academic_report_path: string | null;
  academic_report_url: string | null;
  resume_link: string | null;
  first_name: string;
  last_name: string;
}

export default function StudentDocumentsPage() {
  const { userId, studentId, isLoading: userDataLoading } = useUserData();
  const [documents, setDocuments] = useState<StudentDocuments | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [academicReportFile, setAcademicReportFile] = useState<File[]>([]);
  const [resumeLink, setResumeLink] = useState<string>('');
  const [showUploadNew, setShowUploadNew] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Check if there are any changes to save
  const hasChanges = () => {
    // Check if there's a new academic report file
    const hasNewReport = academicReportFile.length > 0;
    
    // Check if resume link has changed
    const resumeLinkChanged = resumeLink !== (documents?.resume_link || '');
    
    return hasNewReport || resumeLinkChanged;
  };

  // Fetch student documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!studentId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/students/documents?studentId=${studentId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch documents");
        }
        
        const data = await response.json();
        setDocuments(data);
        setResumeLink(data.resume_link || '');
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load documents");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [studentId]);

  // Handle document upload
  const handleDocumentUpload = async () => {
    if (!studentId || !userId) {
      showToastPromise({
        promise: Promise.reject(new Error("Student ID or User ID not found")),
        loadingText: "Error",
        successText: "",
        errorText: "Failed to upload document"
      });
      return;
    }

    if (!hasChanges()) {
      showToastPromise({
        promise: Promise.reject(new Error("No changes to save")),
        loadingText: "Error",
        successText: "",
        errorText: "No changes to save"
      });
      return;
    }

    const uploadPromise = async () => {
      const formData = new FormData();
      formData.append('student_id', studentId.toString());
      formData.append('user_id', userId);
      
      if (academicReportFile.length > 0) {
        formData.append('academic_report', academicReportFile[0]);
      }
      
      if (resumeLink.trim()) {
        formData.append('resume_link', resumeLink.trim());
      }

      const response = await fetch('/api/students/update-profile', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update documents');
      }

      const result = await response.json();
      
      // Refresh documents
      const refreshResponse = await fetch(`/api/students/documents?studentId=${studentId}`);
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setDocuments(data);
        setResumeLink(data.resume_link || '');
      }
      
      setAcademicReportFile([]);
      setShowUploadNew(false);
      return result;
    };

    showToastPromise({
      promise: uploadPromise(),
      loadingText: "Uploading documents...",
      successText: "Documents updated successfully!",
      errorText: "Failed to update documents"
    });
  };

  // Handle delete academic report
   if (userDataLoading || loading) {
    return (
      <div className="space-y-6 h-full flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 flex-shrink-0 group">
          <Link href="/dashboard/student">
            <Button variant="ghost" size="sm" className="h-8 px-2 hover:scale-110 hover:translate-x-[-2px] transition-all duration-200">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-2xl font-semibold font-cal-sans">Documents</h2>
        </div>
        
        <div className="flex-1 overflow-hidden min-h-0">
          <Card className="border-0 shadow-sm ring-1 ring-black/5 m-0.5 h-[calc(100%-6px)] flex flex-col overflow-hidden min-h-0">
            <CardContent className="flex-1 min-h-0 p-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-neutral-400" />
                <p className="text-neutral-500">Loading documents...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 h-full flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 flex-shrink-0 group">
          <Link href="/dashboard/student">
            <Button variant="ghost" size="sm" className="h-8 px-2 hover:scale-110 hover:translate-x-[-2px] transition-all duration-200">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-2xl font-semibold font-cal-sans">Documents</h2>
        </div>
        
        <div className="flex-1 overflow-hidden min-h-0">
          <Card className="border-0 shadow-sm ring-1 ring-black/5 m-0.5 h-[calc(100%-6px)] flex flex-col overflow-hidden min-h-0">
            <CardContent className="flex-1 min-h-0 p-0 flex items-center justify-center">
              <div className="w-full max-w-md">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error loading documents</AlertTitle>
                  <AlertDescription>
                    {error}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-3" 
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 flex-shrink-0 group">
        <Link href="/dashboard/student">
          <Button variant="ghost" size="sm" className="h-8 px-2 hover:scale-110 hover:translate-x-[-2px] transition-all duration-200">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-2xl font-semibold font-cal-sans">Documents</h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        <Card className="border-0 shadow-sm ring-1 ring-black/5 m-0.5 h-[calc(100%-6px)] flex flex-col overflow-hidden min-h-0">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-lg">Manage your documents</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-0">
            <ScrollArea className="h-full px-6 py-3">
              <div className="space-y-6">
                {/* Academic Report Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-neutral-500" />
                      <h3 className="text-md font-semibold">Academic Report</h3>
                    </div>
                    {documents?.academic_report_path && !showUploadNew && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowUploadNew(true)}
                        className="text-xs"
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Upload New
                      </Button>
                    )}
                  </div>
                  
                  {documents?.academic_report_path && !showUploadNew ? (
                    <div className="rounded-xl border border-neutral-100 p-4 bg-white">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-neutral-500" />
                            <span className="text-sm font-medium text-neutral-900">Academic Report</span>
                            <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">Uploaded</span>
                          </div>
                       
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (documents.academic_report_url) {
                                window.open(documents.academic_report_url, '_blank');
                              }
                            }}
                            className="h-7 px-3 text-xs rounded-md hover:bg-neutral-50"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   disabled={isDownloading}
                                   onClick={async () => {
                                     if (!documents.academic_report_url || isDownloading) return;
                                     
                                     setIsDownloading(true);
                                     try {
                                       const response = await fetch(documents.academic_report_url);
                                       const blob = await response.blob();
                                       const url = window.URL.createObjectURL(blob);
                                       const link = document.createElement('a');
                                       link.href = url;
                                       link.download = `academic_report_${documents?.first_name}_${documents?.last_name}.pdf`;
                                       document.body.appendChild(link);
                                       link.click();
                                       document.body.removeChild(link);
                                       window.URL.revokeObjectURL(url);
                                     } catch (error) {
                                       console.error('Download failed:', error);
                                       // Fallback to opening in new tab
                                       window.open(documents.academic_report_url, '_blank');
                                     } finally {
                                       setIsDownloading(false);
                                     }
                                   }}
                                   className="h-7 px-3 text-xs rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                 >
                                   {isDownloading ? (
                                     <>
                                       <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                       Downloading...
                                     </>
                                   ) : (
                                     <>
                                       <Download className="h-3 w-3 mr-1" />
                                       Download
                                     </>
                                   )}
                                 </Button>
                   
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-neutral-100 p-4 bg-white">
                      {showUploadNew && (
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm text-neutral-600">
                            Upload a new academic report (PDF, DOC, DOCX up to 5MB)
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowUploadNew(false);
                              setAcademicReportFile([]);
                            }}
                            className="text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                      <FileUpload
                        multiple={false}
                        accept=".pdf,.doc,.docx"
                        value={academicReportFile}
                        onChange={(files: File[] | undefined) => setAcademicReportFile(files || [])}
                        placeholder="Drop your academic report here or click to upload"
                        helperText="PDF, DOC, DOCX up to 5MB"
                      />
                    </div>
                  )}
                </div>

                {/* Resume Link Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-neutral-500" />
                    <h3 className="text-md font-semibold">Resume Link</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="resume-link" className="text-sm font-medium text-neutral-700">Resume URL</Label>
                      <Input
                        id="resume-link"
                        type="url"
                        placeholder="https://docs.google.com/document/..."
                        value={resumeLink}
                        onChange={(e) => setResumeLink(e.target.value)}
                        className="w-full mt-1"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        Enter a link to your resume (Google Docs, LinkedIn, etc.)
                      </p>
                    </div>
                    
                    {documents?.resume_link && (
                      <div className="rounded-xl border border-neutral-100 p-4 bg-white">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <LinkIcon className="h-4 w-4 text-neutral-500" />
                              <span className="text-sm font-medium text-neutral-900">Resume Link</span>
                              <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">Saved</span>
                            </div>
                            <a
                              href={documents.resume_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-neutral-600 hover:text-neutral-800 underline break-all"
                            >
                              {documents.resume_link}
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                       {/* Save Button */}
                       <div className="pt-4 border-t border-neutral-200">
                         <Button
                           onClick={handleDocumentUpload}
                           disabled={isUploading || !hasChanges()}
                           className="bg-neutral-900 hover:bg-neutral-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                           {isUploading ? (
                             <>
                               <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                               Uploading...
                             </>
                           ) : (
                             <>
                               <Upload className="h-4 w-4 mr-2" />
                               Save Changes
                             </>
                           )}
                         </Button>
                       </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
