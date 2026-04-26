'use client';

import ScrollUp from "@/components/Common/ScrollUp";
import { ResourceHeader } from "@/components/resources/ResourceHeader";
import { ResourceCard } from "@/components/resources/ResourceCard";

const data = [
  {
    id: 1,
    image: "/images/banners/image.svg",
    title: "Leadership Programs",
    description: "These summer leadership programs promote skill development, civic engagement, and youth empowerment. They are a great opportunity to learn about how to serve your community.",
    links: [
      { text: "Go To Leadership Programs", href: "/resources/summerprograms/leadership" },
    ]
  },
  {
    id: 2,
    image: "/images/banners/image.svg",
    title: "Pre-college Programs",
    description: "Pre-College Programs are a fantastic way to improve your English skills and prepare to apply to university. They also offer a glimpse of what university classes are like.",
    links: [
      { text: "Go To Pre-college Programs", href: "/" },
    ]
  },
  {
    id: 3,
    image: "/images/banners/image.svg",
    title: "Isomo Programs",
    description: "Bridge2Rwanda offers two programs for ASYV students. Isomo Circles focuses on English language training and Isomo Scholars prepares students for university applications.",
    links: [
      { text: "Go To Isomo Programs", href: "/resources/summerprograms/leadership" },
    ]
  }
];

export default function SummerPrograms() {
  return (
    <main>
      <ScrollUp />
      <div className="py-40 max-w-[1280px] mx-auto space-y-8">
        <div className="flex justify-center">
          <div className="w-full">
            <ResourceHeader 
              title="Summer Programs" 
              description="Explore summer programs, pre-college courses, and leadership opportunities curated for your growth during the holiday." 
              count={data.length}
            />
            <div className="flex flex-col gap-4">
              {data.map((item) => (
                <ResourceCard
                  key={item.id}
                  title={item.title}
                  description={item.description}
                  image={item.image}
                  url={item.links[0]?.href}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
