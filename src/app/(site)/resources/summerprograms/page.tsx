
import ScrollUp from "@/components/Common/ScrollUp";

import { getAllPosts } from "@/utils/markdown";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/other/Layout";
import { layout } from "@/types/layout";
import HeaderLayout from "@/components/other/headerLayout";
import { Fragment } from "react";

export const metadata: Metadata = {
  title: "CRC ",
  description: "Career Resources Center Website",
};

const data:layout[] = [
  {
    id : 1,
    image: "/images/banners/image.svg",
    title : "Leadership Programs",
    description : "These summer leadership programs promote skill development, civic engagement, and youth empowerment. They are a great opportunity to learn about how to serve your community.",
    altText: "Leadership Programs Illustration",
    hasTwoLinks: false,
    links:[
      {text:"Go To Leadership Programs" , href:"/resources/summerprograms/leadership"},
    ]
  },
  {
    id:2,
    image: "/images/banners/image.svg",
    title: "Pre-college Programs",
    description: "Pre-College Programs are a fantastic way to improve your English skills and prepare to apply to university. They also offer a glimpse of what university classes are like.",
    altText: "Precollege Programs Illustration",
    hasTwoLinks: false,
    links:[
      {text:"Go To Pre-college Programs", href:"/"},
    ]
  },
  {
    id:3,
    image:"/images/banners/image.svg",
    title: "Isomo Progarms",
    description:"Bridge2Rwanda offers two programs for ASYV students. Isomo Circles focuses on English language training and Isomo Scholars prepares students for university applications. ",
    altText: "Isomo Programs Illustration",
    hasTwoLinks: false,
    links:[
      {text: "Go To Isomo Programs", href: "/resources/summerprograms/leadership"},
    ]
  }
]

export default function Home() {
  const posts = getAllPosts(["title", "date", "excerpt", "coverImage", "slug"]);

  return (
    <main>
      <ScrollUp />
      <HeaderLayout image="/images/banners/summer.svg" />
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
