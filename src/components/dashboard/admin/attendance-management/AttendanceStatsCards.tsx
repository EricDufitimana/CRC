"use client";

import { Users, Clock, UserX, TrendingUp, TrendingDown } from "lucide-react";

interface Stats {
  totalStudents: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  averageCheckIn: string;
  presentLastWeek: number;
  lateLastWeek: number;
  absentLastWeek: number;
}

interface AttendanceStatsCardsProps {
  stats: Stats;
}

function getTrendDisplay(current: number, previous: number) {
  const difference = current - previous;
  const isIncrease = difference > 0;
  const isDecrease = difference < 0;
  const absoluteDifference = Math.abs(difference);

  if (difference === 0) {
    return {
      text: `No change from last week`,
      color: "text-gray-500",
      icon: null
    };
  }

  const IconComponent = isIncrease ? TrendingUp : TrendingDown;
  const color = isIncrease ? "text-green-600" : "text-red-600";
  const direction = isIncrease ? "+" : "-";

  return {
    text: `${direction}${absoluteDifference} from last week`,
    color,
    icon: IconComponent
  };
}

export function AttendanceStatsCards({ stats }: AttendanceStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Students Present */}
      <div className="flex flex-col gap-1 rounded-xl border p-4 bg-white">
        <div className="flex flex-row items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs text-neutral-500 mb-1">Total Students Present</p>
            <div className="text-lg font-semibold mb-1">{stats.presentToday}</div>
          </div>
        </div>
        <div className="flex items-center text-xs gap-1">
          {(() => {
            const trend = getTrendDisplay(stats.presentToday, stats.presentLastWeek);
            const IconComponent = trend.icon;
            return (
              <div className={`flex items-center text-xs ${trend.color}`}>
                {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
                {trend.text}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Late Arrivals */}
      <div className="flex flex-col gap-1 rounded-xl border p-4 bg-white">
        <div className="flex flex-row items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs text-neutral-500 mb-1">Late Arrivals</p>
            <div className="text-lg font-semibold mb-1">{stats.lateToday}</div>
          </div>
        </div>
        <div className="flex items-center text-xs gap-1">
          {(() => {
            const trend = getTrendDisplay(stats.lateToday, stats.lateLastWeek);
            const IconComponent = trend.icon;
            return (
              <div className={`flex items-center text-xs ${trend.color}`}>
                {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
                {trend.text}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Students Absent */}
      <div className="flex flex-col gap-1 rounded-xl border p-4 bg-white">
        <div className="flex flex-row items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
            <UserX className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <p className="text-xs text-neutral-500 mb-1">Students Absent</p>
            <div className="text-lg font-semibold mb-1">{stats.absentToday}</div>
          </div>
        </div>
        <div className="flex items-center text-xs gap-1">
          {(() => {
            const trend = getTrendDisplay(stats.absentToday, stats.absentLastWeek);
            const IconComponent = trend.icon;
            return (
              <div className={`flex items-center text-xs ${trend.color}`}>
                {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
                {trend.text}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

