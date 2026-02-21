"use client";

import { User, Eye, FileText, Loader2 } from "lucide-react";
import { Button } from "@/zenith/components/ui/button";
import { Badge } from "@/zenith/components/ui/badge";
import { Checkbox } from "@/zenith/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/zenith/components/ui/table";

interface Student {
  id: string;
  full_name: string;
  email: string | null;
  grade: string | null;
  major_short: string | null;
  gpa: number | string | null;
  academic_report_path?: string | null;
  resume_link?: string | null;
}

interface StudentTableProps {
  students: Student[];
  loading: boolean;
  selectedStudents: Array<{ id: string; email: string }>;
  loadingReportId: string | null;
  onSelectStudent: (studentId: string, studentEmail: string) => void;
  onSelectAll: () => void;
  onViewReport: (studentId: string, studentName: string) => void;
  onViewResume: (studentId: string, studentName: string) => void;
  getGradeColor: (grade: string) => string;
  getGPAColor: (gpa: number) => string;
}

export function StudentTable({
  students,
  loading,
  selectedStudents,
  loadingReportId,
  onSelectStudent,
  onSelectAll,
  onViewReport,
  onViewResume,
  getGradeColor,
  getGPAColor,
}: StudentTableProps) {
  const allSelected = students.length > 0 && selectedStudents.length === students.length;

  return (
    <div className="border border-gray-300/80 rounded-lg bg-white/80 backdrop-blur-sm dark:border-gray-600/80 dark:bg-gray-800/80">
      <Table>
        <TableHeader className="bg-white/80 dark:bg-gray-800/80">
          <TableRow>
            <TableHead className="w-10 bg-white/80 dark:bg-gray-800/80 rounded-lg text-xs py-3">
              <div className="flex items-center justify-center">
                <Checkbox 
                  checked={allSelected} 
                  onCheckedChange={onSelectAll} 
                  className="h-3.5 w-3.5 border-gray-400/50 data-[state=checked]:text-white data-[state=checked]:border-white dark:border-gray-400"
                />
              </div>
            </TableHead>
            <TableHead className="bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 text-xs py-3 pl-3">Name</TableHead>
            <TableHead className="bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 text-xs py-3">Grade</TableHead>
            <TableHead className="bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 text-xs py-3">Major</TableHead>
            <TableHead className="bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 text-xs py-3">GPA</TableHead>
            <TableHead className="bg-white/80 dark:bg-gray-800/80 rounded-lg text-gray-600 dark:text-gray-300 text-xs py-3">View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="bg-white/80 dark:bg-gray-800/80 rounded-2xl">
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                </TableCell>
                <TableCell className="font-medium bg-white/80 dark:bg-gray-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
                  </div>
                </TableCell>
                <TableCell className="bg-white/80 dark:bg-gray-800/80">
                  <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
                </TableCell>
                <TableCell className="bg-white/80 dark:bg-gray-800/80">
                  <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-12 animate-pulse"></div>
                </TableCell>
                <TableCell className="bg-white/80 dark:bg-gray-800/80">
                  <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
                </TableCell>
                <TableCell className="bg-white/80 dark:bg-gray-800/80 rounded-2xl">
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            students.map(student => (
              <TableRow key={student.id}>
                <TableCell className="bg-white/80 dark:bg-gray-800/80 rounded-lg py-3">
                  <div className="flex items-center justify-center">
                    <Checkbox 
                      checked={selectedStudents.some(s => s.id === student.id)} 
                      onCheckedChange={() => onSelectStudent(student.id, student.email || '')} 
                      className="h-3.5 w-3.5 border-gray-400/50 data-[state=checked]:text-white data-[state=checked]:border-white dark:border-gray-400"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium bg-white/80 dark:bg-gray-800/80 text-sm py-5 pl-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3" />
                    </div>
                    <span className="dark:text-white">{student.full_name}</span>
                  </div>
                </TableCell>
                <TableCell className="bg-white/80 dark:bg-gray-800/80 py-3">
                  <Badge variant="outline" className={`${getGradeColor(student.grade || '')} text-xs px-1.5 py-0.5`}>
                    {student.grade || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell className="bg-white/80 dark:bg-gray-800/80 dark:text-white text-sm py-3">
                  {student.major_short || 'N/A'}
                </TableCell>
                <TableCell className="bg-white/80 dark:bg-gray-800/80 py-3">
                  <Badge className={`${getGPAColor(typeof student.gpa === 'number' ? student.gpa : (typeof student.gpa === 'string' ? parseFloat(student.gpa) : 0))} text-xs px-1.5 py-0.5`}>
                    {typeof student.gpa === 'number' ? student.gpa : (typeof student.gpa === 'string' ? parseFloat(student.gpa) : 0)}%
                  </Badge>
                </TableCell>
                <TableCell className="bg-white/80 dark:bg-gray-800/80 rounded-lg py-3">
                  <div className="flex gap-1.5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 h-9 px-3 text-xs dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => onViewReport(student.id, student.full_name)}
                      disabled={loadingReportId === student.id}
                    >
                      {loadingReportId === student.id ? (
                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      ) : (
                        <FileText className="h-2.5 w-2.5" />
                      )}
                      Report
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 h-9 px-3 text-xs dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => onViewResume(student.id, student.full_name)}
                    >
                      <Eye className="h-2.5 w-2.5" />
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
  );
}

