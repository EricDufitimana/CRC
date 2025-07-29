import SectionTitle from "../Common/SectionTitle";
import SingleFeature from "./SingleFeature";
import featuresData from "./featuresData";
import AnimateOnScroll from "../animation/animateOnScroll";

const Features = () => {
  return (
    <section className="pb-8 pt-20 dark:bg-dark lg:pb-[70px] lg:pt-[120px]">
      <div className="container">
      <AnimateOnScroll direction="left" fadeIn>
        <SectionTitle
          center
          subtitle="Career Pathways"
          title="ASYV Pathways To Success"
          paragraph="At ASYV, we prepare you for what's next. Choose your future: pursue higher education, launch your own business, or step directly into the workforce."
        />
      </AnimateOnScroll>

        <div className="-mx-4 mt-12 flex flex-wrap justify-around lg:mt-20">
          {featuresData.map((feature, i) => (
              <SingleFeature key={i} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
