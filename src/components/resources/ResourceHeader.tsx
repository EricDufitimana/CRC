'use client';

import { cn } from '@/zenith/lib/utils';

interface ResourceHeaderProps {
  title: string;
  description: string;
  count?: number;
}

export function ResourceHeader({ title, description, count }: ResourceHeaderProps) {
  return (
    <div className="mb-10 p-8 rounded-[24px] bg-slate-50 border border-slate-200 flex items-center justify-between relative overflow-hidden">
      <div>
        <h1 className="text-[24px] font-semibold text-gray-900 tracking-tight mb-2">{title}</h1>
        <p className="text-[15px] text-gray-500 max-w-2xl leading-relaxed">
          {description}
        </p>
      </div>
      {count !== undefined && (
        <div className="hidden sm:flex flex-col items-end">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-gray-200">
            <span className="relative flex h-2.5 w-2.5 mr-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[13px] font-medium text-gray-700">{count} Available</span>
          </div>
        </div>
      )}
    </div>
  );
}
