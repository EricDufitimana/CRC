'use client';

import { useTRPCRealtime } from '@/hooks/useTRPCRealtime';
import { EmptyState } from '@/components/ui/empty-state';
import { ClimbingBoxLoader } from 'react-spinners';
import { ResourceHeader } from './ResourceHeader';
import { ResourceCard } from './ResourceCard';

type Opportunity = {
  id: number;
  image_address?: string | null;
  title: string;
  description: string;
  url?: string | null;
  opportunity_deadline?: string | null;
  created_at?: string;
};

interface ResourceContentProps {
  category: string;
  title: string;
  description: string;
  emptyHeader?: string;
  emptySubtext?: string;
}

export function ResourceContent({ 
  category, 
  title, 
  description,
  emptyHeader = "No opportunities available",
  emptySubtext = "Fresh opportunities are added regularly. Check back soon for the latest prospects."
}: ResourceContentProps) {
  const { data, isLoading, error, refetch } = useTRPCRealtime<Opportunity>({
    category,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 w-full">
        <div className="scale-75 mb-8">
          <ClimbingBoxLoader color="#10b981" />
        </div>
        <p className="text-gray-500 font-medium animate-pulse">Loading {title.toLowerCase()}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-100 mx-auto w-full max-w-2xl">
        <div className="text-red-500 mb-6">
          <p className="text-lg font-semibold">Error loading resources</p>
          <p className="text-sm opacity-80">{error.message}</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-6 py-2 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full">
        <ResourceHeader title={title} description={description} count={0} />
        <div className="py-4">
          <EmptyState
            image="/images/empty-state/empty-resources.svg"
            headerText={emptyHeader}
            subtext={emptySubtext}
            imageClassName="-ml-8 w-48 h-48"
            imageSize="custom"
            showDashedBorder={true}
          />
        </div>
      </div>
    );
  }

  const isNew = (dateStr?: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const isClosingSoon = (deadlineStr?: string | null) => {
    if (!deadlineStr) return false;
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  const isDueToday = (deadlineStr?: string | null) => {
    if (!deadlineStr) return false;
    const deadline = new Date(deadlineStr);
    const now = new Date();
    return deadline.toDateString() === now.toDateString();
  };

  return (
    <div className="w-full">
      <ResourceHeader title={title} description={description} count={data.length} />
      <div className="flex flex-col gap-4">
        {data.map((item) => {
          const urgent = isDueToday(item.opportunity_deadline) || isClosingSoon(item.opportunity_deadline);
          const newlyAdded = isNew(item.created_at);

          return (
            <ResourceCard
              key={item.id}
              title={item.title}
              description={item.description}
              image={item.image_address}
              url={item.url}
              deadline={item.opportunity_deadline ? 
                (isDueToday(item.opportunity_deadline) ? 'Due today at 11:59 PM' : `Closes ${new Date(item.opportunity_deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`) 
                : null
              }
              isNew={newlyAdded}
              isUrgent={urgent}
            />
          );
        })}
      </div>
    </div>
  );
}
