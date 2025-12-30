"use client";

import { Button } from "../../../../zenith/src/components/ui/button";
import { Badge } from "../../../../zenith/src/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../zenith/src/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { EmailDialog } from "./EmailDialog";

interface Filters {
  grade: string[];
  major: string[];
  gpa: string[];
  crcClass: string[];
  gender: string[];
}

interface StudentFiltersProps {
  filters: Filters;
  students: any[];
  crcClasses: any[];
  onGradeToggle: (grade: string) => void;
  onMajorToggle: (major: string) => void;
  onGpaToggle: (gpa: string) => void;
  onCrcClassToggle: (crcClass: string) => void;
  onGenderToggle: (gender: string) => void;
  onClearGrade: () => void;
  onClearMajor: () => void;
  onClearGpa: () => void;
  onClearCrcClass: () => void;
  onClearGender: () => void;
  // Email dialog props
  totalSelections: number;
  selectedStudents: Array<{ id: string; email: string }>;
  savedSelections: Array<{ id: string; email: string }>;
  onEmailSent: () => void;
}

export function StudentFilters({
  filters,
  students,
  crcClasses,
  onGradeToggle,
  onMajorToggle,
  onGpaToggle,
  onCrcClassToggle,
  onGenderToggle,
  onClearGrade,
  onClearMajor,
  onClearGpa,
  onClearCrcClass,
  onClearGender,
  totalSelections,
  selectedStudents,
  savedSelections,
  onEmailSent,
}: StudentFiltersProps) {
  const grades = ["Enrichment Year", "Senior 4", "Senior 5", "Senior 6"];
  const majors = ["MPC", "HGL", "PCB", "MCE", "MEG"];
  const gpaRanges = ["90-100", "80-89", "70-79", "60-69", "50-59", "below-50"];
  const uniqueGenders = Array.from(new Set(students.map(s => s.gender).filter(Boolean)));

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
      {/* Grade Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full h-9 gap-1.5 justify-between text-xs bg-white/80 border-gray-300/80 dark:bg-gray-800/80 dark:border-gray-600/80">
            <span className="hidden sm:inline">Grade</span>
            <span className="sm:hidden">Grade</span>
            {filters.grade.length > 0 && (
              <Badge variant="outline" className="ml-1 text-xs h-4 px-1">
                {filters.grade.length}
              </Badge>
            )}
            <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Select Grades</h4>
            {filters.grade.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {filters.grade.map(grade => (
                  <Badge key={grade} variant="outline" className="gap-0.5 text-xs px-1.5 py-0.5">
                    {grade}
                    <button
                      onClick={() => onGradeToggle(grade)}
                      className="ml-0.5 hover:bg-gray-200 rounded-full w-3.5 h-3.5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={onClearGrade} className="h-5 px-1.5 text-xs">
                  Clear All
                </Button>
              </div>
            )}
            <div className="grid grid-cols-2 gap-1.5">
              {grades.map(grade => (
                <Button
                  key={grade}
                  variant="outline"
                  size="sm"
                  onClick={() => onGradeToggle(grade)}
                  className={`justify-start cursor-pointer text-xs h-7 px-2 ${filters.grade.includes(grade) ? 'bg-black text-white border-black hover:bg-black hover:text-white' : 'hover:bg-transparent'}`}
                >
                  {grade}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Major Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full h-9 gap-1.5 justify-between text-xs bg-white/80 border-gray-300/80 dark:bg-gray-800/80 dark:border-gray-600/80">
            <span className="hidden sm:inline">Major</span>
            <span className="sm:hidden">Major</span>
            {filters.major.length > 0 && (
              <Badge variant="outline" className="ml-1 text-xs h-4 px-1">
                {filters.major.length}
              </Badge>
            )}
            <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Select Majors</h4>
            {filters.major.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {filters.major.map(major => (
                  <Badge key={major} variant="outline" className="gap-0.5 text-xs px-1.5 py-0.5">
                    {major}
                    <button
                      onClick={() => onMajorToggle(major)}
                      className="ml-0.5 hover:bg-gray-200 rounded-full w-3.5 h-3.5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={onClearMajor} className="h-5 px-1.5 text-xs">
                  Clear All
                </Button>
              </div>
            )}
            <div className="grid grid-cols-2 gap-1.5">
              {majors.map(major => (
                <Button
                  key={major}
                  variant="outline"
                  size="sm"
                  onClick={() => onMajorToggle(major)}
                  className={`justify-start cursor-pointer text-xs h-7 px-2 ${filters.major.includes(major) ? 'bg-black text-white border-black hover:bg-black hover:text-white' : 'hover:bg-transparent'}`}
                >
                  {major}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* GPA Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full h-9 gap-1.5 justify-between text-xs bg-white/80 border-gray-300/80 dark:bg-gray-800/80 dark:border-gray-600/80">
            <span className="hidden sm:inline">GPA</span>
            <span className="sm:hidden">GPA</span>
            {filters.gpa.length > 0 && (
              <Badge variant="outline" className="ml-1 text-xs h-4 px-1">
                {filters.gpa.length}
              </Badge>
            )}
            <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Select GPA Ranges</h4>
            {filters.gpa.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {filters.gpa.map(gpa => (
                  <Badge key={gpa} variant="outline" className="gap-0.5 text-xs px-1.5 py-0.5">
                    {gpa === "below-50" ? "Below 50%" : `${gpa}%`}
                    <button
                      onClick={() => onGpaToggle(gpa)}
                      className="ml-0.5 hover:bg-gray-200 rounded-full w-3.5 h-3.5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={onClearGpa} className="h-5 px-1.5 text-xs">
                  Clear All
                </Button>
              </div>
            )}
            <div className="grid grid-cols-2 gap-1.5">
              {gpaRanges.map(gpa => (
                <Button
                  key={gpa}
                  variant="outline"
                  size="sm"
                  onClick={() => onGpaToggle(gpa)}
                  className={`justify-start cursor-pointer text-xs h-7 px-2 ${filters.gpa.includes(gpa) ? 'bg-black text-white border-black hover:bg-black hover:text-white' : 'hover:bg-transparent'}`}
                >
                  {gpa === "below-50" ? "Below 50%" : `${gpa}%`}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Gender Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full h-9 gap-1.5 justify-between text-xs bg-white/80 border-gray-300/80 dark:bg-gray-800/80 dark:border-gray-600/80">
            <span className="hidden sm:inline">Gender</span>
            <span className="sm:hidden">Gender</span>
            {filters.gender.length > 0 && (
              <Badge variant="outline" className="ml-1 text-xs h-4 px-1">
                {filters.gender.length}
              </Badge>
            )}
            <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Select Gender</h4>
            {filters.gender.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {filters.gender.map(gender => (
                  <Badge key={gender} variant="outline" className="gap-0.5 text-xs px-1.5 py-0.5">
                    {gender}
                    <button
                      onClick={() => onGenderToggle(gender)}
                      className="ml-0.5 hover:bg-gray-200 rounded-full w-3.5 h-3.5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={onClearGender} className="h-5 px-1.5 text-xs">
                  Clear All
                </Button>
              </div>
            )}
            <div className="grid grid-cols-2 gap-1.5">
              {uniqueGenders.map(gender => (
                <Button
                  key={gender}
                  variant="outline"
                  size="sm"
                  onClick={() => onGenderToggle(gender)}
                  className={`justify-start cursor-pointer text-xs h-7 px-2 ${filters.gender.includes(gender) ? 'bg-black text-white border-black hover:bg-black hover:text-white' : 'hover:bg-transparent'}`}
                >
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* CRC Class Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full h-9 gap-1.5 justify-between text-xs bg-white/80 border-gray-300/80 dark:bg-gray-800/80 dark:border-gray-600/80">
            <span className="hidden sm:inline">CRC Class</span>
            <span className="sm:hidden">CRC</span>
            {filters.crcClass.length > 0 && (
              <Badge variant="outline" className="ml-1 text-xs h-4 px-1">
                {filters.crcClass.length}
              </Badge>
            )}
            <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Select CRC Classes</h4>
            {filters.crcClass.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {filters.crcClass.map(classId => {
                  const crcClass = crcClasses.find(c => c.id === classId);
                  return (
                    <Badge key={classId} variant="outline" className="gap-0.5 text-xs px-1.5 py-0.5">
                      {crcClass?.name || classId}
                      <button
                        onClick={() => onCrcClassToggle(classId)}
                        className="ml-0.5 hover:bg-gray-200 rounded-full w-3.5 h-3.5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })}
                <Button variant="ghost" size="sm" onClick={onClearCrcClass} className="h-5 px-1.5 text-xs">
                  Clear All
                </Button>
              </div>
            )}
            <div className="grid grid-cols-1 gap-1.5">
              {crcClasses.map(crcClass => (
                <Button
                  key={crcClass.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onCrcClassToggle(crcClass.id)}
                  className={`justify-start cursor-pointer text-xs h-7 px-2 ${filters.crcClass.includes(crcClass.id) ? 'bg-black text-white border-black hover:bg-black hover:text-white' : 'hover:bg-transparent'}`}
                >
                  {crcClass.name}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Email Dialog Button */}
      <EmailDialog
        totalSelections={totalSelections}
        selectedStudents={selectedStudents}
        savedSelections={savedSelections}
        students={students}
        onEmailSent={onEmailSent}
      />
    </div>
  );
}

