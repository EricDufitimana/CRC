import { Menu } from "@/types/menu";

const menuData: Menu[] = [
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
        nestedSubmenu: [
          {
            id: 22,
            title: "Groups A+B",
            path: "/workshops/s5/groups-ab",
            newTab: false,
          },
          {
            id: 23,
            title: "Customer Care",
            path: "/workshops/s5/customer-care",
            newTab: false,
          },
        ]
      },
      {
        id: 21,
        title: "S6",
        path: "/workshops/s6",
        newTab: false,
        nestedSubmenu: [
          {
            id: 24,
            title: "Groups A+B",
            path: "/workshops/s6/groups-ab",
            newTab: false,
          },
          {
            id: 25,
            title: "Group C",
            path: "/workshops/s6/group-c",
            newTab: false,
          },
          {
            id: 26,
            title: "Group D",
            path: "/workshops/s6/group-d",
            newTab: false,
          },
          {
            id: 27,
            title: "Job Readiness Course",
            path: "/workshops/s6/job-readiness",
            newTab: false,
          },
        ]
      },
    ]
  },
  
  {
    id: 4,
    title: "Book A Meeting",
    newTab: false,
    path: "/"

  },
 
];
export default menuData;
