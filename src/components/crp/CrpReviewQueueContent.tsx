"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { CollegeLogo } from "./CollegeLogo";
import { CrpAdminTabs } from "./CrpAdminTabs";
import { EmptyState } from "@/components/ui/empty-state";

const BTN_PRIMARY =
  "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors";
const BTN_OUTLINE =
  "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors";

function mailtoHref(email: string | null, subjectBits: string) {
  if (!email) return undefined;
  return `mailto:${email}?subject=${encodeURIComponent(`Your ${subjectBits} — feedback`)}`;
}

export function CrpReviewQueueContent() {
  const trpc = useTRPC();
  const { data: queue = [] } = useQuery(trpc.crpAdmin.getReviewQueue.queryOptions());

  return (
    <div className="p-8">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold font-cal-sans text-gray-900 mb-1">College Readiness</h1>
            <p className="text-gray-600 text-sm">Essays your students have sent for review.</p>
          </div>
          <CrpAdminTabs />
        </div>

        {queue.length === 0 ? (
          <EmptyState
            image="/images/empty-state/empty-resources.svg"
            headerText="Nothing to review"
            subtext="Essays show up here when a student marks them “Reviewer sent.”"
            imageClassName="-ml-8 w-48 h-48"
            imageSize="custom"
          />
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white divide-y divide-gray-100">
            {queue.map((e) => {
              const subjectBits = [e.college?.name, e.type].filter(Boolean).join(" ");
              const href = mailtoHref(e.studentEmail, subjectBits);
              return (
                <div className="flex items-start gap-4 p-5 flex-wrap" key={e.id}>
                  {e.college ? (
                    <CollegeLogo name={e.college.name} logoUrl={e.college.logoUrl} />
                  ) : (
                    <span className="w-[34px] h-[34px] rounded-[9px] grid place-items-center bg-gray-900 text-white text-xs font-bold flex-none">
                      CA
                    </span>
                  )}
                  <div className="flex-1 min-w-[240px]">
                    <div className="font-semibold text-sm text-gray-900">{e.studentName}</div>
                    <div className="text-sm text-gray-700 mt-0.5">
                      <span className="font-medium">{e.type}</span> · {e.college ? e.college.name : "Shared"}
                      {e.words ? ` · ${e.words}` : ""}
                    </div>
                    {e.prompt && <p className="text-xs text-gray-500 mt-1.5 max-w-2xl leading-relaxed">{e.prompt}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {e.draftLink ? (
                      <a className={BTN_OUTLINE} href={e.draftLink} target="_blank" rel="noopener noreferrer">
                        Open draft ↗
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">No draft link</span>
                    )}
                    {href ? (
                      <a className={BTN_PRIMARY} href={href}>
                        Email student
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">No email</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
