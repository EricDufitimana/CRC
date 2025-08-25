
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

export const metadata: Metadata = {
  title: "CRC ",
  description: "Career Resources Center Website",
};

const data:layout[] = [
  {
    id : 1,
    image: "/images/banners/image.svg",
    title : "Isomo Internship Application",
    description : " **Please note that Intwari students have first priority for these positions. English proficiency and advanced skills are required. ",
    altText: "TechGrils Illustration",
    hasTwoLinks: false,
    links:[
      {text:"Apply To Isomo Internship" , href:"/"},
    ]
  }

]

export default function Home() {
  const posts = getAllPosts(["title", "date", "excerpt", "coverImage", "slug"]);

  return (
    <main className="space-y-12">
      <ScrollUp />
      <HeaderLayout image="/images/banners/internships.svg" bottomPaddingClass="pb-6"  />
        <ResourcesNotificationBanner page="internships" />
        <div className=" flex justify-center pb-12">
          <div className="content border border-gray-700 rounded-md p-8 w-[1100px] space-y-8">

          {data.map((item) => (
            <Fragment key={item.id}>
              <Layout 
                key = {item.id}
                image = {item.image}
                title = {item.title}
                description={item.description}
                altText = {item.altText}
                double = {item.hasTwoLinks}
                links = {item.links}
            
              />
              <div className="py-4"></div>

            </Fragment>
 
              
            
          ))}
        </div>
      </div>


     
      
    </main>
  );
}
