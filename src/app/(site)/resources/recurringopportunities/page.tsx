import ScrollUp from "@/components/Common/ScrollUp";
import { Metadata } from "next";
import HeaderLayout from "@/components/other/headerLayout";
import MultipleAnnouncementsBanner from "@/components/Banner/MultipleAnnouncementsBanner";
import Layout from "@/components/other/ResourceLayout";
import { Fragment } from "react";
import { getRecurringOpportunities } from "@/sanity/lib/queries";
import { client } from "@/sanity/lib/client";
import { RotateCcw } from "lucide-react";

export const metadata: Metadata = {
  title: "Recurring Opportunities - CRC",
  description: "Explore ongoing and recurring opportunities available through the Career Resources Center",
};

type Opportunity = {
  _id: string;
  image_address?: string | null;
  title: string;
  description: string;
  url?: string;
  opportunity_deadline?: string;
};

export default async function RecurringOpportunities() {
  const data: Opportunity[] = await client.fetch(getRecurringOpportunities);
  
  return (
    <main>
      <ScrollUp />
      <HeaderLayout 
        image="/images/banners/recurring-opportunities.svg" 
        bottomPaddingClass="pb-8" 
      />
      <div className="space-y-8">
        <MultipleAnnouncementsBanner 
          page="recurring_opportunities" 
          theme="blue" 
          maxAnnouncements={5} 
          containerWidth="w-[1120px]"
        />
        <div className="flex justify-center pb-12">
          <div className="content border border-gray-700 rounded-md p-8 w-[1100px]">
            {data && data.length > 0 ? (
              data.map((item, index) => (
                <Fragment key={item._id}>
                  <Layout
                    image={item.image_address || "/images/banners/image.svg"}
                    title={item.title}
                    description={item.description}
                    altText="recurring opportunity illustration"
                    double={false}
                    links={
                      item.url
                        ? [{ text: `Learn More About ${item.title}`, href: item.url }]
                        : []
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
                    <RotateCcw className="h-16 w-16 mx-auto text-gray-300" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">No recurring opportunities available</h3>
                <p className="text-gray-500 max-w-md mx-auto">These opportunities repeat on a regular basis. Check back soon for new programs and ongoing initiatives.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
