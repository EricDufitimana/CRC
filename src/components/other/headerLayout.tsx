import Image from "next/image"



const Header = ({ image, topPaddingClass = "pt-[200px]", bottomPaddingClass = "pb-[100px]" }: { image: string, topPaddingClass?: string, bottomPaddingClass?: string }) => {
  return (
    <div className={`${topPaddingClass} ${bottomPaddingClass}`}>
      <Image
        src={image}
        className="object-cover object-center mx-auto block"
        width={1100}
        height={200}
        alt="banner"
        sizes="40vw"
        priority
      />
    </div>
  )
}

export default Header