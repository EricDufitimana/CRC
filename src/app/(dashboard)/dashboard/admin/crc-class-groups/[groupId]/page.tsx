import { CrcClassEditContent } from "@/components/dashboard/crc-class-edit/CrcClassEditContent";
import { CrcClassEditLoading } from "@/components/dashboard/crc-class-edit/CrcClassEditLoading";
import { DashboardErrorBoundary } from "@/components/dashboard/DashboardErrorBoundary";
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { getServerContext } from '@/trpc/init';

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function CrcClassGroupDetailPage({ params }: PageProps) {
  const { groupId } = await params;
  const context = await getServerContext();
  
  // Only prefetch if we have a valid authenticated admin user
  if (context.user && context.role === 'admin' && context.user.id) {
    try {
      // Prefetch CRC class students and all students
      prefetch(trpc.crcClassManagement.getCrcClassStudents.queryOptions({ classId: groupId }));
      prefetch(trpc.studentManagement.getStudents.queryOptions(undefined));
    } catch (error) {
      // Silently fail prefetch - data will load on client side
      console.warn('Prefetch failed, will load on client:', error);
    }
  }

  return (
    <HydrateClient>
      <DashboardErrorBoundary loadingFallback={<CrcClassEditLoading />}>
        <CrcClassEditContent />
      </DashboardErrorBoundary>
    </HydrateClient>
  );
}
