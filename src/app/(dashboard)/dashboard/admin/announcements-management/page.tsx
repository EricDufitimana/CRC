import { AnnouncementsContent } from "@/components/dashboard/announcements/AnnouncementsContent";
import { AnnouncementsLoading } from "@/components/dashboard/announcements/AnnouncementsLoading";
import { DashboardErrorBoundary } from "@/components/dashboard/DashboardErrorBoundary";
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { getServerContext } from '@/trpc/init';

export const metadata = {
  title: "Announcements Management | CRC Admin",
  description: "Manage announcements across pages for CRC.",
};

export default async function AnnouncementsManagementPage() {
  const context = await getServerContext();
  
  if (context.user && context.role === 'admin' && context.user.id) {
    try {
      // Prefetch announcements (default is "all" which uses empty options)
      prefetch(trpc.announcementsManagement.getAnnouncements.queryOptions());
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  }

  return (
    <HydrateClient>
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
        <DashboardErrorBoundary loadingFallback={<AnnouncementsLoading />}>
          <AnnouncementsContent />
        </DashboardErrorBoundary>
      </div>
    </HydrateClient>
  );
}