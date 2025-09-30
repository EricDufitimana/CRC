
import ScrollUp from "@/components/Common/ScrollUp";

import { getAllPosts } from "@/utils/markdown";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/other/ResourceLayout";
import { layout } from "@/types/layout";
import ResourcesNotificationBanner from "@/components/Banner/ResourcesNotificationBanner";
import MultipleAnnouncementsBanner from "@/components/Banner/MultipleAnnouncementsBanner";
import { Fragment, Suspense } from "react";
import { getTemplates } from "@/lib/supabase-queries";
import GridSkeleton from "@/components/ui/GridSkeleton";
import ResourceSkeleton from "@/components/ui/ResourceSkeleton";
import { FileText } from "lucide-react";
import { filterExpiredResources } from "@/utils/filterExpiredResources";
import ConditionalHeader from "../../../../components/other/ConditionalHeader";

export const metadata: Metadata = {
  title: "CRC ",
  description: "Career Resources Center Website",
};

type Template = {
  id: number;
  image_address?: string | null;
  title: string;
  description: string;
  url?: string;
  secondary_url?: string;
  opportunity_deadline?:string;
};

export default async function Home() {
  const data:Template[] = await getTemplates();
  const filteredData = filterExpiredResources(data);
  
  return (
    <main>
      <ScrollUp />
      <ConditionalHeader 
        title="Templates" 
        description="Access helpful document templates and samples to jumpstart your projects and applications."
        image="/images/banners/templates.svg"
        bottomPaddingClass="pb-8"
      />
      <div className="space-y-8">
        <MultipleAnnouncementsBanner page="templates" theme="amber" maxAnnouncements={3} containerWidth="w-[1120px]" />
        <Suspense fallback={<ResourceSkeleton count={5} />}>
          <div className=" flex justify-center pb-12">
            <div className="content border border-gray-700 rounded-md p-8 w-[1100px] max-w-[90%] mx-auto">

            {filteredData && filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <Fragment key={item.id}>
                  <Layout 
                    key={item.id}
                    image={item.image_address || "/images/banners/image.svg"}
                    title={item.title}
                    description={item.description}
                    altText="illustration"
                    double={true}
                    deadline={item.opportunity_deadline}
                    links={
                      item.url && item.secondary_url ? [
                        {text: "Blank Template", href: item.url},
                        {text: "Sample Template", href: item.secondary_url}
                      ] : item.url ? [
                        {text: "View Template", href: item.url}
                      ] : []
                    }
                  />
                  {index < data.length - 1 && (
                    <hr className="w-full my-8 border-gray-300" />
                  )}
                </Fragment>
              ))
            ) : (
              <div className="text-center text-gray-500 py-12">
                <div className="mb-6">
                  <div className="relative">
                    <FileText className="h-16 w-16 mx-auto text-gray-300" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">No templates available</h3>
                <p className="text-gray-500 max-w-md mx-auto">We&apos;re working on adding helpful document templates and samples. Check back soon for resources to jumpstart your projects.</p>
              </div>
            )}
            </div>
          </div>
        </Suspense>
      </div>


     
      
    </main>
  );
}
