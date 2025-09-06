import AnimateOnScroll from "../animation/animateOnScroll";

const SectionTitle = ({
  subtitle,
  title,
  paragraph,
  width = "635px",
  center,
}: {
  subtitle?: string;
  title: string;
  paragraph: string;
  width?: string;
  center?: boolean;
}) => {
  return (
    <div className="-mx-4 flex flex-wrap">
      <div
        className={`w-full px-4 ${
          center ? "mx-auto text-center" : ""
        }`}
        style={{ maxWidth: width }}
      >
        {subtitle && (
          <AnimateOnScroll direction="up" delay={0.1}>
            <span className="mb-2 block text-lg font-semibold text-primary">
              {subtitle}
            </span>
          </AnimateOnScroll>
        )}
        <AnimateOnScroll direction="up" delay={0.2}>
          <h2 className="mb-4 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px] md:leading-[1.2]">
            {title}
          </h2>
        </AnimateOnScroll>
        <AnimateOnScroll direction="up" delay={0.3}>
          <p className="text-base leading-relaxed text-body-color dark:text-dark-6 sm:leading-relaxed">
            {paragraph}
          </p>
        </AnimateOnScroll>
      </div>
    </div>
  );
};

export default SectionTitle;
