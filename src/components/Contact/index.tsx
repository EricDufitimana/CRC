import Link from "next/link";
import AnimateOnScroll from "../animation/animateOnScroll";
const Contact = () => {
  return (
    <section id="contact" className="relative py-20 md:py-[120px]">
      <div className="absolute left-0 top-0 -z-[1] h-full w-full dark:bg-dark"></div>
      <div className="absolute left-0 top-0 -z-[1] h-1/2 w-full bg-[#E9F9FF] dark:bg-dark-700 lg:h-[45%] xl:h-1/2"></div>
      <div className="container px-4">
        <div className="-mx-4 flex flex-wrap items-center">
          <div className="w-full px-4 lg:w-7/12 xl:w-8/12">
            <div className="ud-contact-content-wrapper">
              <div className="ud-contact-title mb-12 lg:mb-[150px]">
                <span className="mb-6 block text-base font-medium text-dark dark:text-white">
                  CONTACT US
                </span>
                <h2 className="max-w-[260px] text-[35px] font-semibold leading-[1.14] text-dark dark:text-white">
                  Let&#39;s talk about your future.
                </h2>
              </div>
              <div className="mb-12 flex flex-wrap justify-between lg:mb-0">
                <div className="mb-8 flex w-[330px] max-w-full">
                  <div className="mr-6 text-[32px] text-primary">
                    <svg
                      width="34"
                      height="25"
                      viewBox="0 0 34 25"
                      className="fill-current"
                    >
                      <path d="M28.125 2.5H26.25V0.625C26.25 0.28125 25.9688 0 25.625 0H24.375C24.0312 0 23.75 0.28125 23.75 0.625V2.5H10V0.625C10 0.28125 9.71875 0 9.375 0H8.125C7.78125 0 7.5 0.28125 7.5 0.625V2.5H5.625C4.3125 2.5 3.28125 3.53125 3.28125 4.84375V21.4062C3.28125 22.7188 4.3125 23.75 5.625 23.75H28.125C29.4375 23.75 30.4688 22.7188 30.4688 21.4062V4.84375C30.4688 3.53125 29.4375 2.5 28.125 2.5ZM28.125 21.4062H5.625V9.0625H28.125V21.4062Z" />
                    </svg>
                  </div>
                  <AnimateOnScroll direction="down" fadeIn>
                  <div>
                    <h3 className="mb-[18px] text-lg font-semibold text-dark dark:text-white">
                      Book a meeting
                    </h3>
                    <p className="text-base text-body-color dark:text-dark-6">
                      <Link
                        href={"/"}
                        className="inline-flex items-center justify-center rounded-md border border-primary px-14 py-[14px] text-center text-dark font-medium text-dark shadow-1 transition duration-300 ease-in-out hover:bg-primary hover:text-white "
                      >
                        Book A Meeting
                      </Link>
                    </p>
                  </div>
                  </AnimateOnScroll>
                </div>
                <div className="mb-8 flex w-[330px] max-w-full">
                  <div className="mr-6 text-[32px] text-primary">
                    <svg
                      width="34"
                      height="25"
                      viewBox="0 0 34 25"
                      className="fill-current"
                    >
                      <path d="M28.125 2.5H26.25V0.625C26.25 0.28125 25.9688 0 25.625 0H24.375C24.0312 0 23.75 0.28125 23.75 0.625V2.5H10V0.625C10 0.28125 9.71875 0 9.375 0H8.125C7.78125 0 7.5 0.28125 7.5 0.625V2.5H5.625C4.3125 2.5 3.28125 3.53125 3.28125 4.84375V21.4062C3.28125 22.7188 4.3125 23.75 5.625 23.75H28.125C29.4375 23.75 30.4688 22.7188 30.4688 21.4062V4.84375C30.4688 3.53125 29.4375 2.5 28.125 2.5ZM28.125 21.4062H5.625V9.0625H28.125V21.4062Z" />
                    </svg>
                  </div>
                  <AnimateOnScroll direction="down" fadeIn>
                  <div>
                    <h3 className="mb-[18px] text-lg font-semibold text-dark dark:text-white">
                      How Can We Help?
                    </h3>
                    <p className="text-base text-body-color dark:text-dark-6">
                      crc@asyv.org
                    </p>
                    <p className="mt-1 text-base text-body-color dark:text-dark-6">
                      kaboyo@asyv.org
                    </p>
                  </div>
                  </AnimateOnScroll>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full px-4 lg:w-5/12 xl:w-4/12">
            <div
              className="wow fadeInUp rounded-lg bg-white px-8 py-10 shadow-testimonial dark:bg-dark-2 dark:shadow-none sm:px-10 sm:py-12 md:p-[60px] lg:p-10 lg:px-10 lg:py-12 2xl:p-[60px]"
              data-wow-delay=".2s
              "
            >
              <h3 className="mb-8 text-2xl font-semibold text-dark dark:text-white md:text-[28px] md:leading-[1.42]">
                Send us a Message
              </h3>
              <form>
                <div className="mb-[22px]">
                  <label
                    htmlFor="fullName"
                    className="mb-4 block text-sm text-body-color dark:text-dark-6"
                  >
                    Full Name*
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Adam Gelius"
                    className="w-full border-0 border-b border-[#f1f1f1] bg-transparent pb-3 text-dark placeholder:text-body-color/60 focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white"
                  />
                </div>
                <div className="mb-[22px]">
                  <label
                    htmlFor="email"
                    className="mb-4 block text-sm text-body-color dark:text-dark-6"
                  >
                    Email*
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="example@yourmail.com"
                    className="w-full border-0 border-b border-[#f1f1f1] bg-transparent pb-3 text-dark placeholder:text-body-color/60 focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white"
                  />
                </div>
                
                <div className="mb-[30px]">
                  <label
                    htmlFor="message"
                    className="mb-4 block text-sm text-body-color dark:text-dark-6"
                  >
                    Message*
                  </label>
                  <textarea
                    name="message"
                    rows={1}
                    placeholder="type your message here"
                    className="w-full resize-none border-0 border-b border-[#f1f1f1] bg-transparent pb-3 text-dark placeholder:text-body-color/60 focus:border-primary focus:outline-none dark:border-dark-3 dark:text-white"
                  ></textarea>
                </div>
                <div className="mb-0">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-10 py-3 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
