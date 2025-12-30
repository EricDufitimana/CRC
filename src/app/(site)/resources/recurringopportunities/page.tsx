import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient, trpc } from '@/trpc/server';
import ScrollUp from '@/components/Common/ScrollUp';
import ConditionalHeader from '../../../../components/other/ConditionalHeader';
import MultipleAnnouncementsBanner from '@/components/Banner/MultipleAnnouncementsBanner';
import { RecurringOpportunitiesContent } from './recurring-opportunities-content';

export default async function RecurringOpportunities() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.resources.getByCategory.queryOptions({ category: 'recurring_opportunities' }));
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
    <main>
      <ScrollUp />
      <ConditionalHeader 
        title="Recurring Opportunities" 
        description="Explore ongoing and recurring opportunities available through the Career Resources Center."
        image="/images/banners/recurring-opportunities.svg"
        bottomPaddingClass="pb-8"
      />
      <div className="space-y-8">
        <MultipleAnnouncementsBanner 
          page="recurring_opportunities" 
          theme="blue" 
          maxAnnouncements={5} 
          containerWidth="w-[1120px]"
        />
        <div className="flex justify-center pb-12">
          <div className="content border border-gray-700 rounded-md p-8 w-[1100px] max-w-[90%] mx-auto">
              <RecurringOpportunitiesContent />
          </div>
        </div>
      </div>
    </main>
    </HydrationBoundary>
  );
}
