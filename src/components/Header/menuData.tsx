"use client";

import { Menu } from "@/types/menu";

// Base menu data without dynamic classes
const baseMenuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    path: "/",
    newTab: false,
  },
  {
    id: 2,
    title: "Resources",
    newTab: false,
    submenu: [
      {
        id: 9,
        title: "New Opportunities",
        path:"/resources/newopportunities",
        newTab: false,
      },
      {
        id:11,
        title: "Recurring Opportunities",
        path: "/resources/recurringopportunities",
        newTab: false,
      },
      {
        id: 10,
        title: "Templates",
        path: "/resources/templates",
        newTab: false,
      },
      {
        id: 12,
        title: "College Readiness Program",
        path: "/resources/crp",
        newTab: false,
      },
      {
        id: 13,
        title: "Internship Opportunities",
        path: "/resources/internships",
        newTab: false,
      },
      {
        id: 14,
        title: "English Language Learning",
        path: "/resources/ell",
        newTab: false,
      },
      {
        id: 15,
        title: "Approved Universities",
        path: "/resources/approved",
        newTab: false,
      },
    ]
  },
  {
    id: 3,
    title: "Events",
    newTab: false,
    submenu: [
      {
        id: 16,
        title: "Previous Events",
        path: "/events/previous-events",
        newTab: false,
      },
      {
        id: 17,
        title: "Upcoming Events",
        path: "/events/upcoming-events",
        newTab: false,
      },
    ]
  },
  {
    id: 5,
    title: "Workshops",
    newTab: false,
    submenu: [
      {
        id: 18,
        title: "EY",
        path: "/workshops/ey",
        newTab: false,
      },
      {
        id: 19,
        title: "S4",
        path: "/workshops/s4",
        newTab: false,
      },
      {
        id: 20,
        title: "S5",
        path: "/workshops/s5",
        newTab: false,
        nestedSubmenu: [] // Will be populated by getMenuDataWithClasses
      },
      {
        id: 21,
        title: "S6",
        path: "/workshops/s6",
        newTab: false,
        nestedSubmenu: [] // Will be populated by getMenuDataWithClasses
      },
    ]
  },

];

import { useTRPC } from "@/trpc/client";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-2">
    <Loader2 className="h-4 w-4 animate-spin" />
  </div>
);

// Function to fetch CRC classes and populate menu data
export function useMenuDataWithClasses(): { menuData: Menu[], isMenuLoading: boolean, LoadingSpinner: React.ComponentType } {
  const trpc = useTRPC();
  
  // Use useQuery like the admin dashboard
  const { data: s5Data, isFetching: s5Fetching } = useQuery(
    trpc.crcClassManagement.getCrcClassesByGradeGroup.queryOptions({ gradeGroup: 's5' })
  );
  
  const { data: s6Data, isFetching: s6Fetching } = useQuery(
    trpc.crcClassManagement.getCrcClassesByGradeGroup.queryOptions({ gradeGroup: 's6' })
  );

  const isMenuLoading = s5Fetching || s6Fetching;

  // Memoize menu data to prevent unnecessary re-renders
  const menuData = useMemo(() => {
    const s5Classes = s5Data || [];
    const s6Classes = s6Data || [];

    // Clone base menu data
    const updatedMenuData = JSON.parse(JSON.stringify(baseMenuData));

    // Find S5 and S6 menu items and populate their nestedSubmenu
    const workshopsMenu = updatedMenuData.find((item: Menu) => item.id === 5);
    if (workshopsMenu?.submenu) {
      const s5Menu = workshopsMenu.submenu.find((item: Menu) => item.id === 20);
      if (s5Menu && s5Classes.length > 0) {
        s5Menu.nestedSubmenu = s5Classes.map((crcClass: any, index: number) => ({
          id: 1000 + index, // Use high IDs to avoid conflicts
          title: crcClass.name,
          path: `/workshops/s5/${crcClass.id}`,
          newTab: false,
        }));
      }

      const s6Menu = workshopsMenu.submenu.find((item: Menu) => item.id === 21);
      if (s6Menu && s6Classes.length > 0) {
        s6Menu.nestedSubmenu = s6Classes.map((crcClass: any, index: number) => ({
          id: 2000 + index, // Use high IDs to avoid conflicts
          title: crcClass.name,
          path: `/workshops/s6/${crcClass.id}`,
          newTab: false,
        }));
      }
    }

    return updatedMenuData;
  }, [s5Data, s6Data]);

  return { menuData, isMenuLoading, LoadingSpinner };
}

export default baseMenuData;
