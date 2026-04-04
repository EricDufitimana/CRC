import { WorkshopsContent } from "@/components/dashboard/admin/workshops/WorkshopsContent";
import { WorkshopsLoading } from "@/components/dashboard/admin/workshops/WorkshopsLoading";
import { DashboardErrorBoundary } from "@/components/dashboard/admin/DashboardErrorBoundary";
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { getServerContext } from '@/trpc/init';
import { Suspense } from 'react';

export default async function WorkshopsPage() {
  const context = await getServerContext();
  
  if (context.user && context.role === 'admin' && context.user.id) {
    try {
      // Prefetch common queries
      prefetch(trpc.workshopsManagement.getCrcClasses.queryOptions());
      prefetch(trpc.workshopsManagement.getWorkshopsByCategory.queryOptions({ category: 'ey' }));
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  }

  return (
    <HydrateClient>
      <DashboardErrorBoundary loadingFallback={<WorkshopsLoading />}>
        <Suspense fallback={<WorkshopsLoading />}>
          <WorkshopsContent />
        </Suspense>
      </DashboardErrorBoundary>
    </HydrateClient>
  );
}