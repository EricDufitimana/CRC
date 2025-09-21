"use client"
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface LinkType  {
  text: string,
  href: string,
}

interface LayoutProps {
  image: string,
  altText: string,
  title: string,
  description: string,
  double?: boolean,
  links?: LinkType[],
  deadline?: string
}


const Layout = ({image, title, description, double=false, links=[], altText, deadline} : LayoutProps) => {
  const isMobile = useIsMobile();
  // Helper function to format deadline and determine urgency
  const formatDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: "Expired", urgent: true, color: "text-red-500" };
    if (diffDays === 0) return { text: "Due today", urgent: true, color: "text-red-600" };
    if (diffDays <= 3) return { text: `${diffDays} days left`, urgent: true, color: "text-orange-500" };
    if (diffDays <= 7) return { text: `${diffDays} days left`, urgent: false, color: "text-yellow-600" };
    return { text: deadlineDate.toLocaleDateString(), urgent: false, color: "text-gray-500" };
  };

  const deadlineInfo = deadline ? formatDeadline(deadline) : null;

  return (
    <main>
      
          <div className={isMobile ? "flex flex-col gap-6 justify-center items-center" : "p-8 flex justify-between"}>
            <div className={isMobile ? "relative w-[250px] h-[250px]" : "relative w-[350px] h-[350px]"}>
              <Image
                src={image}
                fill
                alt={altText}
                className="rounded-md object-cover" 
              />
            </div>
            <div className={`flex flex-col justify-between min-h-[350px] ${isMobile ? "w-full" : "w-[50%]"}`}>
              <div className="">
              <div className={`pb-4 ${isMobile ? "flex flex-col items-center text-center gap-2" : "flex items-center justify-between"}`}>
                <h2 className="text-2xl font-bold">{title}</h2>
                {deadlineInfo && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${deadlineInfo.color} ${isMobile ? "" : "ml-4"}`}>
                    <Calendar className="h-4 w-4" />
                    <span className="inline">{deadlineInfo.text}</span>
                  </div>
                )}
              </div>
              <p className={`pb-4 text-lg font-light ${isMobile ? "text-center" : ""}`}>{description}</p>
              </div>
              <div className={`flex justify-between  ${isMobile ? "-mt-2" : "mt-auto"}`}>
                {links.length>0 && (
                  <Link
                  href={links[0].href}
                  className={`border border-dark p-[15px] rounded-md font-medium text-sm hover:bg-dark hover:text-white transition ease-in-out duration-300 ${double? "": "w-full text-center p-[12px]"}`}
                  >
                    {links[0].text}
                  </Link>
                )}
                {double && links.length>1 && (
                  <Link
                    href={links[1].href}
                    className="border border-dark p-[15px] rounded-md font-medium text-sm hover:bg-dark hover:text-white transition ease-in-out duration-300"
                  >
                    {links[1].text}
                  </Link>
                )}
                

              </div>      
            </div>

          </div>


        

      

     
      
    </main>
  )
}

export default Layout

