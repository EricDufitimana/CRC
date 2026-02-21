/**
 * Dynamic title utility for dashboard pages
 */

export function getDashboardTitle(pathname: string | null, role: 'admin' | 'student'): string {
  if (!pathname) return `${role === 'admin' ? 'Admin' : 'Student'} Dashboard | Career Resources Center`;

  if (role === 'admin') {
    if (pathname.includes("student-management")) return "Student Management | Admin Dashboard";
    else if (pathname.includes("assignments-management")) return "Assignments Management | Admin Dashboard";
    else if (pathname.includes("announcements-management")) return "Announcements Management | Admin Dashboard";
    else if (pathname.includes("events-management")) return "Events Management | Admin Dashboard";
    else if (pathname.includes("content-management")) return "Content Management | Admin Dashboard";
    else if (pathname.includes("workshops")) return "Workshops | Admin Dashboard";
    else if (pathname.includes("attendance")) return "Attendance | Admin Dashboard";
    else if (pathname.includes("crc-class-groups")) return "CRC Class Groups | Admin Dashboard";
    else if (pathname.includes("testing")) return "Testing | Admin Dashboard";
    else return "Admin Dashboard | Career Resources Center";
  }

  if (role === 'student') {
    if (pathname.includes("assignments")) return "Assignments | Student Dashboard";
    else if (pathname.includes("documents")) return "Documents | Student Dashboard";
    else if (pathname.includes("requests")) return "Requests | Student Dashboard";
    else return "Student Dashboard | Career Resources Center";
  }

  return `${role === 'admin' ? 'Admin' : 'Student'} Dashboard | Career Resources Center`;
}
