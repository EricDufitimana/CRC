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
      <div className="py-40 max-w-[1280px] mx-auto space-y-8">
        <MultipleAnnouncementsBanner 
          page="new_opportunities" 
          theme="green" 
          maxAnnouncements={5} 
          containerWidth="w-[1120px]"
        />
        <div className="flex justify-center">
          <NewOpportunitiesContent />
        </div>
      </div>
    </main>
    </HydrationBoundary>
  );
}
