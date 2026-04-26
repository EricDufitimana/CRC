"use client";

import { useState, useEffect, useMemo } from "react";
import { StudentManagementHeader } from "../admin/student-management/StudentManagementHeader";
import { StudentSearchBar } from "../admin/student-management/StudentSearchBar";
import { StudentFilters } from "../admin/student-management/StudentFilters";
import { StudentTable } from "../admin/student-management/StudentTable";
import { StudentPagination } from "../admin/student-management/StudentPagination";
import { showToastError } from "@/components/toasts/ToastError";

// Dummy data for Demo
const dummyStudents = [
  { id: "1", full_name: "John Doe", email: "john@example.com", grade: "Senior 6", major_short: "MCB", gpa: 85, crc_class_id: "class1", gender: "Male" },
  { id: "2", full_name: "Jane Smith", email: "jane@example.com", grade: "Senior 5", major_short: "PCM", gpa: 92, crc_class_id: "class2", gender: "Female" },
  { id: "3", full_name: "Alex Johnson", email: "alex@example.com", grade: "Senior 4", major_short: "MPC", gpa: 78, crc_class_id: "class1", gender: "Male" },
  { id: "4", full_name: "Sarah Williams", email: "sarah@example.com", grade: "Enrichment Year", major_short: "HEG", gpa: 88, crc_class_id: "class3", gender: "Female" },
  { id: "5", full_name: "Michael Brown", email: "michael@example.com", grade: "Senior 6", major_short: "BCG", gpa: 65, crc_class_id: "class2", gender: "Male" },
  { id: "6", full_name: "Emily Davis", email: "emily@example.com", grade: "Senior 5", major_short: "MEG", gpa: 95, crc_class_id: "class3", gender: "Female" },
  { id: "7", full_name: "David Wilson", email: "david@example.com", grade: "Senior 4", major_short: "PCB", gpa: 82, crc_class_id: "class1", gender: "Male" },
  { id: "8", full_name: "Olivia Taylor", email: "olivia@example.com", grade: "Enrichment Year", major_short: "LKK", gpa: 45, crc_class_id: "class2", gender: "Female" },
  { id: "9", full_name: "James Anderson", email: "james@example.com", grade: "Senior 6", major_short: "MCB", gpa: 72, crc_class_id: "class1", gender: "Male" },
  { id: "10", full_name: "Sophia Martinez", email: "sophia@example.com", grade: "Senior 5", major_short: "MPC", gpa: 89, crc_class_id: "class3", gender: "Female" },
];

const dummyCrcClasses = [
  { id: "class1", name: "CRC Alpha" },
  { id: "class2", name: "CRC Beta" },
  { id: "class3", name: "CRC Gamma" },
];

