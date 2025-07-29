"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Mail, Eye, FileText, User, X } from "lucide-react";
import { DashboardHeader } from "../../../../../components/dashboard/DashboardHeader";
import { DashboardSidebar } from "../../../../../components/dashboard/DashboardSidebar";
import { Button } from "../../../../../../zenith/src/components/ui/button";
import { Input } from "../../../../../../zenith/src/components/ui/input";
import { Badge } from "../../../../../../zenith/src/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../../../zenith/src/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../../../../zenith/src/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../../../zenith/src/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../../zenith/src/components/ui/select";
import { Label } from "../../../../../../zenith/src/components/ui/label";
import { Textarea } from "../../../../../../zenith/src/components/ui/textarea";
import { Checkbox } from "../../../../../../zenith/src/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import MDEditor from '@uiw/react-md-editor';
import { sendBulkEmails } from "@/actions/sendBulkEmails";
import MarkdownIt from 'markdown-it';


export default function StudentManagement() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Array<{id: string, email: string}>>([]);
  const [savedSelections, setSavedSelections] = useState<Array<{id: string, email: string}>>([]);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailDescription, setEmailDescription] = useState("");
  const [filters, setFilters] = useState({ 
    grade: [] as string[], 
    major: [] as string[], 
    gpa: [] as string[], 
    crcClass: [] as string[] 
  });
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailContent, setEmailContent] = useState("");

  // Filter students based on search term and filters
  const filteredStudents = students.filter(student => {
    // Search term filtering (case-insensitive)
    const searchMatch = searchTerm === "" || 
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.major_short.toLowerCase().includes(searchTerm.toLowerCase());

    // Grade filtering
    const gradeMatch = filters.grade.length === 0 || filters.grade.includes(student.grade);

    // Major filtering
    const majorMatch = filters.major.length === 0 || filters.major.includes(student.major_short);

    // GPA filtering
    let gpaMatch = true;
    if (filters.gpa.length > 0) {
      const studentGpa = student.gpa;
      gpaMatch = filters.gpa.some(range => {
        if (range === "below-50") {
          return studentGpa < 50;
        }
        const [min, max] = range.split('-').map(Number);
        return studentGpa >= min && studentGpa <= max;
      });
    }

    // CRC Class filtering (if student has crc_class property)
    const crcClassMatch = filters.crcClass.length === 0 || 
      (student.crc_class && filters.crcClass.includes(student.crc_class));

    return searchMatch && gradeMatch && majorMatch && gpaMatch && crcClassMatch;
  });

  // Helper functions for multi-select
  const handleGradeToggle = (grade: string) => {
    setFilters(prev => ({
      ...prev,
      grade: prev.grade.includes(grade) 
        ? prev.grade.filter(g => g !== grade)
        : [...prev.grade, grade]
    }));
  };

  const handleMajorToggle = (major: string) => {
    setFilters(prev => ({
      ...prev,
      major: prev.major.includes(major) 
        ? prev.major.filter(m => m !== major)
        : [...prev.major, major]
    }));
  };

  const handleGpaToggle = (gpaRange: string) => {
    setFilters(prev => ({
      ...prev,
      gpa: prev.gpa.includes(gpaRange) 
        ? prev.gpa.filter(g => g !== gpaRange)
        : [...prev.gpa, gpaRange]
    }));
  };

  const handleCrcClassToggle = (crcClass: string) => {
    setFilters(prev => ({
      ...prev,
      crcClass: prev.crcClass.includes(crcClass) 
        ? prev.crcClass.filter(c => c !== crcClass)
        : [...prev.crcClass, crcClass]
    }));
  };

  const handleSelectStudent = (studentId: string, studentEmail: string) => {
    setSelectedStudents(prev => {
      const isSelected = prev.some(student => student.id === studentId);
      if (isSelected) {
        return prev.filter(student => student.id !== studentId);
      } else {
        return [...prev, { id: studentId, email: studentEmail }];
      }
    });
  };
  const handleSelectAll = () => {
    if (filteredStudents.length === selectedStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => ({ id: student.id, email: student.email })));
    }
  };

  // Save current selection to saved selections
  const handleSaveSelection = () => {
    if (selectedStudents.length > 0) {
      // Merge current selections with saved selections, avoiding duplicates
      const allSelections = [...savedSelections];
      selectedStudents.forEach(student => {
        if (!allSelections.some(saved => saved.id === student.id)) {
          allSelections.push(student);
        }
      });
      setSavedSelections(allSelections);
      setSelectedStudents([]); // Clear current selection after saving
    }
  };

  // Clear all saved selections
  const handleClearSavedSelections = () => {
    setSavedSelections([]);
  };

  // Get total selections (current + saved)
  const totalSelections = selectedStudents.length + savedSelections.length;

  const getGPAColor = (gpa: number) => {
    if (gpa >= 90 && gpa <=100) return "bg-gradecolors-90 text-black";
    if (gpa >= 80 && gpa <90) return "bg-gradecolors-80 text-black";
    if (gpa >= 70 && gpa <80) return "bg-gradecolors-70 text-black";
    if (gpa >= 60 && gpa <70) return "bg-gradecolors-60 text-black";
    if (gpa >= 50 && gpa <60) return "bg-gradecolors-50 text-black";
    if (gpa <50) return "bg-gradecolors-below text-black";
    return "bg-gray-200 text-gray-700";
  };
  const getGradeColor = (grade: string) => {
    if (grade === "Enrichment Year") return "bg-yearcolors-ey text-black";
    if (grade === "Senior 4") return "bg-yearcolors-s4 text-black";
    if (grade === "Senior 5") return "bg-yearcolors-s5 text-black";
    if (grade === "Senior 6") return "bg-yearcolors-s6 text-black";
    return "bg-gray-200 text-gray-700";
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try{
        setLoading(true);
        const response = await fetch("/api/fetch-students");
        if(!response.ok){
          console.log("Failed to fetch students");
          return;
        }
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    }
        fetchStudents()
  }, []);

  const handleSendEmail = async (prevState: any, formData: FormData) => {
    try {
      // Extract emails from selected students
      const recipientEmails = [...selectedStudents, ...savedSelections].map(student => student.email);
      const md = new MarkdownIt();
      // Get data from FormData
      const subject = formData.get('subject') as string;
      const content = md.render(formData.get('content') as string);
      
      // Use server action with admin client
      const result = await sendBulkEmails(recipientEmails, subject, content);
      
      return result;
    } catch (error) {
      console.error("Error sending email:", error);
      return {
        success: false,
        message: "Failed to send email",
      }
    }
  };
  
  const [state, setState] = useState({
    success: false,
    message: "",
    isPending: false,
  });

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isPending: true }));
    const formData = new FormData(e.currentTarget);
    const result = await handleSendEmail(state, formData);
    setState({ ...result, isPending: false });
  };

  // Clear form when email is sent successfully
  useEffect(() => {
    if (state.success) {
      setEmailSubject("");
      setEmailContent("");
      setSelectedStudents([]);
      setSavedSelections([]);
      console.log("Email sent successfully");
    }
    else{
      console.log("Email failed to send");
    }
  }, [state.success]);

  console.log("Selected Students with emails:", selectedStudents);
  return (
    <div className="min-h-screen bg-slate-50 flex w-full">
      <DashboardSidebar 
        isDarkTheme={isDarkTheme} 
      />
      <div className="flex-1 flex flex-col">
        <DashboardHeader isDarkTheme={isDarkTheme} onThemeToggle={() => setIsDarkTheme(!isDarkTheme)} />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full bg-slate-50">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-dashboard-foreground">Student Management</h1>
              <p className="text-dashboard-muted-foreground">
                Manage student records, grades, and communications
              </p>
            </div>

                        {/* Filters and Search */}
            <div className="flex flex-col gap-3 mb-6">
              {/* Search Bar - Full Width */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dashboard-muted-foreground" />
                <Input
                  placeholder="Search students by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dashboard-muted-foreground hover:text-dashboard-foreground cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* Filters Row - Responsive Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full gap-2 justify-between">
                      <span className="hidden sm:inline">Grade</span>
                      <span className="sm:hidden">Grade</span>
                      {filters.grade.length > 0 && (
                        <Badge variant="outline" className="ml-1">
                          {filters.grade.length}
                        </Badge>
                      )}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Select Grades</h4>
                      
                      {/* Selected Grades Display */}
                      {filters.grade.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {filters.grade.map(grade => (
                            <Badge key={grade} variant="outline" className="gap-1">
                              {grade}
                              <button
                                onClick={() => handleGradeToggle(grade)}
                                className="ml-1 hover:bg-gray-200 rounded-full w-4 h-4 flex items-center justify-center"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilters(prev => ({ ...prev, grade: [] }))}
                            className="h-6 px-2 text-xs"
                          >
                            Clear All
                          </Button>
                        </div>
                      )}
                      
                      {/* Grade Options */}
                      <div className="grid grid-cols-2 gap-2">
                        {["Enrichment Year", "Senior 4", "Senior 5", "Senior 6"].map(grade => (
                          <Button
                            key={grade}
                            variant="outline"
                            size="sm"
                            onClick={() => handleGradeToggle(grade)}
                            className={`justify-start cursor-pointer ${filters.grade.includes(grade) ? 'bg-black text-white border-black hover:bg-black hover:text-white' : 'hover:bg-transparent'}`}
                          >
                            {grade}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full gap-2 justify-between">
                      <span className="hidden sm:inline">Major</span>
                      <span className="sm:hidden">Major</span>
                      {filters.major.length > 0 && (
                        <Badge variant="outline" className="ml-1">
                          {filters.major.length}
                        </Badge>
                      )}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Select Majors</h4>
                      
                      {/* Selected Majors Display */}
                      {filters.major.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {filters.major.map(major => (
                            <Badge key={major} variant="outline" className="gap-1">
                              {major}
                              <button
                                onClick={() => handleMajorToggle(major)}
                                className="ml-1 hover:bg-gray-200 rounded-full w-4 h-4 flex items-center justify-center"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilters(prev => ({ ...prev, major: [] }))}
                            className="h-6 px-2 text-xs"
                          >
                            Clear All
                          </Button>
                        </div>
                      )}
                      
                      {/* Major Options */}
                      <div className="grid grid-cols-2 gap-2">
                        {["MPC", "HGL", "PCB", "MCE", "MEG"].map(major => (
                          <Button
                            key={major}
                            variant="outline"
                            size="sm"
                            onClick={() => handleMajorToggle(major)}
                            className={`justify-start cursor-pointer ${filters.major.includes(major) ? 'bg-black text-white border-black hover:bg-black hover:text-white' : 'hover:bg-transparent'}`}
                          >
                            {major}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full gap-2 justify-between">
                      <span className="hidden sm:inline">GPA</span>
                      <span className="sm:hidden">GPA</span>
                      {filters.gpa.length > 0 && (
                        <Badge variant="outline" className="ml-1">
                          {filters.gpa.length}
                        </Badge>
                      )}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Select GPA Ranges</h4>
                      
                      {/* Selected GPA Ranges Display */}
                      {filters.gpa.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {filters.gpa.map(gpa => (
                            <Badge key={gpa} variant="outline" className="gap-1">
                              {gpa === "below-50" ? "Below 50%" : `${gpa}%`}
                              <button
                                onClick={() => handleGpaToggle(gpa)}
                                className="ml-1 hover:bg-gray-200 rounded-full w-4 h-4 flex items-center justify-center"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilters(prev => ({ ...prev, gpa: [] }))}
                            className="h-6 px-2 text-xs"
                          >
                            Clear All
                          </Button>
                        </div>
                      )}
                      
                      {/* GPA Range Options */}
                      <div className="grid grid-cols-2 gap-2">
                        {["90-100", "80-89", "70-79", "60-69", "50-59", "below-50"].map(gpa => (
                          <Button
                            key={gpa}
                            variant="outline"
                            size="sm"
                            onClick={() => handleGpaToggle(gpa)}
                            className={`justify-start cursor-pointer ${filters.gpa.includes(gpa) ? 'bg-black text-white border-black hover:bg-black hover:text-white' : 'hover:bg-transparent'}`}
                          >
                            {gpa === "below-50" ? "Below 50%" : `${gpa}%`}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full gap-2 justify-between">
                      <span className="hidden sm:inline">CRC Class</span>
                      <span className="sm:hidden">CRC</span>
                      {filters.crcClass.length > 0 && (
                        <Badge variant="outline" className="ml-1">
                          {filters.crcClass.length}
                        </Badge>
                      )}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Select CRC Classes</h4>
                      
                      {/* Selected CRC Classes Display */}
                      {filters.crcClass.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {filters.crcClass.map(crcClass => (
                            <Badge key={crcClass} variant="outline" className="gap-1">
                              {crcClass}
                              <button
                                onClick={() => handleCrcClassToggle(crcClass)}
                                className="ml-1 hover:bg-gray-200 rounded-full w-4 h-4 flex items-center justify-center"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilters(prev => ({ ...prev, crcClass: [] }))}
                            className="h-6 px-2 text-xs"
                          >
                            Clear All
                          </Button>
                        </div>
                      )}
                      
                      {/* CRC Class Options */}
                      <div className="grid grid-cols-1 gap-2">
                        {["Fall 2024", "Spring 2024", "Summer 2024", "Fall 2023", "Spring 2023"].map(crcClass => (
                          <Button
                            key={crcClass}
                            variant="outline"
                            size="sm"
                            onClick={() => handleCrcClassToggle(crcClass)}
                            className={`justify-start cursor-pointer ${filters.crcClass.includes(crcClass) ? 'bg-black text-white border-black hover:bg-black hover:text-white' : 'hover:bg-transparent'}`}
                          >
                            {crcClass}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2" disabled={totalSelections === 0}>
                      <Mail className="h-4 w-4" />
                      <span className="hidden sm:inline">Email ({totalSelections})</span>
                      <span className="sm:hidden">Email</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Email Selected Students</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="subject">Subject</Label>
                          <Input 
                            id="subject" 
                            name="subject"
                            value={emailSubject} 
                            onChange={e => setEmailSubject(e.target.value)} 
                            placeholder="Enter email subject" 
                            required
                          />
                        </div>
                        <div data-color-mode="light">
                          <Label htmlFor="email-content">Description</Label>
                          <input 
                            type="hidden" 
                            name="content" 
                            value={emailContent} 
                          />
                          <MDEditor 
                            value={emailContent} 
                            onChange={(value) => setEmailContent(value || "")}
                            preview="edit"
                            height={300}
                            id='email-content' 
                            textareaProps={{
                              placeholder: "Enter email content...",
                            }}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" type="button">Cancel</Button>
                          <Button 
                            type="submit"
                            disabled={!emailSubject || !emailContent || state.isPending}
                          >
                            {state.isPending ? "Sending..." : "Send Email"}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {/* Student Table */}
            <div className="border border-dashboard-border rounded-dashboard-lg bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 bg-white rounded-2xl">
                      <Checkbox checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length} onCheckedChange={handleSelectAll} className="border-black data-[state=checked]:text-white data-[state=checked]:border-white"/>
                    </TableHead>
                    <TableHead className="bg-white">Name</TableHead>
                    <TableHead className="bg-white">Grade</TableHead>
                    <TableHead className="bg-white">Major</TableHead>
                    <TableHead className="bg-white">GPA</TableHead>
                    <TableHead className="bg-white rounded-2xl">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    // Loading skeleton for table rows only
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell className="bg-white rounded-2xl">
                          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell className="font-medium bg-white">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                          </div>
                        </TableCell>
                        <TableCell className="bg-white">
                          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </TableCell>
                        <TableCell className="bg-white">
                          <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
                        </TableCell>
                        <TableCell className="bg-white">
                          <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </TableCell>
                        <TableCell className="bg-white rounded-2xl">
                          <div className="flex gap-2">
                            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    filteredStudents.map(student => (
                      <TableRow key={student.id}>
                        <TableCell className="bg-white rounded-2xl">
                          <Checkbox checked={selectedStudents.some(s => s.id === student.id)} onCheckedChange={() => handleSelectStudent(student.id, student.email)} className="border-black data-[state=checked]:text-white data-[state=checked]:border-white"/>
                        </TableCell>
                        <TableCell className="font-medium bg-white">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-dashboard-muted rounded-full flex items-center justify-center">
                              <User className="h-4 w-4" />
                            </div>
                            {student.full_name}
                          </div>
                        </TableCell>
                        <TableCell className="bg-white">
                          <Badge variant="outline" className={getGradeColor(student.grade)}>{student.grade}</Badge>
                        </TableCell>
                        <TableCell className="bg-white ">{student.major_short}</TableCell>
                        <TableCell className="bg-white">
                          <Badge className={getGPAColor(student.gpa)}>
                            {student.gpa}%
                          </Badge>
                        </TableCell>
                        <TableCell className="bg-white rounded-2xl">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-1">
                              <FileText className="h-3 w-3" />
                              Report
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Eye className="h-3 w-3" />
                              Resume
                            </Button>

                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {!loading && filteredStudents.length === 0 && (
              <div className="text-center py-8 text-dashboard-muted-foreground">
                {students.length === 0 ? "No students found." : "No students found matching your search criteria."}
              </div>
            )}
          </div>
        </main>
        
        {/* Fixed Save Button - Lower Right Corner */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleSaveSelection}
            disabled={selectedStudents.length === 0}
            className="bg-black hover:bg-gray-800 text-white shadow-lg"
          >
            Save ({selectedStudents.length})
          </Button>
        </div>
        
        {/* Fixed Saved Selections Display */}
        {savedSelections.length > 0 && (
          <div className="fixed bottom-20 right-6 z-40 bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800">
                  Saved: {savedSelections.length} students
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearSavedSelections}
                className="text-blue-600 hover:text-blue-700 h-6 px-2"
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 