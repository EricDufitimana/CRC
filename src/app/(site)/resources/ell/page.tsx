import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient, trpc } from '@/trpc/server';
import ScrollUp from '@/components/Common/ScrollUp';
import ConditionalHeader from '../../../../components/other/ConditionalHeader';
import MultipleAnnouncementsBanner from '@/components/Banner/MultipleAnnouncementsBanner';
import { ELLContent } from './ell-content';

export default async function Home() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.resources.getByCategory.queryOptions({ category: 'english_language_learning' }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
    <main>
      <ScrollUp />
      <ConditionalHeader 
        title="English Language Learning" 
        description="Access resources and tools to help improve your English language skills and communication abilities."
        image="/images/banners/english.svg"
        bottomPaddingClass="pb-8"
      />
      <div className="space-y-8">
          <MultipleAnnouncementsBanner
            page="english_language_learning"
            containerWidth="w-[1120px]"
            maxAnnouncements={3}
          />
        <div className="flex justify-center pb-12">
          <div className="content border border-gray-700 rounded-md p-8 w-[1100px] max-w-[90%] mx-auto">
              <ELLContent />
          </div>
        </div>
      </div>
    </main>
    </HydrationBoundary>
  );
}
