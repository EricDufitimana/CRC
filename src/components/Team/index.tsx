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
    facebookLink: "/#",
    twitterLink: "/#",
    instagramLink: "/#",
  },
  {
    id: 2,
    name: "Dr. Isaac Ouma",
    designation: "CRC Teacher",
    image: "/images/team/ouma.jpg",
    facebookLink: "/#",
    twitterLink: "/#",
    instagramLink: "/#",
  },
  {
    id: 3,
    name: "Princess Adeyinka",
    designation: "CRC Fellow",
    image: "/images/team/princess.jpg",
    facebookLink: "/#",
    twitterLink: "/#",
    instagramLink: "/#",
  },
  {
    id: 4,
    name: "Graham Dilworth",
    designation: "CRC Fellow",
    image: "/images/team/graham.jpg",
    facebookLink: "/#",
    twitterLink: "/#",
    instagramLink: "/#",
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
