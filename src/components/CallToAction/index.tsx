"use client";
import {useSpring, animated} from "@react-spring/web";
import AnimateOnScroll from "../animation/animateOnScroll";
import { useInView } from "react-intersection-observer";


function Number({ n }: { n: number }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { number } = useSpring({
    from: { number: 0 },
    to: { number: inView ? n : 0 },
    delay: 400,
    config: { mass: 1, tension: 20, friction: 10 },
  });

  return (
    <animated.div ref={ref} className={"inline"}>
      {number.to((n) => n.toFixed(0))}
    </animated.div>
  );
}

const CallToAction = () => {
  return (
  <AnimateOnScroll direction="down" delay={0.2}>
    <section className="relative z-10 overflow-hidden bg-secondary_lite py-12 lg:py-[8px]">
      <div className="container mx-auto p-4">
        <div className="relative overflow-hidden">
          <div className="-mx-4 flex flex-wrap items-stretch">
            <div className="w-full px-4">
              <div className=" text-left flex justify-between">
                <div className="p-4">
                  <h2 className="mb-2.5 text-3xl font-bold text-dark md:text-[38px] md:leading-[1.44]">
                  <span>Our Impact in <span className="text-primary">Numbers</span></span>
                  </h2>
                  <p className="mx-auto mb-6 max-w-[515px] text-md leading-[1.5] text-gray-400">
                    At Agahozo-Shalom Youth Village, it’s more than guidance — it’s real results.
                    Here’s a glimpse into how our Career Resources Center is helping students dream bigger, prep smarter, and step confidently into the future.
                  </p>
                </div>
                <div className="grid grid-cols-2 p-4 max-w-[500px] gap-8 text-dark ">
                  <div className="">
                    <h1 className="text-4xl font-bold "><Number n={60} />+</h1>
                    <p className="text-sm text-gray-400">Students accepted to universities abroad</p>
                  </div>
                  <div className="">
                    <h1 className="text-4xl font-bold"><Number n={40}/>+</h1>
                    <p className="text-sm text-gray-400">Graduates now employed in top local & international orgs</p>
                  </div>
                  <div className="">
                    <h1 className="text-4xl font-bold"><Number n={30}/>+</h1>
                    <p className="text-sm text-gray-400">Alumni & mentors ready to guide</p>
                  </div>
                  <div className="">
                    <h1 className="text-4xl font-bold"><Number n={200}/>+</h1>
                    <p className="text-sm text-gray-400">CVs, essays, and portfolios built & reviewed</p>
                  </div>
                </div>
                
              
              </div>
            </div>
          </div>
        </div>
        
      </div>
      <div>
        <span className="absolute left-0 top-0">
          <svg
            width="495"
            height="470"
            viewBox="0 0 495 470"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="55"
              cy="442"
              r="138"
              stroke="orange"
              strokeOpacity="0.04"
              strokeWidth="50"
            />
            <circle
              cx="446"
              r="39"
              stroke="orange"
              strokeOpacity="0.2"
              strokeWidth="20"
            />
            <path
              d="M245.406 137.609L233.985 94.9852L276.609 106.406L245.406 137.609Z"
              stroke="orange"
              strokeOpacity="0.2"
              strokeWidth="12"
            />
          </svg>
        </span>
        <span className="absolute bottom-0 right-0">
          <svg
            width="493"
            height="470"
            viewBox="0 0 493 470"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="462"
              cy="5"
              r="138"
              stroke="orange"
              strokeOpacity="0.2"
              strokeWidth="50"
            />
            <circle
              cx="49"
              cy="470"
              r="39"
              stroke="orange"
              strokeOpacity="0.2"
              strokeWidth="20"
            />
            <path
              d="M222.393 226.701L272.808 213.192L259.299 263.607L222.393 226.701Z"
              stroke="orange"
              strokeOpacity="0.2"
              strokeWidth="13"
            />
          </svg>
        </span>
      </div>
    </section>
  </AnimateOnScroll>
  );
};

export default CallToAction;