"use client";

import { useState, useEffect, useMemo } from "react";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { StudentManagementHeader } from "./StudentManagementHeader";
import { StudentSearchBar } from "./StudentSearchBar";
import { StudentFilters } from "./StudentFilters";
import { StudentTable } from "./StudentTable";
import { StudentPagination } from "./StudentPagination";
import { showToastError } from "@/components/toasts/ToastError";

export function StudentManagementContent({ adminEmail }: { adminEmail?: string | null }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  // Fetch data using tRPC
  const { data: students = [] } = useSuspenseQuery(
    trpc.studentManagement.getStudents.queryOptions(undefined)
  );
  const { data: crcClasses = [] } = useSuspenseQuery(
    trpc.studentManagement.getCrcClasses.queryOptions(undefined)
  );

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Array<{id: string, email: string | null}>>([]);
  const [savedSelections, setSavedSelections] = useState<Array<{id: string, email: string | null}>>([]);
  const [filters, setFilters] = useState({ 
    grade: [] as string[], 
    major: [] as string[], 
    gpa: [] as string[], 
    crcClass: [] as string[],
    gender: [] as string[]
  });
  const [loadingReportId, setLoadingReportId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Filter students based on search term and filters
  const filteredStudents = useMemo(() => {
    let filtered = students.filter(student => {
      // Search term filtering (case-insensitive)
      const searchMatch = searchTerm === "" || 
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.major_short?.toLowerCase().includes(searchTerm.toLowerCase());

      // Grade filtering
      const gradeMatch = filters.grade.length === 0 || filters.grade.includes(student.grade || '');

      // Major filtering
      const majorMatch = filters.major.length === 0 || filters.major.includes(student.major_short || '');

      // GPA filtering
      let gpaMatch = true;
      if (filters.gpa.length > 0) {
        const studentGpaNum = typeof student.gpa === 'number' ? student.gpa : (typeof student.gpa === 'string' ? parseFloat(student.gpa) : 0);
        const studentGpa = isNaN(studentGpaNum) ? 0 : studentGpaNum;
        gpaMatch = filters.gpa.some(range => {
          if (range === "below-50") {
            return studentGpa < 50;
          }
          const [min, max] = range.split('-').map(Number);
          return studentGpa >= min && studentGpa <= max;
        });
      }

      // CRC Class filtering - match by class ID
      const crcClassMatch = filters.crcClass.length === 0 || 
        (student.crc_class_id && filters.crcClass.includes(student.crc_class_id));

      // Gender filtering
      const genderMatch = filters.gender.length === 0 || 
        (student.gender && filters.gender.includes(student.gender));

      return searchMatch && gradeMatch && majorMatch && gpaMatch && crcClassMatch && genderMatch;
    });

    // Randomize the filtered students to ensure mix from different grades
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    
    return shuffled;
  }, [students, searchTerm, filters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // Helper functions for multi-select filters
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

  const handleGenderToggle = (gender: string) => {
    setFilters(prev => ({
      ...prev,
      gender: prev.gender.includes(gender) 
        ? prev.gender.filter(g => g !== gender)
        : [...prev.gender, gender]
    }));
  };

  // Student selection handlers
  const handleSelectStudent = (studentId: string, studentEmail: string | null) => {
    setSelectedStudents(prev => {
      const isSelected = prev.some(student => student.id === studentId);
      
      const newSelection = isSelected 
        ? prev.filter(student => student.id !== studentId)
        : [...prev, { id: studentId, email: studentEmail }];
      
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    const allSelected = filteredStudents.every(s =>
      selectedStudents.some(sel => sel.id === s.id)
    );

    if (allSelected) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => ({ id: s.id, email: s.email })));
    }
  };

  const handleSaveSelection = () => {
    if (selectedStudents.length > 0) {
      const allSelections = [...savedSelections];
      selectedStudents.forEach(student => {
        if (!allSelections.some(saved => saved.id === student.id)) {
          allSelections.push(student);
        }
      });
      setSavedSelections(allSelections);
      setSelectedStudents([]);
    }
  };

  const handleClearSavedSelections = () => {
    setSavedSelections([]);
  };

  const handleClearSelection = () => {
    setSelectedStudents([]);
    setFilters({
      grade: [],
      major: [],
      gpa: [],
      crcClass: [],
      gender: []
    });
  };

  const hasActiveFilters = 
    filters.grade.length > 0 ||
    filters.major.length > 0 ||
    filters.gpa.length > 0 ||
    filters.crcClass.length > 0 ||
    filters.gender.length > 0;

  const totalSelections = selectedStudents.length + savedSelections.length;

  // Helper functions for colors
  const getGPAColor = (gpa: number) => {
    if (gpa >= 90 && gpa <= 100) return "bg-gradecolors-90 text-black hover:bg-gradecolors-90";
    if (gpa >= 80 && gpa < 90) return "bg-gradecolors-80 text-black hover:bg-gradecolors-80";
    if (gpa >= 70 && gpa < 80) return "bg-gradecolors-70 text-black hover:bg-gradecolors-70";
    if (gpa >= 60 && gpa < 70) return "bg-gradecolors-60 text-black hover:bg-gradecolors-60";
    if (gpa >= 50 && gpa < 60) return "bg-gradecolors-50 text-black hover:bg-gradecolors-50";
    if (gpa < 50) return "bg-gradecolors-below text-black hover:bg-gradecolors-below";
    return "bg-gray-200 text-gray-700";
  };

  const getGradeColor = (grade: string | null) => {
    if (grade === "Enrichment Year") return "bg-yearcolors-ey text-black";
    if (grade === "Senior 4") return "bg-yearcolors-s4 text-black";
    if (grade === "Senior 5") return "bg-yearcolors-s5 text-black";
    if (grade === "Senior 6") return "bg-yearcolors-s6 text-black";
    return "bg-gray-200 text-gray-700";
  };

  // Handle viewing student report
  const handleViewReport = async (studentId: string, studentName: string) => {
    try {
      setLoadingReportId(studentId);
      
      const student = students.find(s => s.id === studentId);
      if (!student?.academic_report_path) {
        showToastError({
          headerText: "No Report Available",
          paragraphText: `${studentName} has not uploaded an academic report yet.`,
          direction: 'right'
        });
        setLoadingReportId(null);
        return;
      }

      // Use query options to fetch the document URL
      const queryOptions = trpc.studentManagement.getStudentDocuments.queryOptions({ studentId });
      const data = await queryClient.fetchQuery(queryOptions);
      
      if (data.academic_report_url) {
        window.open(data.academic_report_url, '_blank');
      } else {
        showToastError({
          headerText: "Report Not Available",
          paragraphText: `Unable to access ${studentName}'s academic report.`,
          direction: 'right'
        });
      }
    } catch (error: any) {
      console.error('Error viewing report:', error);
      showToastError({
        headerText: "Error Loading Report",
        paragraphText: error?.message || `Failed to load ${studentName}'s academic report. Please try again.`,
        direction: 'right'
      });
    } finally {
      setLoadingReportId(null);
    }
  };

  // Handle viewing student resume
  const handleViewResume = (studentId: string, studentName: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student?.resume_link) {
      showToastError({
        headerText: "No Resume Available",
        paragraphText: `${studentName} has not provided a resume link yet.`,
        direction: 'right'
      });
      return;
    }
    window.open(student.resume_link, '_blank');
  };

  // Handle email sent callback
  const handleEmailSent = () => {
    setSelectedStudents([]);
    setSavedSelections([]);
  };

  // Get unique CRC class names for filtering
  const crcClassNames = useMemo(() => {
    const classMap = new Map<string, string>();
    crcClasses.forEach(c => classMap.set(c.id, c.name));
    return classMap;
  }, [crcClasses]);

  // Update filters to use CRC class names instead of IDs
  const filtersWithClassNames = useMemo(() => {
    return {
      ...filters,
      crcClass: filters.crcClass.map(id => crcClassNames.get(id) || id)
    };
  }, [filters, crcClassNames]);

  return (
    <div className="p-8">
      <div className="space-y-4">
        <StudentManagementHeader />

        {/* Filters and Search */}
        <div className="flex flex-col gap-3 mb-6">
          <StudentSearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCount={selectedStudents.length}
            savedCount={savedSelections.length}
            onSaveSelection={handleSaveSelection}
            onClearSelection={handleClearSelection}
            onClearSaved={handleClearSavedSelections}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={() => {
              setFilters({
                grade: [],
                major: [],
                gpa: [],
                crcClass: [],
                gender: []
              });
            }}
          />
          
          <StudentFilters
            filters={filtersWithClassNames}
            students={students}
            crcClasses={crcClasses}
            onGradeToggle={handleGradeToggle}
            onMajorToggle={handleMajorToggle}
            onGpaToggle={handleGpaToggle}
            onCrcClassToggle={handleCrcClassToggle}
            onGenderToggle={handleGenderToggle}
            onClearGrade={() => setFilters(prev => ({ ...prev, grade: [] }))}
            onClearMajor={() => setFilters(prev => ({ ...prev, major: [] }))}
            onClearGpa={() => setFilters(prev => ({ ...prev, gpa: [] }))}
            onClearCrcClass={() => setFilters(prev => ({ ...prev, crcClass: [] }))}
            onClearGender={() => setFilters(prev => ({ ...prev, gender: [] }))}
            totalSelections={totalSelections}
            selectedStudents={selectedStudents}
            savedSelections={savedSelections}
            onEmailSent={handleEmailSent}
            adminEmail={adminEmail}
          />
        </div>
        
        {/* Student Table */}
        <StudentTable
          students={paginatedStudents as any}
          loading={false}
          selectedStudents={selectedStudents}
          loadingReportId={loadingReportId}
          onSelectStudent={handleSelectStudent}
          onSelectAll={handleSelectAll}
          onViewReport={handleViewReport}
          onViewResume={handleViewResume}
          getGradeColor={getGradeColor}
          getGPAColor={getGPAColor}
        />
        
        {/* Pagination Controls */}
        {filteredStudents.length > 0 && (
          <StudentPagination
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            totalResults={filteredStudents.length}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        )}
        
        {filteredStudents.length === 0 && (
          <div className="text-center py-4 text-sm text-gray-600 dark:text-gray-300">
            {students.length === 0 ? "No students found." : "No students found matching your search criteria."}
          </div>
        )}
      </div>
    </div>
  );
}

