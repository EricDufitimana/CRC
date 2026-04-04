import { ContentManagementContent } from "@/components/dashboard/admin/content-management/ContentManagementContent";
import { ContentManagementLoading } from "@/components/dashboard/admin/content-management/ContentManagementLoading";
import { DashboardErrorBoundary } from "@/components/dashboard/admin/DashboardErrorBoundary";
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { getServerContext } from '@/trpc/init';
import { Suspense } from 'react';

export default async function ContentManagementPage() {
  const context = await getServerContext();
  
  // Only prefetch if we have a valid authenticated admin user
  if (context.user && context.role === 'admin' && context.user.id) {
    try {
      // Prefetch content management queries for default category
      prefetch(trpc.contentManagement.getResourcesByCategory.queryOptions({
        category: 'new-opportunities',
      }));
    } catch (error) {
      // Silently fail prefetch - data will load on client side
      console.warn('Prefetch failed, will load on client:', error);
    }
  }

  return (
    <HydrateClient>
      <DashboardErrorBoundary loadingFallback={<ContentManagementLoading />}>
        <Suspense fallback={<ContentManagementLoading />}>
          <ContentManagementContent />
        </Suspense>
      </DashboardErrorBoundary>
    </HydrateClient>
  );
}
