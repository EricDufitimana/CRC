import { CrcClassManagementContent } from "@/components/dashboard/crc-class-management/CrcClassManagementContent";
import { CrcClassManagementLoading } from "@/components/dashboard/crc-class-management/CrcClassManagementLoading";
import { DashboardErrorBoundary } from "@/components/dashboard/DashboardErrorBoundary";
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { getServerContext } from '@/trpc/init';

export default async function CrcClassGroupsPage() {
  const context = await getServerContext();
  
  // Only prefetch if we have a valid authenticated admin user
  if (context.user && context.role === 'admin' && context.user.id) {
    try {
      // Prefetch CRC class management queries
      prefetch(trpc.crcClassManagement.getCrcClasses.queryOptions(undefined));
    } catch (error) {
      // Silently fail prefetch - data will load on client side
      console.warn('Prefetch failed, will load on client:', error);
    }
  }

  return (
    <HydrateClient>
      <DashboardErrorBoundary loadingFallback={<CrcClassManagementLoading />}>
        <CrcClassManagementContent />
      </DashboardErrorBoundary>
    </HydrateClient>
  );
}
