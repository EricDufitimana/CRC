'use client';

import { TeamType } from "@/types/team";
import SectionTitle from "../Common/SectionTitle";
import SingleTeam from "./SingleTeam";
import AnimateOnScroll from "../animation/animateOnScroll";

const teamData: TeamType[] = [
  {
    id: 1,
    name: "Julius Kaboyo",
    designation: "Dean Of Students",
    image: "/images/team/kaboyo.jpg",
    linkedinLink: "https://www.linkedin.com/in/julius-kaboyo/",
    gmailLink: "julius@asyv.org",
  },
  {
    id: 2,
    name: "Dr. Isaac Ouma",
    designation: "CRC Teacher",
    image: "/images/team/ouma.jpg",
    linkedinLink: "https://www.linkedin.com/in/isaac-alando/",
    gmailLink: "mailto:isaac@asyv.org",
  },
  {
    id: 3,
    name: "Dylan Stage",
    designation: "CRC Fellow",
    image: "https://images.squarespace-cdn.com/content/v1/5a820ae0e45a7c13e22de06c/e27ec12f-703a-49db-b302-b035da36d7ae/Bio+Photo+%28Stage%2C+Dylan%29.jpg?format=500w",
    linkedinLink: "https://www.linkedin.com/in/dylanstage",
    gmailLink: "mailto:dylan@asyv.org",
  },
  {
    id: 4,
    name: "Claire Shea",
    designation: "CRC Fellow",
    image: "https://media.licdn.com/dms/image/v2/D5603AQFvcRPnOIIL3g/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1672016649539?e=2147483647&v=beta&t=f5PCXrV6KIGZVD6xa6pGar632xzFksb2p0f3xJLk_yU",
    linkedinLink: "https://www.linkedin.com/in/claire-m-shea",
    gmailLink: "mailto:claire@asyv.org",
  },
];


const Team = () => {
  return (
    <section
      id="team"
      className="overflow-hidden bg-gray-1 pb-12 pt-20 dark:bg-dark-2 lg:pb-[90px] lg:pt-[120px]"
    >
      <div className="container">
        <AnimateOnScroll direction="up" fadeIn>
        <div className="mb-[60px]">
          <SectionTitle
            subtitle="Our Team"
            title="Meet Our Team"
            paragraph="The people behind the CRC — mentors, alumni, and staff who show up every day to help you dream bigger, plan smarter, and step confidently into your future."
            width="640px"
            center
          />
        </div>
        </AnimateOnScroll>
        
        <AnimateOnScroll direction="right" fadeIn>
        <div className="-mx-4 flex flex-wrap justify-center">
          {teamData.map((team, i) => (
            <SingleTeam key={i} team={team} />
          ))}
        </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default Team;
