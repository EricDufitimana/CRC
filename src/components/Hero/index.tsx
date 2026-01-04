"use client";

import { useEffect } from "react";

import Image from "next/image";
import GetStartedButton from "../other/getStartedButton";
import { AnimatedText } from "../animation/AnimatedText";
import { ExtrudingComponent } from "../animation/ExtrudingComponent";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";


const Hero = () => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  useEffect(() => {
    console.log('Width:', window.innerWidth);
    console.log('Height:', window.innerHeight);
  }, []);
  return (
    <>
      <section
        id="home"
        className="relative overflow-hidden bg-white pt-[100px] md:pt-[130px] lg:pt-[160px]"
      >
        <div className="container max-section-sm">
          <div className="flex flex-wrap">
            <div className="w-full px-4 flex items-start pt-4 gap-14 laptop-lg:pr-12">
              <div
                className="hero-content wow fadeInUp mx-auto max-w-[780px] text-center md:text-center"
                data-wow-delay=".2s"
              >
                <AnimatedText 
                  animation="words-slide-up"
                  as="h1" 
                  className="mb-6 text-3xl font-bold text-left leading-snug text-dark sm:text-4xl sm:leading-snug lg:text-5xl lg:leading-[1.2]"
                >
                  Welcome To <span className="text-secondary">ASYV Career</span> <br className="block" />
                  <span className="text-secondary">Resources Center</span>
                </AnimatedText>
                <AnimatedText 
                  animation="words-slide-up"
                  as="p" 
                  className="mb-9 max-w-[600px] text-gray-500 text-left font-normal sm:text-lg sm:leading-[1.44]"
                  startTrigger="top 80%"
                >
                  Our goal is to prepare ASYV students for a successful transition post-graduation by providing them with career development workshops, mentorship events, job and internship opportunities, and university application support.
                </AnimatedText>
                <ul className="mb-10 flex flex-wrap gap-5">
                  <GetStartedButton />
                </ul>
                <AnimatedText 
                  animation="words-slide-from-right"
                  as="p" 
                  className={`text-sm text-left max-w-2xl text-red-400 ${isMobile ? "py-4" : ""}`}	
                  startTrigger="top 90%"
                >
                  *The resources and opportunities shared here are meant for current ASYV students. Please do not share with non-ASYV students. ASYV Alumni may access this website, but should be aware that they can find more useful information from the CRC Officer and Alumni Whatsapp and email groups.
                </AnimatedText>
              </div>
              <div
                className={`hero-image-container relative md:bottom-[90px] ${isMobile || isTablet ? "hidden" : ""} w-[min(500px,42vw)] aspect-square shrink-0`}
              >
                {/* Desktop view - full image with overlays */}
                <>
                  {/* Hero image with extrude effect */}
                  <ExtrudingComponent
                    delay={0.2}
                    springBounce={0.2}
                    duration={0.6}
                    scaleFrom={0.8}
                    scaleTo={1}
                    autoPlay={true}
                    className="w-full h-full"
                  >
                    <Image
                      src={"/images/hero/heroImage-4.svg"}
                      alt="illustration"
                      fill
                      priority
                      quality={85}
                      sizes="(max-width: 1280px) 42vw, 500px"
                      className="object-contain"
                    />
                  </ExtrudingComponent>
                  
                  {/* SVG Overlay Elements with fade-in animations */}
                  {/* Star */}
                  <div 
                    className="absolute opacity-0 w-[22%] aspect-square"
                    style={{
                      top: '72%',
                      left: '66%',
                      transform: 'translate(-50%, -50%)',
                      animation: 'fadeIn 0.8s ease-out forwards',
                      animationDelay: '1.4s'
                    }}
                  >
                    <Image
                      src="/images/hero/star.svg"
                      alt="Star"
                      fill
                      className="object-contain"
                    />
                  </div>
                  
                  {/* Up Lines */}
                  <div 
                    className="absolute opacity-0 w-[19%] aspect-square"
                    style={{
                      right: '-14%',
                      bottom: '40%',
                      transform: 'translateY(50%)',
                      animation: 'fadeIn 0.8s ease-out forwards',
                      animationDelay: '1.6s'
                    }}
                  >
                    <Image
                      src="/images/hero/up-lines.svg"
                      alt="Up Lines"
                      fill
                      className="object-contain"
                    />
                  </div>
                  
                  {/* Wavy Lines */}
                  <div 
                    className="absolute opacity-0 w-[52%] aspect-square"
                    style={{
                      top: '1%',
                      left: '1%',
                      animation: 'fadeIn 0.8s ease-out forwards',
                      animationDelay: '1.8s'
                    }}
                  >
                    <Image
                      src="/images/hero/wavy-lines.svg"
                      alt="Wavy Lines"
                      fill
                      className="object-contain"
                    />
                  </div>
                </>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
