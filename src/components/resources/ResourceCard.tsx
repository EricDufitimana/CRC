'use client';

import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/zenith/lib/utils';

interface ResourceCardProps {
  title: string;
  description: string;
  image?: string | null;
  url?: string | null;
  deadline?: string | null;
  isNew?: boolean;
  isUrgent?: boolean;
}

export function ResourceCard({ 
  title, 
  description, 
  image, 
  url, 
  deadline, 
  isNew, 
  isUrgent 
}: ResourceCardProps) {
  return (
    <div 
      onClick={() => url && window.open(url, '_blank')}
      className="group relative flex items-start sm:items-center gap-5 p-5 rounded-2xl border border-gray-100 bg-white transition-all duration-300 cursor-pointer"
    >
      <div className={cn(
        "w-[84px] h-[84px] rounded-xl shrink-0 flex items-center justify-center text-3xl border shadow-sm group-hover:scale-105 transition-transform duration-300 overflow-hidden bg-white",
        isUrgent ? "border-rose-100" : "border-emerald-100"
      )}>
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className={cn(
            "w-full h-full flex items-center justify-center bg-gradient-to-br",
            isUrgent ? "from-rose-50 to-red-50" : "from-emerald-50 to-teal-50"
          )}>
            {isUrgent ? '💼' : '🎓'}
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-3">
          <h3 className="text-[17px] font-semibold text-gray-900 m-0 whitespace-nowrap overflow-hidden text-ellipsis transition-colors">
            {title}
          </h3>
          {isUrgent ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-medium tracking-wide">
              URGENT
            </span>
          ) : isNew ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-medium tracking-wide">
              NEW
            </span>
          ) : null}
        </div>
        
        <p className="text-[14px] text-gray-500 m-0 leading-relaxed line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center gap-4 mt-1.5">
          {deadline && (
            <span className={cn(
              "text-[13px] flex items-center gap-1.5 font-medium",
              isUrgent ? "text-rose-600" : "text-gray-500"
            )}>
              {isUrgent ? <Clock className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
              {deadline}
            </span>
          )}
        </div>
      </div>
      
      <div className="hidden sm:block shrink-0 ml-2">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-400 transition-all duration-300",
          isUrgent 
            ? "group-hover:bg-rose-50 group-hover:text-rose-600 group-hover:border-rose-200" 
            : "group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-200"
        )}>
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
