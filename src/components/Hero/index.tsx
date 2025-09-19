"use client";

import { useEffect } from "react";

import Image from "next/image";
import GetStartedButton from "../other/getStartedButton";
import { AnimatedText } from "../animation/AnimatedText";
import { ExtrudingComponent } from "../animation/ExtrudingComponent";


const Hero = () => {
  useEffect(() => {
    console.log('Width:', window.innerWidth);
    console.log('Height:', window.innerHeight);
  }, []);
  return (
    <>
      <section
        id="home"
        className="relative overflow-hidden bg-white pt-[120px] md:pt-[130px] lg:pt-[160px]"
      >
        <div className="container max-section-sm">
          <div className="flex flex-wrap">
            <div className="w-full px-4 flex items-start pt-4 gap-14 laptop-lg:pr-12">
              <div
                className="hero-content wow fadeInUp mx-auto max-w-[780px] text-center"
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
                  className="text-sm text-left max-w-2xl text-red-400"
                  startTrigger="top 90%"
                >
                  *The resources and opportunities shared here are meant for current ASYV students. Please do not share with non-ASYV students. ASYV Alumni may access this website, but should be aware that they can find more useful information from the CRC Officer and Alumni Whatsapp and email groups.
                </AnimatedText>
              </div>
              <div className="hero-image-container relative">
                {/* Hero image with extrude effect */}
                <ExtrudingComponent
                  delay={0.2}
                  springBounce={0.2}
                  duration={0.6}
                  scaleFrom={0.8}
                  scaleTo={1}
                  autoPlay={true}
                >
                  <Image 
                    src={"/images/hero/heroImage-4.svg"}
                    alt = "illustration"
                    width = {500}
                    height = {500}
                    priority
                    quality={85}
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="relative bottom-[90px] object-cover"
                    // style={{
                    //   animation: 'subtle-float 3s ease-in-out infinite',
                    //   animationDelay: '1s'
                    // }}
                  />
                </ExtrudingComponent>
                
                {/* SVG Overlay Elements with fade-in animations */}
                {/* Orange X */}
               
               
                {/* Star */}
                <div 
                  className="absolute top-[300px] left-[330px] w-28 h-28 opacity-0 md:opacity-100 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
                  style={{
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
                  className="absolute bottom-[250px] right-[-90px] w-24 h-24 opacity-0 hidden sm:block md:w-20 md:h-20 lg:w-24 lg:h-24"
                  style={{
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
                  className="absolute top-[-80px] left-[-5px] w-64 h-64 opacity-0 hidden md:block lg:w-56 lg:h-56 xl:w-64 xl:h-64"
                  style={{
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
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
