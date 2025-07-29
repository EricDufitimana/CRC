
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
    title : "TechGirls",
    description : "TechGirls is a U.S.-based summer exchange program designed to empower and support young women (ages 15-17) from the United States and select countries around the world to pursue higher education and careers in science, technology, engineering, and math (STEM) fields through hands-on skills development training.",
    altText: "TechGrils Illustration",
    hasTwoLinks: false,
    links:[
      {text:"Apply To TechGrils" , href:"/"},
    ]
  },
  {
    id:2,
    image: "/images/banners/image.svg",
    title: "PAYLP",
    description: "The goal of PAYLP is to create the next generation of leaders in Sub-Saharan Africa and around the world. This dynamic youth leadership program engages 150 high school students and adult mentors from over 40 countries in Africa for a three-week U.S.-based cultural exchange and civic engagement training program.",
    altText: "PAYLP Illustration",
    hasTwoLinks: false,
    links:[
      {text:"Apply To PAYLP", href:"/"},
    ]
  },
  {
    id:3,
    image:"/images/banners/image.svg",
    title: "RISE Challenge",
    description:"Rise is a program that finds promising young people and provides them with opportunities that allow them to work together to serve others over their lifetimes. The program seeks young people ages 15 to 17 and encourages a lifetime of service and learning by providing support that may include need-based scholarships, mentorship, networking, access to career development opportunities. ",
    altText: "Rise Challenge Illustration",
    hasTwoLinks: false,
    links:[
      {text: "Apply To Rise", href: "/resources/summerprograms/leadership"},
    ]
  },
  {
    id:4,
    image:"/images/banners/image.svg",
    title: "YES High School Fellowship",
    description:"An 8-week masterclass giving budding entrepreneurs the tools and mindset needed to develop or contribute to a successful startup!The application for summer 2025 is closed. ",
    altText: "Yale Entrepreneurship Illustration",
    hasTwoLinks: false,
    links:[
      {text: "Apply To YES High School Fellow", href: "/resources/summerprograms/leadership"},
    ]
  },
  {
    id:5,
    image:"/images/banners/image.svg",
    title: "The Moth Story Lab",
    description:"A free, virtual, out-of-school storytelling workshop series. High school students from all over the world meet to practice and perform Moth stories weekly for 8 weeks. The program ends with a performance that may be open to friends, and family.  ",
    altText: "Moth Story Lab Illustration",
    hasTwoLinks: false,
    links:[
      {text: "Apply To Moth Story Lab", href: "/resources/summerprograms/leadership"},
    ]
  }
]

export default function Home() {
  const posts = getAllPosts(["title", "date", "excerpt", "coverImage", "slug"]);

  return (
    <main>
      <ScrollUp />
      <HeaderLayout image="/images/banners/leadership.svg" />
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
