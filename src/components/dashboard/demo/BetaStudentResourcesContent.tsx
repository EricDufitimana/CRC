"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/zenith/components/ui/card";
import { Button } from "@/zenith/components/ui/button";
import { Input } from "@/zenith/components/ui/input";
import { Label } from "@/zenith/components/ui/label";
import { ScrollArea } from "@/zenith/components/ui/scroll-area";
import { FileText, Link as LinkIcon, Download, Eye, Upload } from "lucide-react";
import { showToastError } from "@/components/toasts/ToastError";

export function BetaStudentResourcesContent() {
  const [resumeLink, setResumeLink] = useState("https://docs.google.com/document/d/demo-resume-link");
  
  const handleAction = () => {
    showToastError({
      headerText: "Action Restricted",
      paragraphText: "This action is not available in the preview session.",
      direction: "right"
    });
  };

  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between flex-shrink-0">
        <h2 className="text-2xl font-semibold font-cal-sans">Resources & Documents</h2>
      </div>

      <div className="flex-1 overflow-hidden min-h-0">
        <Card className="border-0 shadow-sm ring-1 ring-black/5 h-full flex flex-col overflow-hidden">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-lg">Manage your academic files</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-0">
            <ScrollArea className="h-full px-6 py-3">
              <div className="space-y-8">
                {/* Academic Report Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <h3 className="text-md font-semibold">Academic Report</h3>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAction}
                      className="text-xs"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Upload New
                    </Button>
                  </div>
                  
                  <div className="rounded-xl border border-neutral-100 p-4 bg-gray-50/50">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-md border border-gray-200">
                          <FileText className="h-4 w-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Academic_Report_Term1.pdf</p>
                          <p className="text-xs text-gray-500">Uploaded on February 12, 2026</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleAction} className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleAction} className="h-8 w-8 p-0">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Downloads Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                        <Download className="h-5 w-5" />
                      </div>
                      <h3 className="text-md font-semibold">Program Resources</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                            { name: "CRC Handbook 2026", size: "1.2 MB", type: "PDF" },
                            { name: "College List Template", size: "450 KB", type: "XLSX" },
                            { name: "Essay Writing Guide", size: "890 KB", type: "PDF" },
                            { name: "Financial Aid FAQ", size: "320 KB", type: "DOCX" }
                        ].map((res, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white hover:border-violet-200 transition-colors group cursor-pointer" onClick={handleAction}>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-violet-50 transition-colors">
                                        <FileText className="h-4 w-4 text-gray-400 group-hover:text-violet-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{res.name}</p>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">{res.type} • {res.size}</p>
                                    </div>
                                </div>
                                <Download className="h-3.5 w-3.5 text-gray-300 group-hover:text-violet-500" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resume Link Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                      <LinkIcon className="h-5 w-5" />
                    </div>
                    <h3 className="text-md font-semibold">Resume Link</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="resume-link" className="text-sm font-medium text-neutral-700">Resume URL</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                            id="resume-link"
                            type="url"
                            placeholder="https://docs.google.com/document/..."
                            value={resumeLink}
                            onChange={(e) => setResumeLink(e.target.value)}
                            className="flex-1 rounded-xl"
                        />
                        <Button onClick={handleAction} className="rounded-xl bg-black text-white hover:bg-black/90">
                           Save
                        </Button>
                      </div>
                      <p className="text-xs text-neutral-500 mt-2">
                        Linking your resume allows CRC counselors to review and provide feedback directly.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
