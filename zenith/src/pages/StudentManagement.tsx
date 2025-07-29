import { useState } from "react";
import { Search, Filter, Mail, Eye, FileText, User } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

// Mock student data
const mockStudents = [{
  id: "1",
  name: "Sarah Johnson",
  grade: "A",
  major: "Computer Science",
  gpa: 3.8
}, {
  id: "2",
  name: "Michael Chen",
  grade: "B+",
  major: "Business Administration",
  gpa: 3.5
}, {
  id: "3",
  name: "Emily Rodriguez",
  grade: "A-",
  major: "Psychology",
  gpa: 3.7
}, {
  id: "4",
  name: "David Kim",
  grade: "B",
  major: "Engineering",
  gpa: 3.2
}, {
  id: "5",
  name: "Jessica Wilson",
  grade: "A+",
  major: "Marketing",
  gpa: 4.0
}];
const StudentManagement = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailDescription, setEmailDescription] = useState("");
  const [filters, setFilters] = useState({
    grade: "",
    class: "",
    gpaFamily: "",
    crcClass: ""
  });
  const filteredStudents = mockStudents.filter(student => student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.major.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]);
  };
  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student.id));
    }
  };
  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.7) return "bg-green-100 text-green-800";
    if (gpa >= 3.0) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };
  return <div className="min-h-screen bg-background">
      <DashboardHeader isDarkTheme={isDarkTheme} onThemeToggle={() => setIsDarkTheme(!isDarkTheme)} />
      <div className="flex">
        <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} isDarkTheme={isDarkTheme} />
        
        <main className="flex-1 p-6 bg-gray-50">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Student Management</h1>
              <p className="text-muted-foreground">
                Manage student records, grades, and communications
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input placeholder="Search students..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 w-80" />
                </div>

                {/* Filter Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4">
                    <div className="space-y-4">
                      <h4 className="font-medium">Filter Students</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="grade">Grade</Label>
                          <Select value={filters.grade} onValueChange={value => setFilters({
                          ...filters,
                          grade: value
                        })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A+">A+</SelectItem>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="A-">A-</SelectItem>
                              <SelectItem value="B+">B+</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="B-">B-</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="class">Class</Label>
                          <Select value={filters.class} onValueChange={value => setFilters({
                          ...filters,
                          class: value
                        })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="freshman">Freshman</SelectItem>
                              <SelectItem value="sophomore">Sophomore</SelectItem>
                              <SelectItem value="junior">Junior</SelectItem>
                              <SelectItem value="senior">Senior</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="gpaFamily">GPA Family</Label>
                          <Select value={filters.gpaFamily} onValueChange={value => setFilters({
                          ...filters,
                          gpaFamily: value
                        })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select GPA range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="4.0">4.0</SelectItem>
                              <SelectItem value="3.5-3.9">3.5 - 3.9</SelectItem>
                              <SelectItem value="3.0-3.4">3.0 - 3.4</SelectItem>
                              <SelectItem value="below-3.0">Below 3.0</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="crcClass">CRC Class</Label>
                          <Select value={filters.crcClass} onValueChange={value => setFilters({
                          ...filters,
                          crcClass: value
                        })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select CRC class" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fall-2024">Fall 2024</SelectItem>
                              <SelectItem value="spring-2024">Spring 2024</SelectItem>
                              <SelectItem value="summer-2024">Summer 2024</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button className="w-full" onClick={() => console.log("Applying filters:", filters)}>
                        Apply Filters
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Email Selected Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2" disabled={selectedStudents.length === 0}>
                    <Mail className="h-4 w-4" />
                    Email Selected ({selectedStudents.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Email Selected Students</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="Enter email subject" />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" value={emailDescription} onChange={e => setEmailDescription(e.target.value)} placeholder="Enter email content (supports Markdown)" rows={10} className="font-mono" />
                      <p className="text-sm text-muted-foreground mt-1">
                        Supports Markdown formatting
                      </p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Cancel</Button>
                      <Button>Send Email</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Student Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 bg-white rounded-2xl">
                      <Checkbox checked={selectedStudents.length === filteredStudents.length} onCheckedChange={handleSelectAll} />
                    </TableHead>
                    <TableHead className="bg-white">Name</TableHead>
                    <TableHead className="bg-white">Grade</TableHead>
                    <TableHead className="bg-white">Major</TableHead>
                    <TableHead className="bg-white">GPA</TableHead>
                    <TableHead className="bg-white rounded-2xl">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map(student => <TableRow key={student.id}>
                      <TableCell className="bg-white rounded-2xl">
                        <Checkbox checked={selectedStudents.includes(student.id)} onCheckedChange={() => handleSelectStudent(student.id)} />
                      </TableCell>
                      <TableCell className="font-medium bg-white">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          {student.name}
                        </div>
                      </TableCell>
                      <TableCell className="bg-white">
                        <Badge variant="outline">{student.grade}</Badge>
                      </TableCell>
                      <TableCell className="bg-white">{student.major}</TableCell>
                      <TableCell className="bg-white">
                        <Badge className={getGPAColor(student.gpa)}>
                          {(student.gpa * 25).toFixed(0)}%
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
                    </TableRow>)}
                </TableBody>
              </Table>
            </div>

            {filteredStudents.length === 0 && <div className="text-center py-8 text-muted-foreground">
                No students found matching your search criteria.
              </div>}
          </div>
        </main>
      </div>
    </div>;
};
export default StudentManagement;