"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Users, Calendar, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface AttendanceRecord {
  id: number;
  workshop_title: string;
  class_name: string;
  present_count: number;
  total_count: number;
  date: string;
}

interface AttendanceOverviewSectionProps {
  records: AttendanceRecord[];
  loading: boolean;
}

export function AttendanceOverviewSection({ records, loading }: AttendanceOverviewSectionProps) {
  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getAttendanceIcon = (percentage: number) => {
    if (percentage >= 90) return <CheckCircle className="h-4 w-4" />;
    if (percentage >= 75) return <AlertCircle className="h-4 w-4" />;
    return <XCircle className="h-4 w-4" />;
  };

  return (
    <Card className="shadow-none border hover:shadow-sm transition-all duration-200 rounded-2xl ">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-md font-semibold text-gray-900">Attendance Overview</CardTitle>
              <p className="text-xs text-gray-500">Workshop attendance this week</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600">{records.length}</div>
            <div className="text-xs text-gray-500">workshops</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="space-y-2">
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : records.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pr-4">
              {records.map((record, index) => {
                const attendancePercentage = Math.round((record.present_count / record.total_count) * 100);
                
                return (
                  <div key={index} className="group relative p-4 border border-gray-200 rounded-xl hover:border-orange-200 hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent transition-all duration-200 cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate group-hover:text-orange-700 transition-colors mb-1">
                          {record.workshop_title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">{record.class_name}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(record.date), "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                      <div className={`ml-3 p-2 rounded-lg ${getAttendanceColor(attendancePercentage)}`}>
                        {getAttendanceIcon(attendancePercentage)}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Attendance</span>
                        <span className="text-lg font-bold text-gray-900">
                          {record.present_count}/{record.total_count}
                        </span>
                      </div>
                      
                      <Progress 
                        value={attendancePercentage} 
                        className={`h-[4px] transition-all duration-300 ${
                          attendancePercentage >= 90 ? '[&>div]:bg-statColors-1' : 
                          attendancePercentage >= 75 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'
                        }`}
                      />
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Percentage</span>
                        <span className={`font-semibold ${
                          attendancePercentage >= 90 ? 'text-green-600' : 
                          attendancePercentage >= 75 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {attendancePercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="mb-4 p-4 bg-orange-50 rounded-full">
                <Users className="h-8 w-8 text-orange-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">No attendance records this week</h3>
              <p className="text-sm text-gray-500">No workshops have been tracked yet</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

