import ScrollUp from "@/components/Common/ScrollUp";
import { Metadata } from "next";
import HeaderLayout from "@/components/other/headerLayout";
import ResourcesNotificationBanner from "@/components/Banner/ResourcesNotificationBanner";
import Layout from "@/components/other/Layout";
import { Fragment } from "react";
import { getNewOpportunities } from "@/sanity/lib/queries";
import { client } from "@/sanity/lib/client";

export const metadata: Metadata = {
  title: "CRC ",
  description: "Career Resources Center Website",
};

type Opportunity = {
  _id: string;
  image_address?: string | null;
  title: string;
  description: string;
  url?: string;
};

export default async function Home() {
  const data: Opportunity[] = await client.fetch(getNewOpportunities);
  return (
    <main>
      <ScrollUp />
      <HeaderLayout image="/images/banners/new_opportunities_2.svg" bottomPaddingClass="pb-6" />
      <div className="space-y-4">
        <ResourcesNotificationBanner page="new_opportunities" />
        <div className="flex justify-center pb-12">
          <div className="content border border-gray-700 rounded-md p-8 w-[1100px]">
          {data && data.length > 0 ? (
            data.map((item, index) => (
              <Fragment key={item._id}>
                <Layout
                  image={item.image_address || "/images/banners/image.svg"}
                  title={item.title}
                  description={item.description}
                  altText="illustration"
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
            <div className="text-center text-gray-500">No opportunities found.</div>
          )}
          </div>
        </div>
      </div>
    </main>
  );
}