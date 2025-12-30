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
      <ConditionalHeader 
        title="Internship Opportunities" 
        description="Explore internship opportunities available through the Career Resources Center."
        image="/images/banners/internships.svg"
        bottomPaddingClass="pb-8"
      />
      <div className="space-y-8">
        <MultipleAnnouncementsBanner 
          page="internships" 
          theme="green" 
          maxAnnouncements={3} 
          containerWidth="w-[1120px]" 
        />
        <div className="flex justify-center pb-12">
          <div className="content border border-gray-700 rounded-md p-8 w-[1100px] max-w-[90%] mx-auto">
              <InternshipsContent />
          </div>
        </div>
      </div>
    </main>
    </HydrationBoundary>
  );
}
