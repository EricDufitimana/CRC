"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Users, ArrowRight } from "@phosphor-icons/react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface Assignment {
  id: string;
  title: string;
  submission_idate: string;
  workshop_crc_class: string;
  workshop_title: string;
  workshop_id?: string;
  crc_class_id?: string;
  crc_class_name?: string;
}

interface AssignmentsSectionProps {
  assignments: Assignment[];
  loading: boolean;
  basePath?: string;
}

export function AssignmentsSection({ assignments, loading, basePath = "/dashboard/admin" }: AssignmentsSectionProps) {
  const router = useRouter();

  const handleAssignmentClick = (assignment: Assignment) => {
    const params = new URLSearchParams();
    params.set('assignmentId', assignment.id);

    if (assignment.workshop_title) {
      params.set('workshopId', assignment.workshop_title);
    }

    if (assignment.crc_class_name) {
      params.set('crcClassId', assignment.crc_class_name);
      if (assignment.crc_class_id) {
        params.set('subClassId', assignment.crc_class_id);
      }
    }

    router.push(`${basePath}/assignments-management?${params.toString()}`);
  };

  return (
    <Card className="shadow-none border hover:shadow-sm transition-all duration-200 h-[55vh] rounded-2xl ">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-md font-semibold text-gray-900">Assignments Due This Week</CardTitle>
              <p className="text-xs text-gray-500">Upcoming deadlines</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">{assignments.length}</div>
            <div className="text-xs text-gray-500">due</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(52vh-80px)] pt-2">
        <ScrollArea className="h-full">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : assignments.length > 0 ? (
            <div className="space-y-4 pr-4">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="group relative p-4 border border-gray-200 rounded-xl hover:border-purple-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-transparent transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                  onClick={() => handleAssignmentClick(assignment)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleAssignmentClick(assignment);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View assignment: ${assignment.title}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <h4 className="font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                          {assignment.title}
                        </h4>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600 mb-1">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {(() => {
                            const groupName = assignment.workshop_crc_class;
                            if (groupName?.includes('S4') || groupName?.includes('Senior 4')) {
                              return 'Senior 4';
                            } else if (groupName?.includes('EY') || groupName?.includes('Enrichment Year')) {
                              return 'Enrichment Year';
                            }
                            return groupName;
                          })()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Workshop: {assignment.workshop_title}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-red-600">
                          {format(new Date(assignment.submission_idate), "MMM dd")}
                        </div>
                        <div className="text-xs text-gray-500">Due Date</div>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <ArrowRight className="h-4 w-4 text-purple-500 group-hover:text-purple-600 transition-all duration-200 group-hover:translate-x-1 group-hover:scale-110" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="mb-4 p-4 bg-purple-50 rounded-full">
                <Calendar className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">No assignments due this week</h3>
              <p className="text-sm text-gray-500">All caught up! </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

