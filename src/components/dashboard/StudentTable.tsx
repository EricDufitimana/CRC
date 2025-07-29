import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../zenith/src/components/ui/table";
import { Button } from "../../../zenith/src/components/ui/button";
import { Checkbox } from "../../../zenith/src/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "../../../zenith/src/components/ui/card";
import { Badge } from "../../../zenith/src/components/ui/badge";
import { FileText, User, Eye } from "lucide-react";

interface Student {
  id: string;
  full_name: string;
  email: string;
  major_short: string;
  gpa: number;
  grade: string;
}

export function StudentTable() {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/fetch-students");
        if (!response.ok) {
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
    };
    fetchStudents();
  }, []);

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
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
    if (gpa >= 90 && gpa <= 100) return "bg-gradecolors-90 text-black";
    if (gpa >= 80 && gpa < 90) return "bg-gradecolors-80 text-black";
    if (gpa >= 70 && gpa < 80) return "bg-gradecolors-70 text-black";
    if (gpa >= 60 && gpa < 70) return "bg-gradecolors-60 text-black";
    if (gpa >= 50 && gpa < 60) return "bg-gradecolors-50 text-black";
    if (gpa < 50) return "bg-gradecolors-below text-black";
    return "bg-gray-200 text-gray-700";
  };

  const getGradeColor = (grade: string) => {
    if (grade === "Enrichment Year") return "bg-yearcolors-ey text-black";
    if (grade === "Senior 4") return "bg-yearcolors-s4 text-black";
    if (grade === "Senior 5") return "bg-yearcolors-s5 text-black";
    if (grade === "Senior 6") return "bg-yearcolors-s6 text-black";
    return "bg-gray-200 text-gray-700";
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Students</CardTitle>
          {selectedStudents.length > 0 && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Email Selected ({selectedStudents.length})
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="border border-dashboard-border rounded-dashboard-lg bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 bg-white rounded-2xl">
                  <Checkbox 
                    checked={selectedStudents.length === students.length} 
                    onCheckedChange={handleSelectAll} 
                    className="border-black data-[state=checked]:text-white data-[state=checked]:border-white"
                  />
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
                students.map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="bg-white rounded-2xl">
                      <Checkbox 
                        checked={selectedStudents.includes(student.id)} 
                        onCheckedChange={() => handleSelectStudent(student.id)} 
                        className="border-black data-[state=checked]:text-white data-[state=checked]:border-white"
                      />
                    </TableCell>
                    <TableCell className="font-medium bg-white">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-dashboard-muted rounded-full flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{student.full_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="bg-white">
                      <Badge variant="outline" className={getGradeColor(student.grade)}>
                        {student.grade === "Enrichment Year" ? "EY" : 
                         student.grade === "Senior 4" ? "S4" :
                         student.grade === "Senior 5" ? "S5" :
                         student.grade === "Senior 6" ? "S6" : student.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="bg-white">{student.major_short}</TableCell>
                    <TableCell className="bg-white">
                      <Badge variant="outline" className={getGPAColor(student.gpa)}>
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
        {!loading && students.length === 0 && (
          <div className="text-center py-8 text-dashboard-muted-foreground">
            No students found.
          </div>
        )}
      </CardContent>
    </Card>
  );
} 