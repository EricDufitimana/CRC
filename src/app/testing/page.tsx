"use client";

import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";

const TestHero = () => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-white pt-[100px] md:pt-[130px] lg:pt-[160px]"
    >
      <div className="container max-section-sm">
        <div className="flex flex-wrap">
          <div className="w-full px-4 flex items-start pt-4 gap-14 laptop-lg:pr-12">
            <div className="hero-content mx-auto max-w-[780px] text-center">
              {/* Static text without animations */}
              <h1 className="mb-6 text-3xl font-bold text-left leading-snug text-dark sm:text-4xl sm:leading-snug lg:text-5xl lg:leading-[1.2]">
                Welcome To <span className="text-secondary">ASYV Career</span> <br className="block" />
                <span className="text-secondary">Resources Center</span>
              </h1>
              <p className="mb-9 max-w-[600px] text-gray-500 text-left font-normal sm:text-lg sm:leading-[1.44]">
                Our goal is to prepare ASYV students for a successful transition post-graduation by providing them with career development workshops, mentorship events, job and internship opportunities, and university application support.
              </p>
              <div className="mb-10 flex flex-wrap gap-5">
                <button className="bg-secondary text-white px-6 py-3 rounded-lg font-medium hover:bg-secondary/90 transition-colors">
                  Get Started
                </button>
              </div>
              <p className={`text-sm text-left max-w-2xl text-red-400 ${isMobile ? "py-4" : ""}`}>
                *The resources and opportunities shared here are meant for current ASYV students. Please do not share with non-ASYV students. ASYV Alumni may access this website, but should be aware that they can find more useful information from the CRC Officer and Alumni Whatsapp and email groups.
              </p>
            </div>
            
            {/* Hero image container with exact same positioning */}
            <div
              className={`hero-image-container relative md:bottom-[90px] ${isMobile ? "hidden" : ""} w-[min(500px,42vw)] aspect-square shrink-0`}
            >
              {/* Desktop view - full image with overlays */}
              <>
                  {/* Hero image */}
                  <Image
                    src={"/images/hero/heroImage-4.svg"}
                    alt="illustration"
                    fill
                    priority
                    quality={85}
                    sizes="(max-width: 1280px) 42vw, 500px"
                    className="object-contain"
                  />
                  
                  {/* SVG Overlay Elements - same positioning as original */}
                  {/* Star */}
                  <div 
                    className="absolute opacity-100 w-[22%] aspect-square"
                    style={{
                      top: '82%',
                      left: '77%',
                      transform: 'translate(-50%, -50%)',
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
                    className="absolute opacity-100 w-[19%] aspect-square"
                    style={{
                      right: '-14%',
                      bottom: '50%',
                      transform: 'translateY(50%)',
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
                    className="absolute opacity-100 w-[52%] aspect-square"
                    style={{
                      top: '1%',
                      left: '1%',
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
  );
};

export default function TesttingPage() {
  return (
    <main>
      <TestHero />
      {/* Extra space to test scrolling */}
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Test Hero Page - Scroll up to see the hero section</p>
      </div>
    </main>
  );
}
