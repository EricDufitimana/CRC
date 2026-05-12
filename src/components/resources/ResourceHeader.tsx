'use client';

import { cn } from '@/zenith/lib/utils';

interface ResourceHeaderProps {
  title: string;
  description: string;
  count?: number;
}

export function ResourceHeader({ title, description, count }: ResourceHeaderProps) {
  return (
    <div className="mb-6 md:mb-10 p-5 md:p-8 rounded-[20px] md:rounded-[24px] bg-slate-50 border border-slate-200 flex items-center justify-between relative overflow-hidden">
      <div>
        <h1 className="text-[24px] font-semibold text-gray-900 tracking-tight mb-2">{title}</h1>
        <p className="text-[15px] text-gray-500 max-w-2xl leading-relaxed">
          {description}
        </p>
      </div>
      {count !== undefined && (
        <div className="hidden sm:flex flex-col items-end">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100/50 shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            </div>
            <span className="text-[12px] font-bold text-emerald-700 tracking-wide uppercase">{count} Active</span>
          </div>
        </div>
      )}
    </div>
  );
}
