import ResourceSkeleton from "@/components/ui/ResourceSkeleton";
import ScrollUp from "@/components/Common/ScrollUp";
import HeaderLayout from "@/components/other/headerLayout";
import ResourcesNotificationBanner from "@/components/Banner/ResourcesNotificationBanner";

export default function Loading() {
  return (
    <main>
      <ScrollUp />
      <HeaderLayout image="/images/banners/templates.svg" bottomPaddingClass="pb-6" />
      <div className="space-y-4">
        <ResourcesNotificationBanner page="templates" />
        <ResourceSkeleton count={5} />
      </div>
    </main>
  );
}

