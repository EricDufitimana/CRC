"use client";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import menuData from "./menuData";

const Header = () => {

  const pathUrl = usePathname();
  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen);
  };

  // Sticky Navbar
  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
  });

  // submenu handler
  const [openIndex, setOpenIndex] = useState(-1);
  const [openNestedIndex, setOpenNestedIndex] = useState(-1);
  
  const handleSubmenu = (index: any) => {
    if (openIndex === index) {
      setOpenIndex(-1);
    } else {
      setOpenIndex(index);
    }
  };

  const handleNestedSubmenu = (index: any) => {
    if (openNestedIndex === index) {
      setOpenNestedIndex(-1);
    } else {
      setOpenNestedIndex(index);
    }
  };

  const { theme, setTheme } = useTheme();
  const [loading, setLoading ] = useState(false);

  return (
    <>
      <header
        style={{ top: "var(--banner-height, 0px)" }}
        className={`ud-header left-0 fixed z-40 flex w-full items-center ${
          sticky
            ? "shadow-nav fixed z-[999] border-b border-stroke bg-white/80 backdrop-blur-[5px] dark:border-dark-3/20 dark:bg-dark/10"
            : "bg-transparent"
        }`}
      >
        <div className="container">
          <div className="relative -mx-14 flex items-center justify-between">
            <div className="w-60 max-w-full px-4">
              <Link
                href="/"
                className={`navbar-logo block w-full ${
                  sticky ? "py-2" : "py-5"
                } `}
              >
                {pathUrl !== "/" ? (
                  <>
                    <Image
                      src={"/images/hero/navImage.png"}
                      alt="logo"
                      width={120}
                      height={30}
                      className="header-logo object-contain dark:hidden"
                    />
 
                  </>
                ) : (
                  <>
                    <Image
                      src={"/images/hero/navImage.png"}
                      alt="logo"
                      width={100}
                      height={30}
                      className="header-logo  dark:hidden object-contain"
                    />
                  </>
                )}
              </Link>
            </div>
            <div className="flex w-full items-center justify-between px-4">
              <div>
                <button
                  onClick={navbarToggleHandler}
                  id="navbarToggler"
                  aria-label="Mobile Menu"
                  className="absolute right-4 top-1/2 block -translate-y-1/2 rounded-lg px-3 py-[6px] ring-primary focus:ring-2 lg:hidden"
                >
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] transition-all duration-300 ${
                      navbarOpen ? " top-[7px] rotate-45" : " "
                    } ${pathUrl !== "/" && "!bg-dark dark:!bg-white"} ${
                      pathUrl === "/" && sticky
                        ? "bg-dark dark:bg-white"
                        : "bg-white"
                    }`}
                  />
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] transition-all duration-300 ${
                      navbarOpen ? "opacity-0 " : " "
                    } ${pathUrl !== "/" && "!bg-dark dark:!bg-white"} ${
                      pathUrl === "/" && sticky
                        ? "bg-dark dark:bg-white"
                        : "bg-white"
                    }`}
                  />
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] transition-all duration-300 ${
                      navbarOpen ? " top-[-8px] -rotate-45" : " "
                    } ${pathUrl !== "/" && "!bg-dark dark:!bg-white"} ${
                      pathUrl === "/" && sticky
                        ? "bg-dark dark:bg-white"
                        : "bg-white"
                    }`}
                  />
                </button>
                <nav
                  id="navbarCollapse"
                  className={`navbar absolute right-0 z-30 w-[250px] rounded border-[.5px] border-body-color/50 bg-white px-6 py-4 duration-300 dark:border-body-color/20 dark:bg-dark-2 lg:visible lg:static lg:w-auto lg:border-none lg:!bg-transparent lg:p-0 lg:opacity-100 lg:dark:bg-transparent ${
                    navbarOpen
                      ? "visibility top-full opacity-100"
                      : "invisible top-[120%] opacity-0"
                  }`}
                >
                  <ul className="block lg:ml-8 lg:flex lg:gap-x-8 xl:ml-14 xl:gap-x-12">
                    {menuData.map((menuItem, index) =>
                      menuItem.path ? (
                        <li key={index} className="group relative">
                          {pathUrl !== "/" ? (
                            <Link
                              onClick={navbarToggleHandler}
                              scroll={false}
                              href={menuItem.path}
                              className={`ud-menu-scroll flex py-2 text-base text-dark group-hover:text-primary dark:text-white dark:group-hover:text-primary lg:inline-flex lg:px-0 lg:py-6 ${
                                pathUrl === menuItem?.path && "text-primary"
                              }`}
                            >
                              {menuItem.title}
                            </Link>
                          ) : (
                            
                            <Link
                              scroll={false}
                              href={menuItem.path}
                              className={`ud-menu-scroll flex py-2 text-base lg:inline-flex lg:px-0 lg:py-6 text-black dark:text-white lg:text-white"
                              } ${
                                pathUrl === menuItem.path?
                                "!text-primary": ""
                              }`}
                            >
                              {menuItem.title}
                            </Link>
                          )}
                        </li>
                      ) : (
                        <li className="submenu-item group relative" key={index}>
                          {pathUrl !== "/" ? (
                            <button
                              onClick={() => handleSubmenu(index)}
                              className={`ud-menu-scroll flex items-center justify-between py-2 text-base text-dark group-hover:text-primary dark:text-white dark:group-hover:text-primary lg:inline-flex lg:px-0 lg:py-6`}
                            >
                              {menuItem.title}

                              <span className="pl-1">
                                <svg
                                  className={`duration-300 lg:group-hover:rotate-180`}
                                  width="16"
                                  height="17"
                                  viewBox="0 0 16 17"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M8.00039 11.9C7.85039 11.9 7.72539 11.85 7.60039 11.75L1.85039 6.10005C1.62539 5.87505 1.62539 5.52505 1.85039 5.30005C2.07539 5.07505 2.42539 5.07505 2.65039 5.30005L8.00039 10.525L13.3504 5.25005C13.5754 5.02505 13.9254 5.02505 14.1504 5.25005C14.3754 5.47505 14.3754 5.82505 14.1504 6.05005L8.40039 11.7C8.27539 11.825 8.15039 11.9 8.00039 11.9Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSubmenu(index)}
                              className={`ud-menu-scroll flex items-center justify-between py-2 text-base lg:inline-flex lg:px-0 lg:py-6 text-dark group-hover:text-primary dark:text-white dark:group-hover:text-primary"
                              `}
                            >
                              {menuItem.title}

                              <span className="pl-1">
                                <svg
                                  className={`duration-300 lg:group-hover:rotate-180`}
                                  width="16"
                                  height="17"
                                  viewBox="0 0 16 17"
                                  fill="black"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M8.00039 11.9C7.85039 11.9 7.72539 11.85 7.60039 11.75L1.85039 6.10005C1.62539 5.87505 1.62539 5.52505 1.85039 5.30005C2.07539 5.07505 2.42539 5.07505 2.65039 5.30005L8.00039 10.525L13.3504 5.25005C13.5754 5.02505 13.9254 5.02505 14.1504 5.25005C14.3754 5.47505 14.3754 5.82505 14.1504 6.05005L8.40039 11.7C8.27539 11.825 8.15039 11.9 8.00039 11.9Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </span>
                            </button>
                          )}

                          <div
                            className={`submenu relative left-0 top-full w-[250px] rounded-sm bg-white p-4 transition-[top] duration-300 group-hover:opacity-100 dark:bg-dark-2 lg:invisible lg:absolute lg:top-[110%] lg:block lg:opacity-0 lg:shadow-lg lg:group-hover:visible lg:group-hover:top-full ${
                              openIndex === index ? "!-left-[25px]" : "hidden"
                            }`}
                          >
                            {menuItem?.submenu?.map((submenuItem: any, i) => (
                              <div key={i} className="relative">
                                {submenuItem.nestedSubmenu ? (
                                  <button
                                    onClick={() => handleNestedSubmenu(i)}
                                    className={`flex w-full items-center justify-between rounded px-4 py-[10px] text-sm text-body-color hover:text-primary dark:text-dark-6 dark:hover:text-primary`}
                                  >
                                    {submenuItem.title}
                                    <span className="pl-1">
                                      <svg
                                        className={`duration-300 ${openNestedIndex === i ? 'rotate-180' : ''}`}
                                        width="12"
                                        height="12"
                                        viewBox="0 0 12 12"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M6.00039 9.9C5.85039 9.9 5.72539 9.85 5.60039 9.75L1.85039 6.10005C1.62539 5.87505 1.62539 5.52505 1.85039 5.30005C2.07539 5.07505 2.42539 5.07505 2.65039 5.30005L6.00039 8.525L9.35039 5.25005C9.57539 5.02505 9.92539 5.02505 10.15039 5.25005C10.37539 5.47505 10.37539 5.82505 10.15039 6.05005L6.40039 9.7C6.27539 9.825 6.15039 9.9 6.00039 9.9Z"
                                          fill="currentColor"
                                        />
                                      </svg>
                                    </span>
                                  </button>
                                ) : (
                                  <Link
                                    href={submenuItem.path}
                                    className={`block rounded px-4 py-[10px] text-sm ${
                                      pathUrl === submenuItem.path
                                        ? "text-primary"
                                        : "text-body-color hover:text-primary dark:text-dark-6 dark:hover:text-primary"
                                    }`}
                                  >
                                    {submenuItem.title}
                                  </Link>
                                )}
                                
                                {/* Nested Submenu Dropdown */}
                                {submenuItem.nestedSubmenu && openNestedIndex === i && (
                                  <div className="nested-submenu mt-2 ml-4 w-full rounded-sm bg-white p-2 dark:bg-dark-2">
                                    {submenuItem.nestedSubmenu.map((nestedItem: any, j) => (
                                      <Link
                                        href={nestedItem.path}
                                        key={j}
                                        className={`block rounded px-4 py-[8px] text-sm ${
                                          pathUrl === nestedItem.path
                                            ? "text-primary"
                                            : "text-body-color hover:text-primary dark:text-dark-6 dark:hover:text-primary"
                                        }`}
                                      >
                                        {nestedItem.title}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </li>
                      ),
                    )}
                  </ul>
                </nav>
              </div>
            
              <div className="flex gap-4">
                <Link
                  href="/login"
                  className={`px-7 py-3 text-white font-medium hover:opacity-70 bg-dark rounded-md `}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className={`rounded-md border border-dark px-6 py-3 text-dark font-medium bg-white  duration-300 ease-in-out `}
                >
                  Sign Up
                </Link>

              </div>
                
            </div>
          </div>
        </div>
    </header>
  </>
  );
};

export default Header;