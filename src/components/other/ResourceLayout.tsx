
import Image from "next/image";
import Link from "next/link";

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
  links?: LinkType[]
}


const Layout = ({image, title, description, double=false, links=[], altText} : LayoutProps) => {
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
                 <h2 className="text-2xl font-bold pb-4">{title}</h2>
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

