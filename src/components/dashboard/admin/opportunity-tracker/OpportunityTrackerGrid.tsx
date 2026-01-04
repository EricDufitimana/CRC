"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/zenith/components/ui/card";
import { Badge } from "@/zenith/components/ui/badge";
import { Button } from "@/zenith/components/ui/button";
import { Calendar, Clock, ExternalLink, Check, X, Send, ArrowUpRight, ArrowDownLeft, Tag } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/zenith/components/ui/skeleton";

interface OpportunityRequest {
  id: string;
  title: string;
  student_name: string;
  grade: string | null;
  status: string;
  created_at: string | null;
  deadline: string | null;
  link: string;
  ai_category: string | null;
  referred?: boolean;
  // Referral specific fields
  isReferral?: boolean;
  type?: 'sent' | 'received';
  referredBy?: string;
  referredTo?: string;
}

interface OpportunityTrackerGridProps {
  opportunities: OpportunityRequest[];
  isFetching: boolean;
  onStatusChange: (id: string, status: string) => void;
  onRefer: (opp: OpportunityRequest) => void;
  activeTab: string;
}

export function OpportunityTrackerGrid({
  opportunities,
  isFetching,
  onStatusChange,
  onRefer,
  activeTab,
}: OpportunityTrackerGridProps) {
  if (isFetching && opportunities.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-2xl border-gray-100 shadow-none">
            <CardHeader className="p-5">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
            <CardFooter className="p-5 bg-gray-50/50 flex gap-2">
              <Skeleton className="h-9 w-24 rounded-xl" />
              <Skeleton className="h-9 w-24 rounded-xl" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
        <Tag className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No opportunities found</h3>
        <p className="text-gray-500 text-sm">All caught up! Check other tabs.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {opportunities.map((opp) => (
        <Card key={opp.id} className="group flex flex-col bg-white border border-gray-200 shadow-none rounded-2xl overflow-hidden hover:border-gray-300 transition-colors">
          <CardHeader className="p-5 pb-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <CardTitle className="text-md font-bold text-gray-900 line-clamp-1">{opp.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-gray-600">{opp.student_name}</span>
                  {opp.grade && (
                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-[10px] py-0 font-medium">
                      {opp.grade.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <Badge className={`${opp.status === 'accepted' ? 'bg-green-100 text-green-700 border-green-200' :
                  opp.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                    'bg-amber-100 text-amber-700 border-amber-200'
                } shadow-none font-bold text-sm`}>
                {opp.status.toUpperCase()}
              </Badge>
            </div>

            {/* Referral Info Banner */}
            {opp.isReferral && (
              <div className={`mt-3 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 w-fit font-medium ${opp.type === 'sent'
                  ? 'bg-orange-50 text-orange-700 border border-orange-100'
                  : 'bg-blue-50 text-blue-700 border border-blue-100'
                }`}>
                {opp.type === 'sent' ? (
                  <>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    Sent to: {opp.referredTo || 'Unknown'}
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="h-3.5 w-3.5" />
                    Received from: {opp.referredBy || 'Unknown'}
                  </>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="p-5 pt-0 flex-1">
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <span>Submitted: {opp.created_at ? format(new Date(opp.created_at), 'MMM d, yyyy') : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                <span>Deadline: {opp.deadline ? format(new Date(opp.deadline), 'MMM d, yyyy') : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 col-span-2">
                <Tag className="h-3.5 w-3.5 text-gray-400" />
                <span>{opp.ai_category || 'No Category'}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 bg-gray-50/30 border-t border-gray-100 flex items-center gap-2">
            <Button
              onClick={() => window.open(opp.link, '_blank')}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl h-9 shadow-none transition-colors text-sm font-medium"
              variant="outline"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-2" />
              View Link
            </Button>

            {/* Actions */}
            {(!opp.isReferral || opp.type === 'received') && opp.status === 'pending' && (
              <>
                {!opp.isReferral && (
                  <Button
                    onClick={() => onRefer(opp)}
                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl h-9 shadow-none transition-colors"
                    variant="outline"
                    size="icon"
                    title="Refer to another admin"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                )}

                <Button
                  onClick={() => onStatusChange(opp.id, 'rejected')}
                  className="bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 rounded-xl h-9 shadow-none transition-all font-medium text-sm"
                  title="Reject"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>

                <Button
                  onClick={() => onStatusChange(opp.id, 'accepted')}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-xl h-9 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition-all font-medium text-sm border-none active:scale-95 px-4"
                >
                  <Check className="h-3.5 w-3.5 mr-2" />
                  Approve
                </Button>
              </>
            )}

            {/* For accepted/rejected items, maybe just show status or nothing extra */}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
