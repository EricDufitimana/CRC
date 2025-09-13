'use client';

import FaqCard from '@/components/Faq/faqCard';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionTitle from '../Common/SectionTitle';
import AnimateOnScroll from '../animation/animateOnScroll';
import Image from 'next/image';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const faqData = [
  {
    numberQn: "01",
    question: "What if I don't know what I want to do after ASYV?",
    answer: "Totally normal. Start by exploring talking to us or talking to an alumni mentor — sometimes it just takes one conversation to spark an idea.",
    top: -70,
    left: 150,
    degrees: 6,
    backgroundColor: "#7ADAA5",
    image: "1.svg"
  },
  {
    numberQn: "02", 
    question: "How do I balance academics and extracurriculars?",
    answer: "Time management is key. Create a schedule, prioritize tasks, and don't be afraid to ask for help when you need it.",
    top: -50,
    left: 120,
    degrees: -4,
    backgroundColor: "#239BA7",
    image: "2.png"
  },
  {
    numberQn: "03",
    question: "What resources are available for career guidance?",
    answer: "We offer mentorship programs, career counseling, alumni networks, and regular workshops on various career paths.",
    top: -80,
    left: 140,
    degrees: 8,
    backgroundColor: "#F08B51",
    image: "3.png" 
  },
  {
    numberQn: "04",
    question: "How can I improve my leadership skills?",
    answer: "Join student clubs, volunteer for projects, attend leadership workshops, and seek feedback from mentors and peers.",
    top: -60,
    left: 130,
    degrees: -2,
    backgroundColor: "#F2EDD1",
    image: "4.png"
  },
  {
    numberQn: "05",
    question: "What internship opportunities are available?",
    answer: "We partner with various organizations to offer internships in tech, business, healthcare, education, and more.",
    top: -75,
    left: 160,
    degrees: 5,
    backgroundColor: "#BBDCE5",
    image: "5.png"
  },
  {
    numberQn: "06",
    question: "How do I prepare for university applications?",
    answer: "Start early, maintain good grades, participate in extracurriculars, and get guidance from our college counselors.",
    top: -55,
    left: 135,
    degrees: -6,
    backgroundColor: "#FED16A",
    image: "6.png"
  }
];

export default function HorizontalFaq() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const scrollContainer = scrollRef.current;
    
    if (!container || !scrollContainer) return;

    // Create horizontal scroll animation
    const scrollWidth = scrollContainer.scrollWidth - container.clientWidth;
    
    const horizontalScroll = gsap.to(scrollContainer, {
      x: -scrollWidth,
      duration: 1,
      ease: "none",
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: () => `+=${scrollWidth}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      }
    });

    // Animate cards on scroll
    gsap.fromTo(".faq-card", 
      { 
        opacity: 0, 
        y: 100,
        scale: 0.8,
        rotation: 0
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotation: (index) => faqData[index]?.degrees || 0,
        duration: 1.2,
        stagger: 0.3,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: container,
          start: "top center",
          end: "center center",
          once: true,
          markers: false
        }
      }
    );

    return () => {
      horizontalScroll.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section 
      id="faq" 
      className="relative z-20 overflow-hidden bg-white pb-4 pt-12 dark:bg-dark lg:pb-[30px] lg:pt-[40px]"
      style={{
        backgroundImage: "url('/images/faq/background-image-2.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    >
      <div className="container mx-auto">
        <AnimateOnScroll direction="up" fadeIn>
          <SectionTitle
            subtitle="FAQ"
            title="Any Questions? Answered"
            paragraph="Got questions? We've got answers. Check below for quick tips on applications, internships, and how the CRC can help you move forward."
            width="640px"
            center
          />
        </AnimateOnScroll>
      
      </div>
      


      <div ref={containerRef} className="relative z-10 h-screen overflow-hidden mt-8 mb-16">
        {/* Dashed lines background */}

        
        <div 
          ref={scrollRef} 
          className="flex items-center h-full gap-8 px-8"
          style={{ width: `${faqData.length * 400}px` }}
        >
          {faqData.map((faq, index) => (
            <div key={index} className="faq-card flex-shrink-0">
              <FaqCard 
                numberQn={faq.numberQn}
                question={faq.question}
                answer={faq.answer}
                top={faq.top}
                left={faq.left}
                degrees={faq.degrees}
                backgroundColor={faq.backgroundColor}
                image={faq.image}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
