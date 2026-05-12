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
      <div className="py-24 md:py-32 lg:py-40 max-w-[1100px] mx-auto space-y-8 px-4 sm:px-6">
        <MultipleAnnouncementsBanner 
          page="internships" 
          theme="green" 
          maxAnnouncements={3} 
          containerWidth="w-full" 
        />
        <div className="w-full">
          <InternshipsContent />
        </div>
      </div>
    </main>
    </HydrationBoundary>
  );
}
