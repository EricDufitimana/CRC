import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <>
      <section
        id="home"
        className="relative overflow-hidden bg-white pt-[120px] md:pt-[130px] lg:pt-[160px]"
      >
        <div className="container max-section-sm">
          <div className="flex flex-wrap">
            <div className="w-full px-4 flex items-start pt-8">
              <div
                className="hero-content wow fadeInUp mx-auto max-w-[780px] text-center"
                data-wow-delay=".2s"
              >
                <h1 className="mb-6 text-3xl font-bold text-left leading-snug text-dark sm:text-4xl sm:leading-snug lg:text-5xl lg:leading-[1.2]">
                  Welcome To <span className="text-secondary">ASYV Career Resources Center </span>               </h1>
                <p className=" mb-9 max-w-[600px] text-gray-500 text-left font-normal sm:text-lg sm:leading-[1.44]">
                  Our goal is to prepare ASYV students for a successful transition post-graduation by providing them with career development workshops, mentorship events, job and internship opportunities, and university application support.
                </p>
                <ul className="mb-10 flex flex-wrap gap-5">
                  <li>
                    <Link
                      href="#"
                      className="inline-flex items-center justify-center rounded-md bg-dark px-14 py-[14px] text-center text-white font-medium text-dark shadow-1 transition duration-300 ease-in-out "
                    >
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      target="_blank"
                      className="flex items-center gap-4 rounded-md bg-white text-dark border border-dark px-14 py-[14px]  font-medium  transition duration-300 ease-in-out hover:bg-white hover:text-dark"
                    >
                      Sign Up
                    </Link>
    

                  </li>
                </ul>
                <p className="text-sm text-left max-w-2xl text-red-400">
                  *The resources and opportunities shared here are meant for current ASYV students. Please do not share with non-ASYV students. ASYV Alumni may access this website, but should be aware that they can find more useful information from the CRC Officer and Alumni Whatsapp and email groups.
                </p>
              </div>
              <div className="">
                  <Image 
                    src={"/images/hero/heroImage.svg"}
                    alt = "illustration"
                    width = {500}
                    height = {500}
                    className="relative bottom-[160px]"
                  />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
