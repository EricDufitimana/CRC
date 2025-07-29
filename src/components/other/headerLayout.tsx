import Image from "next/image"
const header = ({image}:{image:string}) => {
  return (
    <div className="pt-[200px] pb-[100px]">
            <Image
            src={image}
            className=" object-cover object-center mx-auto block"
            width={1100}
            height={200}
            alt="banner"
            sizes="40vw"
            priority
            
            />
    
    </div>
  )
}

export default header