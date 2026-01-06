import Image from "next/image";
import Link from "next/link";


const quickLinks = [
  {
    label: "Home",
    link: "/",
  },
  {
    label: "Career Resources",
    link: "/resources",
  },
  {
    label: "Events & Workshops",
    link: "/events/upcoming-events",
  },
  {
    label: "Book a meeting",
    link: "/login",
  }
]

const resources = [
  {
    label: "Templates",
    link: "/resources/templates",
  },
  {
    label: "Summer Programs",
    link: "/resources/summerprograms",
  },
  {
    label: "Internship Opportunities",
    link: "/resources/internships",
  },
  {
    label: "CRP",
    link: "/resources/crp",
  }
]

const workshops = [
  {
    label: "Enrichment Year",
    link: "/workshops/ey",
  },
  {
    label: "Senior 4",
    link: "/workshops/s4",
  },
  {
    label: "Senior 5",
    link: "/workshops/s5",
  },
  {
    label: "Senior 6",
    link: "/workshops/s6",
  },
]


  

const Footer = () => {
  return (
    <footer className="relative overflow-hidden pt-20 lg:pt-[100px]">
      <div className="absolute inset-0 -z-10">
        <svg
          className="h-full w-full"
          viewBox="0 0 1200 800"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="footer-pattern"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 0h100v100H0z"
                fill="#518C66"
                fillOpacity="0.1"
              />
              <path
                d="M50 0v100M0 50h100"
                stroke="#F29849"
                strokeWidth="1"
                strokeOpacity="0.2"
              />
            </pattern>
            <linearGradient id="footer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F29849" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#F29849" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#footer-pattern)"
          />
          <rect
            width="100%"
            height="100%"
            fill="url(#footer-gradient)"
          />
        </svg>
      </div>

      <div className="absolute -right-40 -top-40 z-0 h-80 w-80 animate-float rounded-full bg-[#518C66] opacity-10 mix-blend-multiply"></div>
      
      <div className="absolute -left-20 bottom-1/4 z-0 h-64 w-64 animate-float opacity-10" style={{ animationDelay: '2s' }}>
        <svg viewBox="0 0 200 200" fill="#518C66">
          <path d="M100 0L200 200H0z" />
        </svg>
      </div>
      
      <div className="absolute -bottom-40 -right-20 z-0 h-96 w-96 opacity-10">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#518C66"
            d="M45.1,-65.2C58.2,-56.5,68.6,-43.4,73.7,-28.3C78.8,-13.2,78.6,3.9,73.3,18.7C68,33.5,57.6,46.1,44.2,56.9C30.8,67.7,14.4,76.8,-1.5,79.1C-17.4,81.4,-34.8,76.9,-49.5,66.9C-64.2,56.9,-76.2,41.4,-80.3,23.9C-84.4,6.4,-80.6,-13.1,-71.5,-29.2C-62.4,-45.3,-48.1,-58,-33.1,-66.1C-18.1,-74.2,-2.4,-77.7,12.3,-73.8C27,-69.9,53.9,-58.6,45.1,-65.2Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>

      <div className="absolute left-1/4 top-1/3 h-32 w-64 opacity-10">
        <svg viewBox="0 0 200 100" preserveAspectRatio="none">
          <path 
            d="M0,50 C50,10 150,90 200,50" 
            stroke="#518C66" 
            strokeWidth="8" 
            fill="none"
          />
        </svg>
      </div>

      <div className="container relative z-10">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-4/12 xl:w-3/12">
            <div className="mb-10 w-full">
              <Link href="/" className="mb-2 -mt-4 inline-block max-w-[160px]">
                <Image
                  src="/images/hero/navImage.png"
                  alt="logo"
                  width={140}
                  height={30}
                  className="max-w-full"
                />
              </Link>
              <p className="mb-8 max-w-[270px] text-base text-white opacity-80">
                A dedicated platform for ASYV students and alumni to access career guidance, resources, and opportunities.
              </p>
              
              <div className="-mx-3 flex items-center">
                {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                  <Link
                    key={social}
                    href="#"
                    aria-label={`${social} link`}
                    className="group px-3 text-white opacity-80 transition-all hover:opacity-100 hover:-translate-y-1"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      className="fill-current transition-all group-hover:fill-[#518C66]"
                    >
                      <use href={`/icons/social.svg#${social}`} />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-2/12 xl:w-2/12">
            <div className="mb-10 w-full">
              <h4 className="mb-9 text-lg font-semibold text-white">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.link}
                      className="inline-block text-base text-white opacity-80 transition-all hover:opacity-100 hover:text-[#518C66] "
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-3/12 xl:w-2/12">
            <div className="mb-10 w-full">
              <h4 className="mb-9 text-lg font-semibold text-white">
                Resources
              </h4>
              <ul className="space-y-3">
                {resources.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.link}
                      className="inline-block text-base text-white opacity-80 transition-all hover:opacity-100 hover:text-[#518C66] "
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-3/12 xl:w-2/12">
            <div className="mb-10 w-full">
              <h4 className="mb-9 text-lg font-semibold text-white">
                Workshops
              </h4>
              <ul className="space-y-3">
                {workshops.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.link}
                      className="inline-block text-base text-white opacity-80 transition-all hover:opacity-100 hover:text-[#518C66] "
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="w-full px-4 md:w-2/3 lg:w-6/12 xl:w-3/12">
            <div className="mb-10 w-full">
              <h4 className="mb-9 text-lg font-semibold text-white">
                Contact CRC
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="mr-3 mt-1 h-5 w-5 text-[#518C66]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <Link href="mailto:crc@asyv.org" className="text-base text-white opacity-80 transition-all hover:opacity-100 hover:text-[#518C66]">
                    crc@asyv.org
                  </Link>
                </li>
                <li className="flex items-start">
                  <svg className="mr-3 mt-1 h-5 w-5 text-[#518C66]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <span className="text-base text-white opacity-80">P.O BOX 7323</span>
                </li>
                <li className="flex items-start">
                  <svg className="mr-3 mt-1 h-5 w-5 text-[#518C66]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-base text-white opacity-80">Agahozo-Shalom Youth Village</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-12 py-8">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
        <div className="container">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4 md:w-2/3 lg:w-1/2">
              <div className="text-center md:text-left">
                <p className="text-sm text-white opacity-80">
                  © {new Date().getFullYear()} ASYV Career Resource Center. All rights reserved.
                </p>
              </div>
            </div>
            <div className="w-full px-4 md:w-1/3 lg:w-1/2">
              <div className="mt-4 text-center md:mt-0 md:text-right">
                <p className="text-sm text-white opacity-80">
                  Designed and Developed by{' '}
                  <Link
                    href="#"
                    className="font-medium text-[#518C66] transition-all hover:underline hover:opacity-100"
                  >
                    Eric Dufitimana
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute left-1/3 top-1/4 h-40 w-40 animate-float rounded-full bg-[#518C66] opacity-10 mix-blend-multiply" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute right-1/4 bottom-1/3 h-32 w-32 animate-float opacity-10" style={{ animationDelay: '3s' }}>
        <svg viewBox="0 0 200 200" fill="#518C66">
          <polygon points="100,0 200,100 100,200 0,100" />
        </svg>
      </div>
    </footer>
  );
};

export default Footer;