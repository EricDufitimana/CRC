import { SettingsContent } from "@/components/dashboard/admin/settings/SettingsContent";
import { DashboardErrorBoundary } from "@/components/dashboard/admin/DashboardErrorBoundary";
import { HydrateClient, prefetch, trpc } from '@/trpc/server';
import { getServerContext } from '@/trpc/init';
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Settings | CRC Admin",
  description: "Manage admin profile and scheduling integration.",
};

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const context = await getServerContext();
  
  if (context.user && context.role === 'admin' && context.user.id) {
    try {
      // Prefetch settings so they are available immediately on the client
      prefetch(trpc.adminSettings.getSettings.queryOptions());
    } catch (error) {
      console.warn('Prefetch failed for settings:', error);
    }
  }

  return (
    <HydrateClient>
      <div className="p-4 md:p-8 max-w-[1200px] mx-auto">
        <DashboardErrorBoundary 
            loadingFallback={
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
            }
        >
          <SettingsContent />
        </DashboardErrorBoundary>
      </div>
    </HydrateClient>
  );
}
