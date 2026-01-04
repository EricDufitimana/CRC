"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/ContentSkeleton";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import MarkdownIt from 'markdown-it';
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

const formatPageLabel = (page: string | null) => {
  if (page === 'student_dashboard') return 'General';
  if (page === 'english_language_learning') return 'English Learning';
  if (!page) return 'Other';
  return page.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).replace('New', 'New ');
};

const getAccentBg = (page: string | null) => {
  const resources = new Set([
    'templates',
    'crp',
    'internships',
    'english_language_learning',
    'job_readiness_course',
  ]);
  const events = new Set([
    'previous_events',
    'upcoming_events',
  ]);
  const workshops = new Set([
    's4_workshops',
    'ey_workshops',
    'senior_5_group_a_b_workshops',
    'senior_5_customer_care',
    'senior_6_group_a_b_workshops',
    'senior_6_group_c_workshops',
    'senior_6_group_d',
  ]);
  const opportunities = new Set([
    'new_opportunities',
    'recurring_opportunities',
    'approved_opportunities',
  ]);

  if (!page) return 'bg-neutral-300 hover:bg-neutral-300';
  if (resources.has(page)) return 'bg-yearcolors-ey hover:bg-yearcolors-ey';
  if (events.has(page)) return 'bg-yearcolors-s6 hover:bg-yearcolors-s6';
  if (workshops.has(page)) return 'bg-yearcolors-s5 hover:bg-yearcolors-s5';
  if (opportunities.has(page)) return 'bg-yearcolors-s4 hover:bg-yearcolors-s4';
  return 'bg-neutral-300 hover:bg-neutral-300';
};

export function StudentAnnouncements() {
  const trpc = useTRPC();
  const { data: announcements } = useSuspenseQuery(trpc.studentDashboard.getAnnouncements.queryOptions());

  // Filter logic (client side as requested implicitly by logic structure)
  const studentNotifs = announcements?.filter(n => n.page === 'student_dashboard') || [];
  const otherNotifs = announcements?.filter(n => n.page !== 'student_dashboard') || [];

  const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
  });

  const renderMarkdown = (text: string) => {
    try {
      return md.render(text);
    } catch (error) {
      console.error('Error rendering markdown:', error);
      return text;
    }
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .student-announcement-markdown {
        background: transparent !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .student-announcement-markdown h1,
      .student-announcement-markdown h2,
      .student-announcement-markdown h3,
      .student-announcement-markdown h4,
      .student-announcement-markdown h5,
      .student-announcement-markdown h6 {
        margin: 0.5em 0 0.25em 0 !important;
        font-size: inherit !important;
        font-weight: 600 !important;
      }
      .student-announcement-markdown p {
        margin: 0.25em 0 !important;
      }
      .student-announcement-markdown ul,
      .student-announcement-markdown ol {
        margin: 0.25em 0 !important;
        padding-left: 1.5em !important;
      }
      .student-announcement-markdown li {
        margin: 0.1em 0 !important;
      }
      .student-announcement-markdown strong {
        font-weight: 600 !important;
      }
      .student-announcement-markdown em {
        font-style: italic !important;
      }
      .student-announcement-markdown code {
        background: rgba(0,0,0,0.1) !important;
        padding: 0.1em 0.3em !important;
        border-radius: 0.2em !important;
        font-size: 0.9em !important;
      }
      .student-announcement-markdown a {
        color: #3b82f6 !important;
        text-decoration: underline !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        border-radius: 2px !important;
        padding: 1px 2px !important;
      }
      .student-announcement-markdown a:hover {
        color: #1d4ed8 !important;
        text-decoration: underline !important;
        background-color: rgba(59, 130, 246, 0.1) !important;
        text-decoration-thickness: 2px !important;
      }
      .student-announcement-markdown a:focus {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px !important;
      }
      .student-announcement-markdown blockquote {
        border-left: 3px solid #e5e7eb !important;
        padding-left: 1em !important;
        margin: 0.5em 0 !important;
        font-style: italic !important;
        color: #6b7280 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <Card className="border-0 shadow-sm ring-1 ring-black/5 flex flex-col overflow-hidden min-h-0 m-0.5">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Announcements</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0">
        {(studentNotifs.length === 0 && otherNotifs.length === 0) ? (
          <div className="h-full w-full flex flex-col items-center justify-center py-12 h-short:py-0 text-center">
            <div className="relative w-60 h-60 h-short:w-full h-short:h-96 max-w-[450px]">
              <Image
                src="/images/dashboard/empty-notifications.png"
                alt="No announcements"
                fill
                className="opacity-95 object-contain"
              />
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full px-6 py-3">
            <div className="space-y-4">
              <div className="space-y-2">
                {studentNotifs.length > 0 && (
                  <div className="text-xs text-neutral-400">Student dashboard</div>
                )}
                {studentNotifs.length === 0 ? (
                  <div className="text-sm text-neutral-500">No student notifications.</div>
                ) : (
                  studentNotifs.map((n) => (
                    <div key={n.id} className="rounded-xl border border-neutral-100 p-3 text-sm text-neutral-700 transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="h-5 w-1 rounded-full bg-statColors-7 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="mb-1">
                            <Badge variant="secondary" className="bg-statColors-7 hover:bg-statColors-7 text-neutral-900">{formatPageLabel('student_dashboard')}</Badge>
                          </div>
                          <div
                            className="student-announcement-markdown"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(n.message) }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="space-y-2">
                {otherNotifs.length > 0 && (
                  <div className="text-xs text-neutral-400">Other</div>
                )}
                {otherNotifs.length === 0 ? null : (
                  otherNotifs.map((n) => (
                    <div key={n.id} className="rounded-xl border border-neutral-100 p-3 text-sm text-neutral-700  transition-colors">
                      <div className="flex items-start gap-3">
                        <span className={`h-5 w-1 rounded-full mt-0.5 flex-shrink-0 ${getAccentBg(n.page)}`} />
                        <div className="flex-1 min-w-0">
                          <div className="mb-1">
                            <Badge variant="secondary" className={`${getAccentBg(n.page)} text-neutral-900 transition-none`}>{formatPageLabel(n.page)}</Badge>
                          </div>
                          <div
                            className="student-announcement-markdown"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(n.message) }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
