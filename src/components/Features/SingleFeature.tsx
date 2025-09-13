import { Feature } from "@/types/feature";
import { OptimizedScrollAnimation } from "../animation/OptimizedScrollAnimation";
import { OptimizedAnimatedText } from "../animation/OptimizedAnimatedText";

const SingleFeature = ({ feature }: { feature: Feature }) => {
  const { icon, title, paragraph } = feature;
  return (
    <div className="w-full px-4 md:w-1/2 lg:w-1/4">
      <OptimizedScrollAnimation direction="right" delay={400}>
        <div className="group mb-12">
          <div className="relative z-10 mb-8 flex h-[70px] w-[70px] items-center justify-center rounded-2xl bg-primary will-change-transform">
            <span className="absolute left-0 top-0 z-[-1] mb-8 flex h-[70px] w-[70px] rotate-[25deg] items-center justify-center rounded-2xl bg-primary bg-opacity-20 duration-300 group-hover:rotate-45 will-change-transform"></span>
            {icon}
          </div>
          <OptimizedAnimatedText
            animation="slide-right"
            as="h3"
            className="mb-3 text-xl font-bold text-dark dark:text-white"
            delay={100}
          >
            {title}
          </OptimizedAnimatedText>
          <OptimizedAnimatedText
            animation="slide-right"
            as="p"
            className="mb-8 text-body-color dark:text-dark-6 lg:mb-11"
            delay={100}
          >
            {paragraph}
          </OptimizedAnimatedText>
        </div>

      </OptimizedScrollAnimation>
      
    </div>
  );
};

export default SingleFeature;
