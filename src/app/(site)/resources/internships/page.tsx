
import ScrollUp from "@/components/Common/ScrollUp";
import { Metadata } from "next";
import Layout from "@/components/other/ResourceLayout";
import HeaderLayout from "@/components/other/headerLayout";
import MultipleAnnouncementsBanner from "@/components/Banner/MultipleAnnouncementsBanner";
import { Fragment } from "react";
import { getInternships } from "@/sanity/lib/queries";
import { client } from "@/sanity/lib/client";
import { Briefcase } from "lucide-react";

export const metadata: Metadata = {
  title: "Internships - CRC",
  description: "Explore internship opportunities available through the Career Resources Center",
};

type Internship = {
  _id: string;
  image_address?: string | null;
  title: string;
  description: string;
  url?: string;
  opportunity_deadline?: string;
};

export default async function Internships() {
  const data: Internship[] = await client.fetch(getInternships);

  return (
    <main>
      <ScrollUp />
      <HeaderLayout image="/images/banners/internships.svg" bottomPaddingClass="pb-8" />
      <div className="space-y-8">
        <MultipleAnnouncementsBanner 
          page="internships" 
          theme="green" 
          maxAnnouncements={3} 
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
                    altText="internship illustration"
                    double={false}
                    links={
                      item.url
                        ? [{ text: `Apply to ${item.title}`, href: item.url }]
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
                    <Briefcase className="h-16 w-16 mx-auto text-gray-300" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">No internships available</h3>
                <p className="text-gray-500 max-w-md mx-auto">We're constantly seeking new internship opportunities for our students. Check back regularly for new openings and partnerships.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
