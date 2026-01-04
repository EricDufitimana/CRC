import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../../../zenith/src/components/ui/tooltip";
import { ArrowUpRight } from "lucide-react";

type RequestCardProps = {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  deadline: string | null;
  submitted_at: string | null;
  status: string;
  referred?: boolean;
  admin: { id: string; name: string } | null;
  wordCount?: string;
};

export function RequestCard({ 
  title, 
  description, 
  link, 
  deadline, 
  submitted_at, 
  status, 
  referred, 
  admin,
  wordCount
}: RequestCardProps) {
  const statusChip = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-200 border border-yellow-600 text-yellow-600 hover:bg-yellow-200';
      case 'in_review': return 'bg-blue-200 border border-blue-600 text-blue-600 hover:bg-blue-200';
      case 'accepted': return 'bg-green-200 border border-green-600 text-green-600 hover:bg-green-200';
      case 'denied': return 'bg-red-200 border border-red-600 text-red-600 hover:bg-red-200';
      case 'completed': return 'bg-green-200 border border-green-600 text-green-600 hover:bg-green-200';
      default: return 'bg-gray-200 border border-gray-600 text-gray-600 hover:bg-gray-200';
    }
  };

  return (
    <div className="rounded-xl border border-neutral-100 p-4 bg-white transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{title}</p>
            <Badge className={statusChip(status)}>{status.replace('_', ' ')}</Badge>
            {referred && (
              <Badge className="bg-yearcolors-s4 hover:bg-yearcolors-s4 text-xs text-neutral-900">Referred</Badge>
            )}
          </div>
          <p className="text-xs text-neutral-500 truncate">
            {deadline ? `Due ${new Date(deadline).toLocaleDateString()}` : 'No deadline'}
            {submitted_at && ` • Submitted ${new Date(submitted_at).toLocaleDateString()}`}
            {admin && ` • Sent to ${admin.name}`}
            {wordCount && ` • ${wordCount} words`}
          </p>
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-xs text-neutral-600 mt-1 line-clamp-2 cursor-help">
                    {description}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {link && (
          <div className="flex items-center gap-2">
            <Link 
              href={link} 
              target="_blank" 
              className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100"
            >
              Open <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
