
import ScrollUp from "@/components/Common/ScrollUp";

import { getAllPosts } from "@/utils/markdown";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/other/Layout";
import { layout } from "@/types/layout";
import HeaderLayout from "@/components/other/headerLayout";
import ResourcesNotificationBanner from "@/components/Banner/ResourcesNotificationBanner";
import { Fragment } from "react";
import { client } from "@/sanity/lib/client";
import { getTemplates } from "@/sanity/lib/queries";

export const metadata: Metadata = {
  title: "CRC ",
  description: "Career Resources Center Website",
};

type Template = {
  _id: string;
  image_address?: string | null;
  title: string;
  description: string;
  url?: string;
  secondary_url?: string;
};

export default async function Home() {
  const data:Template[] = await client.fetch(getTemplates);
  return (
    <main>
      <ScrollUp />
      <HeaderLayout image="/images/banners/templates.svg" bottomPaddingClass="pb-6" />
      <div className="space-y-4">
        <ResourcesNotificationBanner page="templates" />
        <div className=" flex justify-center pb-12">
          <div className="content border border-gray-700 rounded-md p-8 w-[1100px]">

          {data.map((item, index) => (
            <Fragment key={item._id}>
              <Layout 
                key={item._id}
                image={item.image_address || "/images/banners/image.svg"}
                title={item.title}
                description={item.description}
                altText="illustration"
                double={true}
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
          ))}
          </div>
        </div>
      </div>


     
      
    </main>
  );
}
