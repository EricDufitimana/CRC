"use client";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { useSession } from "@/hooks/getSession";
import { useIsMobile } from "@/hooks/use-mobile";
import { User, LogOut, Menu, X, Loader2 } from "lucide-react";
import { signOut } from "@/actions/signOut";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

import menuData from "./menuData";

const Header = () => {
  const pathUrl = usePathname();
  const isMobile = useIsMobile();
  
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
    const sessionData = useSession();
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
  
  // Mobile sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  
  // Sign out loading state
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
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
      if (sticky && !isMobile) {
        // Animate to sticky state - minimal changes
        gsap.to(navCardRef.current, {
          duration: 0.2,
          ease: "none",
          background: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          marginTop: "14px"
        });
      } else if (sticky && isMobile) {
        // Mobile sticky state - solid white background
        gsap.to(navCardRef.current, {
          duration: 0.2,
          ease: "none",
          background: "white",
          backdropFilter: "none",
          borderRadius: "0px",
          marginTop: "0px"
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
  }, [sticky, isMobile]);

  // submenu handler for mobile
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
        style={{ top: sticky ? "0px" : "var(--banner-height, 0px)" }}
      >
        <div ref={containerRef} className={`w-full ${sticky && !isMobile ? "flex justify-center px-4" : sticky && isMobile ? "px-0" : "container laptop-lg:px-12"}`}>
          <div ref={navCardRef} className={`relative items-center flex ${
            sticky && !isMobile
              ? "mt-4 rounded-2xl border border-stroke bg-white/40 dark:bg-dark/90 backdrop-blur-[10px] shadow-nav px-6 py-2 max-w-fit gap-1 justify-center"
              : sticky && isMobile
              ? "bg-white shadow-md w-full py-0 justify-between px-4"
              : "-mx-14 justify-between bg-white"
          }`}>
            <div ref={logoRef} className={`max-w-full transition-all duration-200 ease-linear ${
              sticky && !isMobile ? "w-auto px-1" : "w-60 px-4"
            }`}>
              <Link
                href="/"
                className={`navbar-logo block transition-all duration-200 ease-linear ${
                  sticky && !isMobile ? "py-1 w-auto" : "py-0 w-full"
                } `}
              >
                {pathUrl !== "/" ? (
                  <>
                    <Image
                      src={"/images/hero/navImage.png"}
                      alt="logo"
                      width={sticky && !isMobile ? 80 : 120}
                      height={sticky && !isMobile ? 20 : 30}
                      className="header-logo object-contain dark:hidden"
                    />
                  </>
                ) : (
                  <>
                    <Image
                      src={"/images/hero/navImage.png"}
                      alt="logo"
                      width={sticky && !isMobile ? 70 : 100}
                      height={sticky && !isMobile ? 18 : 30}
                      className="header-logo  dark:hidden object-contain"
                    />
                  </>
                )}
              </Link>
            </div>
            
            <div ref={navItemsRef} className={`flex items-center transition-all duration-200 ease-linear ${
              sticky && !isMobile ? "gap-6" : "w-full px-4 justify-between"
            }`}>
              {/* Desktop Navigation */}
              <div className="hidden lg:block">
                <nav>
                  <ul className={`flex ${
                    sticky && !isMobile
                      ? "ml-3 gap-x-4 xl:ml-4 xl:gap-x-5" 
                      : "ml-8 gap-x-8 xl:ml-14 xl:gap-x-12"
                  }`}>
                    {menuData.map((menuItem, index) =>
                      menuItem.path ? (
                        <li key={index} className="group relative">
                          {pathUrl !== "/" ? (
                            <Link
                              scroll={false}
                              href={menuItem.path}
                              className={`ud-menu-scroll flex py-2 ${
                                sticky && !isMobile ? "text-base" : "text-lg"
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
                                sticky && !isMobile ? "text-base" : "text-lg"
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
                              className={`ud-menu-scroll flex items-center justify-between py-2 ${
                                sticky && !isMobile ? "text-base" : "text-lg"
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
                              className={`ud-menu-scroll flex items-center justify-between py-2 ${
                                sticky && !isMobile ? "text-base" : "text-lg"
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
                            className={`submenu invisible absolute left-0 top-[110%] w-[250px] opacity-0 transition-all duration-300 ease-linear group-hover:visible group-hover:top-full group-hover:opacity-100 ${
                              sticky && !isMobile
                                ? "rounded-2xl bg-white backdrop-blur-[10px] border border-stroke dark:border-dark-3/20 dark:bg-dark/90 p-4 shadow-lg" 
                                : "rounded-sm bg-white p-4 dark:bg-dark-2 shadow-lg"
                            }`}
                          >
                            {menuItem?.submenu?.map((submenuItem: any, i) => (
                              <div key={i} className="relative">
                                {submenuItem.nestedSubmenu ? (
                                  <div className="group/nested relative">
                                    <div className={`flex w-full items-center justify-between rounded px-4 py-[10px] text-sm hover:text-primary dark:hover:text-primary ${
                                      isSubmenuItemActive(submenuItem) 
                                        ? "text-primary" 
                                        : "text-body-color dark:text-dark-6"
                                    }`}>
                                      {submenuItem.title}
                                      <span className="pl-1">
                                        <svg
                                          className="duration-300 ease-linear group-hover/nested:rotate-90"
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
                                    </div>
                                    {/* Nested submenu */}
                                    <div className="invisible absolute left-full top-0 ml-2 w-[200px] opacity-0 transition-all duration-300 ease-linear group-hover/nested:visible group-hover/nested:opacity-100 rounded-sm bg-white p-2 shadow-lg dark:bg-dark-2">
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
                                  </div>
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
                              </div>
                            ))}
                          </div>
                        </li>
                      ),
                    )}
                  </ul>
                </nav>
              </div>

              {/* Mobile Sheet Trigger - Only visible on mobile */}
              <div className="lg:hidden ml-auto z-[d999]">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <button
                      className={`rounded-lg p-2  text-black dark:text-white mr-4 ${
                        sheetOpen ? "opacity-0" : "opacity-100"
                      }`}
                      aria-label="Open mobile menu"
                    >
                      <Menu size={40} />
                    </button>
                  </SheetTrigger>
                  
                  <SheetContent 
                    side="right" 
                    className="w-[300px] sm:w-[400px] overflow-y-auto"
                    showDefaultCloseButton={false}
                  >
                    <SheetHeader className="flex flex-row align-center justify-between">
                      <SheetTitle className="text-left">Menu</SheetTitle>
                      <SheetClose className="rounded-lg  text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <X className="h-4 w-4 -mt-2" />
                      </SheetClose>
                    </SheetHeader>
                    
                    <div className="mt-6 space-y-4 overflow-y-auto flex-1">
                      {/* Mobile Navigation Menu */}
                      <nav>
                        <ul className="space-y-2">
                          {menuData.map((menuItem, index) =>
                            menuItem.path ? (
                              <li key={index}>
                                <SheetClose asChild>
                                  <Link
                                    href={menuItem.path}
                                    className={`flex py-3 px-4 rounded-md text-base transition-colors ${
                                      isMenuItemActive(menuItem)
                                        ? "text-primary bg-primary/10"
                                        : "text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/5"
                                    }`}
                                  >
                                    {menuItem.title}
                                  </Link>
                                </SheetClose>
                              </li>
                            ) : (
                              <li key={index} className="space-y-2">
                                <button
                                  onClick={() => handleSubmenu(index)}
                                  className={`flex items-center justify-between w-full py-3 px-4 rounded-md text-base transition-colors ${
                                    isMenuItemActive(menuItem)
                                      ? "text-primary bg-primary/10"
                                      : "text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/5"
                                  }`}
                                >
                                  {menuItem.title}
                                  <svg
                                    className={`duration-300 ease-linear ${
                                      openIndex === index ? "rotate-180" : ""
                                    }`}
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
                                </button>
                                
                                {openIndex === index && (
                                  <div className="ml-4 space-y-1">
                                    {menuItem?.submenu?.map((submenuItem: any, i) => (
                                      <div key={i}>
                                        {submenuItem.nestedSubmenu ? (
                                          <div>
                                            <button
                                              onClick={() => handleNestedSubmenu(i)}
                                              className={`flex items-center justify-between w-full py-2 px-4 rounded-md text-sm ${
                                                isSubmenuItemActive(submenuItem)
                                                  ? "text-primary bg-primary/10"
                                                  : "text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-primary/5"
                                              }`}
                                            >
                                              {submenuItem.title}
                                              <svg
                                                className={`duration-300 ease-linear ${
                                                  openNestedIndex === i ? "rotate-180" : ""
                                                }`}
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
                                            </button>
                                            {openNestedIndex === i && (
                                              <div className="ml-4 mt-2 space-y-1">
                                                {submenuItem.nestedSubmenu.map((nestedItem: any, j: number) => (
                                                  <SheetClose asChild key={j}>
                                                    <Link
                                                      href={nestedItem.path}
                                                      className={`block py-2 px-4 rounded-md text-sm ${
                                                        pathUrl === nestedItem.path
                                                          ? "text-primary bg-primary/10"
                                                          : "text-gray-500 dark:text-gray-500 hover:text-primary hover:bg-primary/5"
                                                      }`}
                                                    >
                                                      {nestedItem.title}
                                                    </Link>
                                                  </SheetClose>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <SheetClose asChild>
                                            <Link
                                              href={submenuItem.path}
                                              className={`block py-2 px-4 rounded-md text-sm ${
                                                isSubmenuItemActive(submenuItem)
                                                  ? "text-primary bg-primary/10"
                                                  : "text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-primary/5"
                                              }`}
                                            >
                                              {submenuItem.title}
                                            </Link>
                                          </SheetClose>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </li>
                            )
                          )}
                        </ul>
                      </nav>
                      
                      {/* Mobile Authentication Buttons */}
                      <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                        {userId ? (
                          <>
                            <SheetClose asChild>
                              <Link
                                href={adminId ? "/dashboard/admin" : "/dashboard/student"}
                                className="flex items-center w-full px-4 py-3 text-white font-medium bg-dark rounded-md text-center shadow-md"
                              >
                                <User className="mr-2 h-4 w-4" />
                                Go to Dashboard
                              </Link>
                            </SheetClose>
                            <button
                              onClick={() => {
                                handleSignOut();
                                setSheetOpen(false);
                              }}
                              disabled={isSigningOut}
                              className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isSigningOut ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <LogOut className="mr-2 h-4 w-4" />
                              )}
                              {isSigningOut ? "Signing out..." : "Sign Out"}
                            </button>
                          </>
                        ) : (
                          <>
                            <SheetClose asChild>
                              <Link
                                href="/login"
                                className="block w-full px-4 py-3 text-white font-medium bg-dark rounded-md text-center shadow-md"
                              >
                                Sign In
                              </Link>
                            </SheetClose>
                            <SheetClose asChild>
                              <Link
                                href="/register"
                                className="block w-full px-4 py-3 text-dark font-medium border border-dark rounded-md text-center bg-white"
                              >
                                Register
                              </Link>
                            </SheetClose>
                          </>
                        )}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
                
              {/* Desktop Buttons - Hidden on mobile */}
              <div ref={buttonsRef} className={`hidden lg:flex transition-all duration-200 ease-linear ${
                sticky && !isMobile ? "gap-3" : "gap-4"
              }`}>
                {userId ? (
                  // User is logged in - show dashboard button and avatar
                  <>
                    <Link
                      href={adminId ? "/dashboard/admin" : "/dashboard/student"}
                      className={`text-white font-medium hover:opacity-70 bg-dark rounded-md text-center whitespace-nowrap shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition-all duration-200 ease-linear ${
                        sticky && !isMobile ? "px-5 py-3 text-sm" : "px-7 py-3"
                      }`}
                    >
                      Go to Dashboard
                    </Link>
                    
                    {/* User Avatar Menu */}
                    <div className="relative user-menu-container">
                      <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className={`flex items-center justify-center rounded-full bg-gray-100 text-gray-400 font-medium transition-all duration-200 ease-linear  ${
                          sticky && !isMobile ? "w-10 h-10 text-sm" : "w-12 h-12"
                        }`}
                      >
                        <User size={sticky && !isMobile ? 18 : 20} />
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
                            disabled={isSigningOut}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSigningOut ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <LogOut className="mr-2 h-4 w-4" />
                            )}
                            {isSigningOut ? "Signing out..." : "Sign Out"}
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
                        sticky && !isMobile ? "px-5 py-3 text-sm" : "px-7 py-3"
                      }`}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className={`rounded-md border border-dark text-dark font-medium bg-white text-center whitespace-nowrap transition-all duration-200 ease-linear ${
                        sticky && !isMobile ? "px-5 py-3 text-sm" : "px-6 py-3"
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

                        