
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";

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
      
          <div className="p-8 flex justify-between">
            <div className="relative w-[350px] h-[350px]">
              <Image
                src={image}
                fill
                alt={altText}
                className="rounded-md object-cover" 
              />
            </div>
            <div className="w-[50%] flex flex-col justify-between h-[350px] ">
              <div className="">
                 <div className="flex items-start justify-between pb-4">
                   <h2 className="text-2xl font-bold">{title}</h2>
                   {deadlineInfo && (
                     <div className={`flex items-center gap-1 text-sm font-medium ${deadlineInfo.color} ml-4`}>
                       <Calendar className="h-4 w-4" />
                       <span>{deadlineInfo.text}</span>
                     </div>
                   )}
                 </div>
                  <p className="pb-4 text-lg font-light">{description}</p>
              </div>
              <div className="flex justify-between mt-auto">
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

