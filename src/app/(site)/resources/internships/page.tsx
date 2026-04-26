import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient, trpc } from '@/trpc/server';
import ScrollUp from '@/components/Common/ScrollUp';
import ConditionalHeader from '../../../../components/other/ConditionalHeader';
import MultipleAnnouncementsBanner from '@/components/Banner/MultipleAnnouncementsBanner';
import { InternshipsContent } from './internships-content';

export default async function Internships() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.resources.getByCategory.queryOptions({ category: 'internships' }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
    <main>
      <ScrollUp />
      <div className="py-40 max-w-[1280px] mx-auto space-y-8">
        <MultipleAnnouncementsBanner 
          page="internships" 
          theme="green" 
          maxAnnouncements={3} 
          containerWidth="w-[1120px]" 
        />
        <div className="flex justify-center">
          <InternshipsContent />
        </div>
      </div>
    </main>
    </HydrationBoundary>
  );
}
