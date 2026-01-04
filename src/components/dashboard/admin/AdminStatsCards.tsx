"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, FileText, Briefcase, TrendingUp, TrendingDown } from "lucide-react";

interface DashboardStats {
  essayRequestsThisWeek: number;
  essayRequestsLastWeek: number;
  opportunitiesAddedThisWeek: number;
  opportunitiesAddedLastWeek: number;
  attendanceTaken: number;
  attendanceTakenLastWeek: number;
  assignmentsThisWeek: number;
  assignmentsLastWeek: number;
}

interface AdminStatsCardsProps {
  stats: DashboardStats;
  loading: boolean;
}

export function AdminStatsCards({ stats, loading }: AdminStatsCardsProps) {
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 'up' : 'neutral';
    const change = current - previous;
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'neutral';
  };

  const getTrendText = (current: number, previous: number) => {
    const change = Math.abs(current - previous);
    if (previous === 0) return current > 0 ? `+${current} new` : 'No change';
    if (current === previous) return 'No change';
    return `${current > previous ? '+' : '-'}${change} from last week`;
  };

  const statCards = [
    {
      title: "Assignments",
      value: stats.assignmentsThisWeek,
      description: "Due this week",
      icon: Calendar,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-700",
      current: stats.assignmentsThisWeek,
      previous: stats.assignmentsLastWeek,
    },
    {
      title: "Workshops",
      value: stats.attendanceTaken,
      description: "This week",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
      current: stats.attendanceTaken,
      previous: stats.attendanceTakenLastWeek,
    },
    {
      title: "Essay Requests",
      value: stats.essayRequestsThisWeek,
      description: "This week",
      icon: FileText,
      iconBg: "bg-green-100",
      iconColor: "text-green-700",
      current: stats.essayRequestsThisWeek,
      previous: stats.essayRequestsLastWeek,
    },
    {
      title: "Opportunities",
      value: stats.opportunitiesAddedThisWeek,
      description: "Found this week",
      icon: Briefcase,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-700",
      current: stats.opportunitiesAddedThisWeek,
      previous: stats.opportunitiesAddedLastWeek,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const trend = calculateTrend(stat.current, stat.previous);
        const trendText = getTrendText(stat.current, stat.previous);

        return (
            <Card key={index} className=" shadow-none hover:shadow-sm transition-shadow bg-white rounded-2xl border " >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    {loading ? (
                      <div className="space-y-2">
                        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                      </>
                    )}
                  </div>
                  <div className={`h-12 w-12 rounded-xl ${stat.iconBg} ${stat.iconColor} flex items-center justify-center`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                {loading ? (
                  <div className="mt-4 flex items-center text-xs">
                    <div className="h-3 w-3 bg-gray-200 rounded animate-pulse mr-1" />
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                ) : (
                  <div className="mt-4 flex items-center text-xs">
                    {trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    ) : trend === 'down' ? (
                      <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                    ) : null}
                    <span className={`font-medium ${
                      trend === 'up' ? 'text-green-600' : 
                      trend === 'down' ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {trendText}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
        );
      })}
    </div>
  );
}

