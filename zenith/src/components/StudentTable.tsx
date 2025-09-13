import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, User, Mail } from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  major: string;
  gpa: number;
  resumeStatus: "submitted" | "pending" | "reviewed";
}

const mockStudents: Student[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@school.edu",
    major: "Computer Science",
    gpa: 85,
    resumeStatus: "submitted"
  },
  {
    id: "2", 
    name: "Michael Johnson",
    email: "m.johnson@school.edu",
    major: "Mathematics",
    gpa: 92,
    resumeStatus: "reviewed"
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily.davis@school.edu", 
    major: "English Literature",
    gpa: 78,
    resumeStatus: "pending"
  },
  {
    id: "4",
    name: "James Wilson",
    email: "j.wilson@school.edu",
    major: "Physics",
    gpa: 87,
    resumeStatus: "submitted"
  },
  {
    id: "5",
    name: "Lisa Rodriguez",
    email: "l.rodriguez@school.edu",
    major: "Biology",
    gpa: 89,
    resumeStatus: "submitted"
  }
];

export function StudentTable() {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const handleSelectAll = () => {
    if (selectedStudents.length === mockStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(mockStudents.map(s => s.id));
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const getGPAColor = (gpa: number) => {
    if (gpa >= 85) return "text-foreground";
    if (gpa >= 70) return "text-foreground"; 
    return "text-foreground";
  };

  const getResumeStatusBadge = (status: Student["resumeStatus"]) => {
    const variants = {
      submitted: "bg-muted text-foreground",
      pending: "bg-muted text-foreground",
      reviewed: "bg-muted text-foreground"
    };
    
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Students</CardTitle>
          {selectedStudents.length > 0 && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Email Selected ({selectedStudents.length})
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedStudents.length === mockStudents.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Major</TableHead>
              <TableHead>GPA (%)</TableHead>
              <TableHead>View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockStudents.map((student) => (
              <TableRow key={student.id} className="hover:bg-muted/50">
                <TableCell>
                  <Checkbox
                    checked={selectedStudents.includes(student.id)}
                    onCheckedChange={() => handleSelectStudent(student.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {student.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">A</Badge>
                </TableCell>
                <TableCell className="font-medium">{student.major}</TableCell>
                <TableCell>
                  <Badge className="bg-muted text-foreground">
                    {student.gpa}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 gap-1">
                      <FileText className="w-3 h-3" />
                      Report
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 gap-1">
                      <FileText className="w-3 h-3" />
                      Resume
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}