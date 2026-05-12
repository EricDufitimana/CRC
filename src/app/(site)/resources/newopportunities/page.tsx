import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient, trpc } from '@/trpc/server';
import ScrollUp from '@/components/Common/ScrollUp';
import ConditionalHeader from '../../../../components/other/ConditionalHeader';
import MultipleAnnouncementsBanner from '@/components/Banner/MultipleAnnouncementsBanner';
import { NewOpportunitiesContent } from './new-opportunities-content';

export default async function Home() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.resources.getByCategory.queryOptions({ category: 'new_opportunities' }));
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
    <main>
      <ScrollUp />
      <div className="py-24 md:py-32 lg:py-40 max-w-[1100px] mx-auto space-y-8 px-4 sm:px-6">
        <MultipleAnnouncementsBanner 
          page="new_opportunities" 
          theme="green" 
          maxAnnouncements={5} 
          containerWidth="w-full"
        />
        <div className="w-full">
          <NewOpportunitiesContent />
        </div>
      </div>
    </main>
    </HydrationBoundary>
  );
}
