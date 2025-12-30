import { createTRPCRouter } from '../init';
import { resourcesRouter } from './resources';
import { authRouter } from './auth';
import { dashboardAdminRouter } from './dashboard-admin';
import { studentManagementRouter } from './student-management';
import { assignmentsManagementRouter } from './assignments-management';
import { crcClassManagementRouter } from './crc-class-management';
import { attendanceManagementRouter } from './attendance-management';
export const appRouter = createTRPCRouter({
  resources: resourcesRouter,
  auth: authRouter,
  dashboardAdmin: dashboardAdminRouter,
  studentManagement: studentManagementRouter,
  assignmentsManagement: assignmentsManagementRouter,
  crcClassManagement: crcClassManagementRouter,
  attendanceManagement: attendanceManagementRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;