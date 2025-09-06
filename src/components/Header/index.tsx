"use client";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { getSession } from "@/hooks/getSession";
import { User, LogOut } from "lucide-react";
import { signOut } from "@/actions/signOut";

import menuData from "./menuData";

const Header = () => {
  const pathUrl = usePathname();
  
  // Helper function to check if a menu item should be active
  const isMenuItemActive = (menuItem: any) => {
    // Direct path match
    if (menuItem.path && pathUrl === menuItem.path) {
      return true;
    }
    
    // Check if any submenu item is active
    if (menuItem.submenu) {
      return menuItem.submenu.some((submenuItem: any) => {
        // Direct submenu match
        if (submenuItem.path && pathUrl === submenuItem.path) {
          return true;
        }
        
        // Check nested submenu
        if (submenuItem.nestedSubmenu) {
          return submenuItem.nestedSubmenu.some((nestedItem: any) => 
            nestedItem.path && pathUrl === nestedItem.path
          );
        }
        
        return false;
      });
    }
    
    return false;
  };
  
  // Helper function to check if a submenu item should be active
  const isSubmenuItemActive = (submenuItem: any) => {
    // Direct path match
    if (submenuItem.path && pathUrl === submenuItem.path) {
      return true;
    }
    
    // Check if any nested submenu item is active
    if (submenuItem.nestedSubmenu) {
      return submenuItem.nestedSubmenu.some((nestedItem: any) => 
        nestedItem.path && pathUrl === nestedItem.path
      );
    }
    
    return false;
  };
  
  // Safely get session data with error handling
  let userId = null;
  let adminId = null;
  let studentId = null;
  let isLoading = false;
  
  try {
    const sessionData = getSession();
    userId = sessionData?.userId || null;
    adminId = sessionData?.adminId || null;
    studentId = sessionData?.studentId || null;
    isLoading = sessionData?.isLoading || false;
  } catch (error) {
    console.log('Header: getSession error (treating as no user):', error);
    // Keep all values as null/false - user not logged in
  }
  
  // User menu toggle
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuOpen && !(event.target as Element).closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

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
    return () => {
      window.removeEventListener("scroll", handleStickyNavbar);
    };
  }, []);

  // Minimal GSAP animation - only essential visual changes
  useEffect(() => {
    if (navCardRef.current) {
      if (sticky) {
        // Animate to sticky state - minimal changes
        gsap.to(navCardRef.current, {
          duration: 0.2,
          ease: "none",
          background: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          marginTop: "14px"
        });
      } else {
        // Animate to non-sticky state
        gsap.to(navCardRef.current, {
          duration: 0.2,
          ease: "none",
          background: "transparent",
          backdropFilter: "none",
          borderRadius: "0px",
          marginTop: "0px"
        });
      }
    }
  }, [sticky]);

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

  // GSAP refs
  const headerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navCardRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navItemsRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <header
        ref={headerRef}
        className={`ud-header z-[60] flex items-center fixed w-full`}
        style={{ top: "var(--banner-height, 0px)" }}
      >
        <div ref={containerRef} className={`w-full ${sticky ? "flex justify-center px-4" : "container"}`}>
          <div ref={navCardRef} className={`relative items-center flex ${
            sticky 
              ? "mt-4 rounded-2xl border border-stroke bg-white/40 dark:bg-dark/90 backdrop-blur-[10px] shadow-nav px-6 py-2 max-w-fit gap-1 justify-center"
              : "-mx-14 justify-between"
          }`}>
            <div ref={logoRef} className={`max-w-full transition-all duration-200 ease-linear ${
              sticky ? "w-auto px-1" : "w-60 px-4"
            }`}>
              <Link
                href="/"
                className={`navbar-logo block transition-all duration-200 ease-linear ${
                  sticky ? "py-1 w-auto" : "py-5 w-full"
                } `}
              >
                {pathUrl !== "/" ? (
                  <>
                    <Image
                      src={"/images/hero/navImage.png"}
                      alt="logo"
                      width={sticky ? 80 : 120}
                      height={sticky ? 20 : 30}
                      className="header-logo object-contain dark:hidden"
                    />
 
                  </>
                ) : (
                  <>
                    <Image
                      src={"/images/hero/navImage.png"}
                      alt="logo"
                      width={sticky ? 70 : 100}
                      height={sticky ? 18 : 30}
                      className="header-logo  dark:hidden object-contain"
                    />
                  </>
                )}
              </Link>
            </div>
             <div ref={navItemsRef} className={`flex items-center transition-all duration-200 ease-linear ${
                sticky ? "gap-6" : "w-full px-4 justify-between"
              }`}>
              <div>
                <button
                  onClick={navbarToggleHandler}
                  id="navbarToggler"
                  aria-label="Mobile Menu"
                  className="absolute right-4 top-1/2 block -translate-y-1/2 rounded-lg px-3 py-[6px] ring-primary focus:ring-2 lg:hidden"
                >
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] transition-all duration-300 ease-linear ${
                      navbarOpen ? " top-[7px] rotate-45" : " "
                    } ${pathUrl !== "/" && "!bg-dark dark:!bg-white"} ${
                      pathUrl === "/" && sticky
                        ? "bg-dark dark:bg-white"
                        : "bg-white"
                    }`}
                  />
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] transition-all duration-300 ease-linear ${
                      navbarOpen ? "opacity-0 " : " "
                    } ${pathUrl !== "/" && "!bg-dark dark:!bg-white"} ${
                      pathUrl === "/" && sticky
                        ? "bg-dark dark:bg-white"
                        : "bg-white"
                    }`}
                  />
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] transition-all duration-300 ease-linear ${
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
                  className={`navbar absolute right-0 z-30 w-[250px] rounded border-[.5px] border-body-color/50 bg-white px-6 py-4 duration-300 ease-linear dark:border-body-color/20 dark:bg-dark-2 lg:visible lg:static lg:w-auto lg:border-none lg:!bg-transparent lg:p-0 lg:opacity-100 lg:dark:bg-transparent ${
                    navbarOpen
                      ? "visibility top-full opacity-100"
                      : "invisible top-[120%] opacity-0"
                  }`}
                >
                  <ul className={`block lg:flex ${
                    sticky 
                      ? "lg:ml-3 lg:gap-x-4 xl:ml-4 xl:gap-x-5" 
                      : "lg:ml-8 lg:gap-x-8 xl:ml-14 xl:gap-x-12"
                  }`}>
                    {menuData.map((menuItem, index) =>
                      menuItem.path ? (
                        <li key={index} className="group relative">
                          {pathUrl !== "/" ? (
                            <Link
                              onClick={navbarToggleHandler}
                              scroll={false}
                              href={menuItem.path}
                              className={`ud-menu-scroll flex py-2 ${
                                sticky ? "text-base" : "text-lg"
                              } text-dark group-hover:text-primary dark:text-white dark:group-hover:text-primary lg:inline-flex lg:px-0 lg:py-6 ${
                                isMenuItemActive(menuItem) && "text-primary"
                              }`}
                            >
                              {menuItem.title}
                            </Link>
                          ) : (
                            
                            <Link
                              scroll={false}
                              href={menuItem.path}
                              className={`ud-menu-scroll flex py-2 ${
                                sticky ? "text-base" : "text-lg"
                              } lg:inline-flex lg:px-0 lg:py-6 text-black dark:text-white lg:text-white ${
                                isMenuItemActive(menuItem) ? "!text-primary" : ""
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
                              className={`ud-menu-scroll flex items-center justify-between py-2 ${
                                sticky ? "text-base" : "text-lg"
                              } text-dark group-hover:text-primary dark:text-white dark:group-hover:text-primary lg:inline-flex lg:px-0 lg:py-6 ${
                                isMenuItemActive(menuItem) ? "text-primary" : ""
                              }`}
                            >
                              {menuItem.title}

                              <span className="pl-1">
                                <svg
                                  className={`duration-300 ease-linear lg:group-hover:rotate-180`}
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
                              className={`ud-menu-scroll flex items-center justify-between py-2 ${
                                sticky ? "text-base" : "text-lg"
                              } lg:inline-flex lg:px-0 lg:py-6 text-dark group-hover:text-primary dark:text-white dark:group-hover:text-primary ${
                                isMenuItemActive(menuItem) ? "text-primary" : ""
                              }`}
                            >
                              {menuItem.title}

                              <span className="pl-1">
                                <svg
                                  className={`duration-300 ease-linear lg:group-hover:rotate-180`}
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
                            className={`submenu relative left-0 top-full w-[250px] transition-[top] duration-300 ease-linear group-hover:opacity-100 lg:invisible lg:absolute lg:top-[110%] lg:block lg:opacity-0 lg:group-hover:visible lg:group-hover:top-full ${
                              sticky 
                                ? "rounded-2xl bg-white backdrop-blur-[10px] border border-stroke dark:border-dark-3/20 dark:bg-dark/90 p-4 shadow-lg" 
                                : "rounded-sm bg-white p-4 dark:bg-dark-2 shadow-lg"
                            } ${
                              openIndex === index ? "!-left-[25px]" : "hidden"
                            }`}
                          >
                            {menuItem?.submenu?.map((submenuItem: any, i) => (
                              <div key={i} className="relative">
                                {submenuItem.nestedSubmenu ? (
                                  <button
                                    onClick={() => handleNestedSubmenu(i)}
                                    className={`flex w-full items-center justify-between rounded px-4 py-[10px] text-sm hover:text-primary dark:hover:text-primary ${
                                      isSubmenuItemActive(submenuItem) 
                                        ? "text-primary" 
                                        : "text-body-color dark:text-dark-6"
                                    }`}
                                  >
                                    {submenuItem.title}
                                    <span className="pl-1">
                                      <svg
                                        className={`duration-300 ease-linear ${openNestedIndex === i ? 'rotate-180' : ''}`}
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
                                      isSubmenuItemActive(submenuItem)
                                        ? "text-primary"
                                        : "text-body-color hover:text-primary dark:text-dark-6 dark:hover:text-primary"
                                    }`}
                                  >
                                    {submenuItem.title}
                                  </Link>
                                )}
                                
                                {/* Nested Submenu Dropdown */}
                                {submenuItem.nestedSubmenu && openNestedIndex === i && (
                                  <div className={`nested-submenu mt-2 ml-4 w-full p-2 ${
                                    sticky 
                                      ? "rounded-2xl bg-white/80 backdrop-blur-[10px] border border-stroke dark:border-dark-3/20 dark:bg-dark/90 shadow-lg" 
                                      : "rounded-sm bg-white dark:bg-dark-2"
                                  }`}>
                                    {submenuItem.nestedSubmenu.map((nestedItem: any, j: number) => (
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
            
              <div ref={buttonsRef} className={`flex transition-all duration-200 ease-linear ${
                sticky ? "gap-3" : "gap-4"
              }`}>
                {userId ? (
                  // User is logged in - show dashboard button and avatar
                  <>
                    <Link
                      href={adminId ? "/dashboard/admin" : "/dashboard/student"}
                      className={`text-white font-medium hover:opacity-70 bg-dark rounded-md text-center whitespace-nowrap shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition-all duration-200 ease-linear ${
                        sticky ? "px-5 py-3 text-sm" : "px-7 py-3"
                      }`}
                    >
                      Go to Dashboard
                    </Link>
                    
                    {/* User Avatar Menu */}
                    <div className="relative user-menu-container">
                      <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className={`flex items-center justify-center rounded-full bg-gray-100 text-gray-400 font-medium transition-all duration-200 ease-linear  ${
                          sticky ? "w-10 h-10 text-sm" : "w-12 h-12"
                        }`}
                      >
                        <User size={sticky ? 18 : 20} />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {userMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2  z-50">
                          <Link
                            href={adminId ? "/dashboard/admin" : "/dashboard/student"}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                          <button
                            onClick={() => {
                              handleSignOut();
                              setUserMenuOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // User is not logged in - show sign in and register buttons
                  <>
                    <Link
                      href="/login"
                      className={`text-white font-medium hover:opacity-70 bg-dark rounded-md text-center whitespace-nowrap shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition-all duration-200 ease-linear ${
                        sticky ? "px-5 py-3 text-sm" : "px-7 py-3"
                      }`}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className={`rounded-md border border-dark text-dark font-medium bg-white text-center whitespace-nowrap transition-all duration-200 ease-linear ${
                        sticky ? "px-5 py-3 text-sm" : "px-6 py-3"
                      }`}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
                
            </div>
          </div>
        </div>
    </header>
  </>
  );
};

export default Header;