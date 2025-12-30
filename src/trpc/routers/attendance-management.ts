import { adminProcedure, createTRPCRouter } from "../init";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const attendanceManagementRouter = createTRPCRouter({
  // Get attendance records with optional filters
  getAttendanceRecords: adminProcedure
    .input(
      z.object({
        classId: z.string().optional(),
        workshopId: z.string().optional(),
        date: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const { classId, workshopId, date } = input || {};

      // If no filters, fetch all records
      if (!classId && !workshopId) {
        let where: any = {};
        
        if (date) {
          const startDate = new Date(`${date}T00:00:00`);
          const endDate = new Date(`${date}T23:59:59`);
          where.created_at = {
            gte: startDate,
            lte: endDate,
          };
        }

        const records = await prisma.attendance_records.findMany({
          where,
          include: {
            student: {
              select: {
                id: true,
                student_id: true,
                first_name: true,
                last_name: true,
                major_short: true,
                grade: true,
                profile_picture: true,
              },
            },
            session: {
              include: {
                workshop: {
                  select: {
                    title: true,
                    date: true,
                  },
                },
                crc_class: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
        });

        return records.map((record) => ({
          id: record.id.toString(),
          student: {
            id: record.student.id.toString(),
            student_id: record.student.student_id,
            first_name: record.student.first_name,
            last_name: record.student.last_name,
            major_short: record.student.major_short,
            grade: record.student.grade,
            profile_picture: record.student.profile_picture,
          },
          status: record.status,
          created_at: record.created_at,
          workshop_title: record.session.workshop?.title || 'Unknown Workshop',
          class_name: record.session.crc_class?.name || 'Unknown Class',
          class_id: record.session.crc_class_id?.toString() || null,
        }));
      }

      // If filters are provided, find matching sessions first
      let sessionWhere: any = {};
      if (classId) {
        sessionWhere.crc_class_id = BigInt(classId);
      }
      if (workshopId) {
        sessionWhere.workshop_id = BigInt(workshopId);
      }

      const sessions = await prisma.attendance_sessions.findMany({
        where: sessionWhere,
        select: {
          id: true,
        },
      });

      if (sessions.length === 0) {
        return [];
      }

      const sessionIds = sessions.map(s => s.id);

      let where: any = {
        session_id: { in: sessionIds },
      };

      if (date) {
        const startDate = new Date(`${date}T00:00:00`);
        const endDate = new Date(`${date}T23:59:59`);
        where.created_at = {
          gte: startDate,
          lte: endDate,
        };
      }

      const records = await prisma.attendance_records.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              student_id: true,
              first_name: true,
              last_name: true,
              major_short: true,
              grade: true,
              profile_picture: true,
            },
          },
          session: {
            include: {
              workshop: {
                select: {
                  title: true,
                  date: true,
                },
              },
              crc_class: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return records.map((record) => ({
        id: record.id.toString(),
        student: {
          id: record.student.id.toString(),
          student_id: record.student.student_id,
          first_name: record.student.first_name,
          last_name: record.student.last_name,
          major_short: record.student.major_short,
          grade: record.student.grade,
          profile_picture: record.student.profile_picture,
        },
        status: record.status,
        created_at: record.created_at,
        workshop_title: record.session.workshop?.title || 'Unknown Workshop',
        class_name: record.session.crc_class?.name || 'Unknown Class',
        class_id: record.session.crc_class_id?.toString() || null,
      }));
    }),

  // Record attendance for a workshop and class
  recordAttendance: adminProcedure
    .input(
      z.object({
        workshopId: z.string(),
        classId: z.string(),
        attendanceRecords: z.array(
          z.object({
            studentId: z.string(),
            status: z.enum(['present', 'absent', 'late', 'excused']),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { workshopId, classId, attendanceRecords } = input;

      // Create attendance session
      const session = await prisma.attendance_sessions.create({
        data: {
          workshop_id: BigInt(workshopId),
          crc_class_id: BigInt(classId),
          taken_by: ctx.user.id as bigint,
        },
      });

      // Create attendance records
      await prisma.attendance_records.createMany({
        data: attendanceRecords.map((record) => ({
          session_id: session.id,
          student_id: BigInt(record.studentId),
          status: record.status,
        })),
      });

      return {
        success: true,
        sessionId: session.id.toString(),
        message: 'Attendance recorded successfully',
      };
    }),

  // Update attendance status for a specific record
  updateAttendanceStatus: adminProcedure
    .input(
      z.object({
        recordId: z.string(),
        status: z.enum(['present', 'absent', 'late', 'excused']),
      })
    )
    .mutation(async ({ input }) => {
      const { recordId, status } = input;

      await prisma.attendance_records.update({
        where: { id: BigInt(recordId) },
        data: { status },
      });

      return { success: true };
    }),
});