export function BetaStudentManagementContent() {
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
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const filteredStudents = useMemo(() => {
    return dummyStudents.filter(student => {
      const searchMatch = searchTerm === "" || 
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const gradeMatch = filters.grade.length === 0 || filters.grade.includes(student.grade || '');
      const majorMatch = filters.major.length === 0 || filters.major.includes(student.major_short || '');
      
      let gpaMatch = true;
      if (filters.gpa.length > 0) {
        gpaMatch = filters.gpa.some(range => {
          if (range === "below-50") return student.gpa < 50;
          const [min, max] = range.split('-').map(Number);
          return student.gpa >= min && student.gpa <= max;
        });
      }

      const crcClassMatch = filters.crcClass.length === 0 || filters.crcClass.includes(student.crc_class_id);
      const genderMatch = filters.gender.length === 0 || filters.gender.includes(student.gender);

      return searchMatch && gradeMatch && majorMatch && gpaMatch && crcClassMatch && genderMatch;
    });
  }, [searchTerm, filters]);

  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  const handleGradeToggle = (grade: string) => {
    setFilters(prev => ({ ...prev, grade: prev.grade.includes(grade) ? prev.grade.filter(g => g !== grade) : [...prev.grade, grade] }));
  };

  const handleMajorToggle = (major: string) => {
    setFilters(prev => ({ ...prev, major: prev.major.includes(major) ? prev.major.filter(m => m !== major) : [...prev.major, major] }));
  };

  const handleGpaToggle = (gpaRange: string) => {
    setFilters(prev => ({ ...prev, gpa: prev.gpa.includes(gpaRange) ? prev.gpa.filter(g => g !== gpaRange) : [...prev.gpa, gpaRange] }));
  };

  const handleCrcClassToggle = (crcClass: string) => {
    setFilters(prev => ({ ...prev, crcClass: prev.crcClass.includes(crcClass) ? prev.crcClass.filter(c => c !== crcClass) : [...prev.crcClass, crcClass] }));
  };

  const handleGenderToggle = (gender: string) => {
    setFilters(prev => ({ ...prev, gender: prev.gender.includes(gender) ? prev.gender.filter(g => g !== gender) : [...prev.gender, gender] }));
  };

  const handleSelectStudent = (studentId: string, studentEmail: string | null) => {
    setSelectedStudents(prev => {
      const isSelected = prev.some(student => student.id === studentId);
      return isSelected 
        ? prev.filter(student => student.id !== studentId)
        : [...prev, { id: studentId, email: studentEmail }];
    });
  };

  const handleSelectAll = () => {
    if (filteredStudents.length === selectedStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => ({ id: student.id, email: student.email || null })));
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

  const getGPAColor = (gpa: number) => {
    if (gpa >= 90) return "bg-gradecolors-90 text-black";
    if (gpa >= 80) return "bg-gradecolors-80 text-black";
    if (gpa >= 70) return "bg-gradecolors-70 text-black";
    if (gpa >= 60) return "bg-gradecolors-60 text-black";
    if (gpa >= 50) return "bg-gradecolors-50 text-black";
    return "bg-gradecolors-below text-black";
  };

  const getGradeColor = (grade: string) => {
    if (grade === "Enrichment Year") return "bg-yearcolors-ey text-black";
    if (grade === "Senior 4") return "bg-yearcolors-s4 text-black";
    if (grade === "Senior 5") return "bg-yearcolors-s5 text-black";
    if (grade === "Senior 6") return "bg-yearcolors-s6 text-black";
    return "bg-gray-200 text-gray-700";
  };

  const hasActiveFilters = searchTerm !== "" || 
    filters.grade.length > 0 || 
    filters.major.length > 0 || 
    filters.gpa.length > 0 || 
    filters.crcClass.length > 0 || 
    filters.gender.length > 0;

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({ 
      grade: [], 
      major: [], 
      gpa: [], 
      crcClass: [],
      gender: []
    });
  };

  const handleAction = () => {
    showToastError({
      headerText: "Demo Action",
      paragraphText: "This action is disabled in the demo dashboard.",
      direction: "right"
    });
  };

  return (
    <div className="p-8">
      <div className="space-y-4">
        <StudentManagementHeader />

        <div className="flex flex-col gap-3 mb-6">
          <StudentSearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCount={selectedStudents.length}
            savedCount={savedSelections.length}
            onSaveSelection={handleSaveSelection}
            onClearSelection={() => setSelectedStudents([])}
            onClearSaved={() => setSavedSelections([])}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />
          
          <StudentFilters
            filters={filters}
            students={dummyStudents as any}
            crcClasses={dummyCrcClasses as any}
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
            totalSelections={selectedStudents.length + savedSelections.length}
            selectedStudents={selectedStudents}
            savedSelections={savedSelections}
            onEmailSent={() => {}}
          />
        </div>
        
        <StudentTable
          students={paginatedStudents as any}
          loading={false}
          selectedStudents={selectedStudents}
          loadingReportId={null}
          onSelectStudent={handleSelectStudent}
          onSelectAll={handleSelectAll}
          onViewReport={handleAction}
          onViewResume={handleAction}
          getGradeColor={getGradeColor}
          getGPAColor={getGPAColor}
        />
        
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
      </div>
    </div>
  );
}
