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
// Function to fetch CRC classes and populate menu data
export async function getMenuDataWithClasses(): Promise<Menu[]> {
  // Clone the base menu data
  const menuData = JSON.parse(JSON.stringify(baseMenuData));

  try {
    // Fetch CRC classes for S5 and S6
    const [s5Response, s6Response] = await Promise.all([
      fetch(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/crc-classes/by-grade-group?gradeGroup=s5`).catch(() => null),
      fetch(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/crc-classes/by-grade-group?gradeGroup=s6`).catch(() => null)
    ]);

    let s5Classes: any[] = [];
    let s6Classes: any[] = [];

    if (s5Response?.ok) {
      const s5Data = await s5Response.json();
      if (s5Data.success) {
        s5Classes = s5Data.data;
      }
    }

    if (s6Response?.ok) {
      const s6Data = await s6Response.json();
      if (s6Data.success) {
        s6Classes = s6Data.data;
      }
    }

    // Find S5 and S6 menu items and populate their nestedSubmenu
    const workshopsMenu = menuData.find((item: Menu) => item.id === 5);
    if (workshopsMenu?.submenu) {
      const s5Menu = workshopsMenu.submenu.find((item: Menu) => item.id === 20);
      if (s5Menu && s5Classes.length > 0) {
        s5Menu.nestedSubmenu = s5Classes.map((crcClass, index) => ({
          id: 1000 + index, // Use high IDs to avoid conflicts
          title: crcClass.name,
          path: `/workshops/s5/${crcClass.id}`,
          newTab: false,
        }));
      }

      const s6Menu = workshopsMenu.submenu.find((item: Menu) => item.id === 21);
      if (s6Menu && s6Classes.length > 0) {
        s6Menu.nestedSubmenu = s6Classes.map((crcClass, index) => ({
          id: 2000 + index, // Use high IDs to avoid conflicts
          title: crcClass.name,
          path: `/workshops/s6/${crcClass.id}`,
          newTab: false,
        }));
      }
    }
  } catch (error) {
    console.error('Error fetching CRC classes for menu:', error);
  }

  return menuData;
}

// Client-side hook version that uses state
export function useMenuDataWithClasses(s5Classes: any[] = [], s6Classes: any[] = []): Menu[] {
  // Clone the base menu data
  const menuData = JSON.parse(JSON.stringify(baseMenuData));

  // Find S5 and S6 menu items and update their nestedSubmenu
  const workshopsMenu = menuData.find((item: Menu) => item.id === 5);
  if (workshopsMenu?.submenu) {
    const s5Menu = workshopsMenu.submenu.find((item: Menu) => item.id === 20);
    if (s5Menu && s5Classes.length > 0) {
      s5Menu.nestedSubmenu = s5Classes.map((crcClass, index) => ({
        id: 1000 + index, // Use high IDs to avoid conflicts
        title: crcClass.name,
        path: `/workshops/s5/${crcClass.id}`,
        newTab: false,
      }));
    }

    const s6Menu = workshopsMenu.submenu.find((item: Menu) => item.id === 21);
    if (s6Menu && s6Classes.length > 0) {
      s6Menu.nestedSubmenu = s6Classes.map((crcClass, index) => ({
        id: 2000 + index, // Use high IDs to avoid conflicts
        title: crcClass.name,
        path: `/workshops/s6/${crcClass.id}`,
        newTab: false,
      }));
    }
  }

  return menuData;
}

export default baseMenuData;
