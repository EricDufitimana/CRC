"use client";

import Link from "next/link";

const quickLinks = [
  {
    label: "Home",
    link: "/",
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

const Footer = () => {
  return (
    <footer className="bg-slate-900 py-8">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Quick Links */}
          <div className="mb-6 md:mb-0">
            <h4 className="mb-4 text-lg font-semibold text-white">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.link}
                    className="text-base text-white opacity-80 transition-all hover:opacity-100"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="mb-6 md:mb-0">
            <h4 className="mb-4 text-lg font-semibold text-white">
              Get in Touch
            </h4>
            <div className="flex items-center">
              <a 
                href="tel:+250794007353" 
                className="text-base text-white opacity-80 transition-all hover:opacity-100"
              >
                +250 794 007 353
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="text-center">
            <p className="text-sm text-white opacity-80">
              © {new Date().getFullYear()} ASYV Career Resource Center. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;