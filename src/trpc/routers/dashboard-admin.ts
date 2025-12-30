import { TRPCError } from "@trpc/server";
import { adminProcedure, baseProcedure,protectedProcedure, createTRPCRouter } from "../init";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dashboardAdminRouter = createTRPCRouter({

  // fetching the essay requests

  getEssayRequests: adminProcedure
    .query(async ({ ctx }) => {
      const adminId = ctx.user.id.toString();
   
      const essayRequests = await prisma.essay_requests.findMany({
        where: {
          admin_id: ctx.user.id as bigint,
        },
        select: {
          id: true,
          title: true,
          description: true,
          deadline: true,
          essay_link: true,
          word_count: true,
          student_id: true,
          admin_id: true,
          submitted_at: true,
          completed_at: true,
          status: true,
          referred: true,
          admin: {
            select: {
              first_name: true,
              last_name: true,
              honorific: true,
              email: true,
            },
          },
          students: {
            select: {
              first_name: true,
              last_name: true,
              grade: true,
              email: true,
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
      });
      
      return essayRequests.map(request => {
        const adminName = [
          request.admin?.honorific,
          request.admin?.first_name,
          request.admin?.last_name,
        ]
          .filter(Boolean)
          .join(' ');
        
        const studentName = [
          request.students?.first_name,
          request.students?.last_name,
        ]
          .filter(Boolean)
          .join(' ');
        
        return {
          id: request.id, 
          title: request.title,
          description: request.description,
          deadline: request.deadline, 
          essay_link: request.essay_link,
          word_count: request.word_count, 
          student_id: request.student_id, 
          admin_id: request.admin_id, 
          submitted_at: request.submitted_at,
          completed_at: request.completed_at,
          status: request.status,
          referred: request.referred ?? false,
          admin_name: adminName || 'Unknown',
          student_name: studentName || 'Unknown',
          admin_email: request.admin?.email ?? null,
          student_email: request.students?.email ?? null,
          grade: request.students?.grade?.replace(/_/g, ' ') ?? null,
        };
      });
    }),


    // fetching the assignments

    getAssignments: baseProcedure
    .query(async() => {
      const assignments = await prisma.assignments.findMany({
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          submission_idate: true,
          submission_style: true,
          created_at: true,
          workshops: { 
            select: { 
              id: true, 
              title: true,
              workshop_to_crc: {
                include: {
                  crc_class: {
                    select: { id: true, name: true }
                  }
                }
              }
            } 
          },
          _count: { select: { submissions: true } },
        },
      })
      const studentsCount = await prisma.students.count()

      const list = assignments.map((a) => ({
        id: a.id.toString(),
        title: a.title,
        description: a.description,
        submission_idate: a.submission_idate,
        submission_style: a.submission_style,
        created_at: a.created_at,
        workshop_title: a.workshops?.title ?? null,
        workshop_id: a.workshops?.id?.toString() ?? null,
        workshop_crc_class: a.workshops?.workshop_to_crc?.[0]?.crc_class?.name ?? null,
        crc_class_id: a.workshops?.workshop_to_crc?.[0]?.crc_class?.id?.toString() ?? null,
        crc_class_name: a.workshops?.workshop_to_crc?.[0]?.crc_class?.name ?? null,
        total_submitted: a._count.submissions,
        total_students: studentsCount,
      }))

      return list;
    }),

    // fetching the attendance records 

    getAttendanceRecords: adminProcedure
    .query(async() => {
      const attendanceRecords = await prisma.attendance_records.findMany({
        orderBy: {created_at: 'desc'},
        select: {
          id: true,
          status: true,
          created_at: true,
          session: {
            select: {
              id: true,
              workshop: { select: { title: true } },
              crc_class: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          },
          student: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            }
          }
        }
      })

      return attendanceRecords.map((a) => ({
        id: a.id.toString(),
        status: a.status,
        created_at: a.created_at,
        workshop_title: a.session?.workshop?.title ?? null,
        workshop_id: a.session?.id?.toString() ?? null,
        class_name: a.session?.crc_class?.name ?? null,
        class_id: a.session?.crc_class?.id?.toString() ?? null,
      }))
    }),

    //Fetching all the workshops

    getWorkshops: baseProcedure
    .query(async() => {
      const workshops = await prisma.workshops.findMany({
        include: {
          assignments: true,
          workshop_to_crc: {
            include: {
              crc_class: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });
        return workshops.map((w) => ({
        id: w.id.toString(),
        title: w.title,
        created_at: w.created_at,
        crc_classes: w.workshop_to_crc?.map(wtc => ({
          id: wtc.crc_class.id.toString(),
          name: wtc.crc_class.name
        })) || [],
      }))
    }),

    // fetching the opportunities

    getOpportunities: adminProcedure
      .query(async ({ ctx }) => {
      const opportunityRequests = await prisma.opportunities.findMany({
        where: { admin_id: ctx.user.id as bigint },
        include: {
          students: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
              grade: true
            }
          },
          admin: {
            select: {
              first_name: true,
              last_name: true,
              honorific: true
            }
          },
          opportunity_referrals: {
            include: {
              from_admin: {
                select: {
                  first_name: true,
                  last_name: true,
                  honorific: true
                }
              },
              to_admin: {
                select: {
                  first_name: true,
                  last_name: true,
                  honorific: true
                }
              }
            },
            orderBy: {
              referred_at: 'desc'
            }
          }
        },
        orderBy: {
          id: 'desc' 
        }
      });

      return opportunityRequests.map((o) => ({
        id: o.id.toString(),
        title: o.title,
        description: o.description,
        deadline: o.deadline,
        submitted_at: o.submitted_at,
        status: o.status,
      }))
    }),
});