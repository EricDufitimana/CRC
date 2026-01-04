import { createTRPCRouter } from '../init';
import { resourcesRouter } from './resources';
import { authRouter } from './auth';
import { dashboardAdminRouter } from './dashboard-admin';
import { studentManagementRouter } from './student-management';
import { assignmentsManagementRouter } from './assignments-management';
import { crcClassManagementRouter } from './crc-class-management';
import { attendanceManagementRouter } from './attendance-management';
import { contentManagementRouter } from './content-management';
import { workshopsManagementRouter } from './workshops-management';
import { eventsManagementRouter } from './events-management';
import { announcementsManagementRouter } from './announcements-management';
import { essayRequestsManagementRouter } from './essay-requests-management';
import { opportunityRequestsManagementRouter } from './opportunity-requests-management';
import { studentDashboardRouter } from './student-dashboard';
import {studentSidebarRouter} from './student-sidebar';
import { eventsRouter } from './events';
import { workshopsRouter } from './workshops';
import { setupRouter } from './setup';
import { searchRouter } from './search';
import { helpRouter } from './help';
import { essayViewRouter } from './essay-view';
import { profilePictureRouter } from './profile-picture';
import { essayEmailRouter } from './essay-email';
import { documentsRouter } from './documents';

export const appRouter = createTRPCRouter({
  resources: resourcesRouter,
  auth: authRouter,
  dashboardAdmin: dashboardAdminRouter,
  studentManagement: studentManagementRouter,
  assignmentsManagement: assignmentsManagementRouter,
  crcClassManagement: crcClassManagementRouter,
  attendanceManagement: attendanceManagementRouter,
  contentManagement: contentManagementRouter,
  workshopsManagement: workshopsManagementRouter,
  eventsManagement: eventsManagementRouter,
  announcementsManagement: announcementsManagementRouter,
  essayRequestsManagement: essayRequestsManagementRouter,
  opportunityRequestsManagement: opportunityRequestsManagementRouter,
  studentDashboard: studentDashboardRouter,
  studentSidebar: studentSidebarRouter,
  events: eventsRouter,
  workshops: workshopsRouter,
  setup: setupRouter,
  search: searchRouter,
  help: helpRouter,
  essayView: essayViewRouter,
  profilePicture: profilePictureRouter,
  essayEmail: essayEmailRouter,
  documents: documentsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;