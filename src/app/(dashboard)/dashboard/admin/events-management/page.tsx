import { EventsContent } from "@/components/dashboard/admin/events-management/EventsContent";
import { EventsLoading } from "@/components/dashboard/admin/events-management/EventsLoading";
import { DashboardErrorBoundary } from "@/components/dashboard/admin/DashboardErrorBoundary";
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { getServerContext } from '@/trpc/init';
import { Suspense } from 'react';

export const metadata = {
  title: "Events Management | CRC Admin",
  description: "Manage previous and upcoming events for CRC.",
};

export default async function EventsManagementPage() {
  const context = await getServerContext();
  
  if (context.user && context.role === 'admin' && context.user.id) {
    try {
      // Prefetch events
      prefetch(trpc.eventsManagement.getEvents.queryOptions({ category: 'previous-events' }));
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  }

  return (
    <HydrateClient>
      <div className="p-4 md:p-8">
        <DashboardErrorBoundary loadingFallback={<EventsLoading />}>
          <Suspense fallback={<EventsLoading />}>
            <EventsContent />
          </Suspense>
        </DashboardErrorBoundary>
      </div>
    </HydrateClient>
  );
}