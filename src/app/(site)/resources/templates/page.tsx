import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient, trpc } from '@/trpc/server';
import ScrollUp from '@/components/Common/ScrollUp';
import ConditionalHeader from '../../../../components/other/ConditionalHeader';
import MultipleAnnouncementsBanner from '@/components/Banner/MultipleAnnouncementsBanner';
import { TemplatesContent } from './templates-content';

export default async function Home() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.resources.getByCategory.queryOptions({ category: 'templates' }));
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
    <main>
      <ScrollUp />
      <ConditionalHeader 
        title="Templates" 
        description="Access helpful document templates and samples to jumpstart your projects and applications."
        image="/images/banners/templates.svg"
        bottomPaddingClass="pb-8"
      />
      <div className="space-y-8">
          <MultipleAnnouncementsBanner
            page="templates"
            theme="amber"
            maxAnnouncements={3}
            containerWidth="w-[1120px]"
          />
          <div className="flex justify-center pb-12">
          <div className="content border border-gray-700 rounded-md p-8 w-[1100px] max-w-[90%] mx-auto">
              <TemplatesContent />
              </div>
          </div>
        </div>
    </main>
    </HydrationBoundary>
  );
}
