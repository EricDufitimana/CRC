import { adminProcedure, createTRPCRouter } from "../init";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const studentManagementRouter = createTRPCRouter({
  // Get all students
  getStudents: adminProcedure
    .query(async () => {
      // Helper function to replace underscores with spaces
      const formatEnumValue = (value: string | null) => {
        if (!value) return null;
        return value.replace(/_/g, ' ');
      };

      const students = await prisma.students.findMany({
        orderBy: {
          id: 'asc'
        }
      });

      return students.map(student => {
        const full_name = [student.first_name, student.last_name].filter(Boolean).join(' ');
        
        return {
          id: student.id.toString(),
          student_id: student.student_id,
          full_name: full_name,
          first_name: student.first_name,
          last_name: student.last_name,
          email: student.email,
          profile_picture: student.profile_picture,
          date_of_registration: student.date_of_registration,
          user_id: student.user_id ? student.user_id.toString() : null,
          grade: formatEnumValue(student.grade),
          major_full: student.major_full ? formatEnumValue(student.major_full) : null,
          major_short: student.major_short ? student.major_short : null,
          gpa: student.gpa,
          crc_class_id: student.crc_class_id ? student.crc_class_id.toString() : null,
          academic_report_path: student.academic_report_path,
          resume_link: student.resume_link,
          gender: formatEnumValue(student.gender),
        };
      });
    }),

  // Get CRC classes
  getCrcClasses: adminProcedure
    .query(async () => {
      // Helper function to replace underscores with spaces
      const formatEnumValue = (value: string | null) => {
        if (!value) return null;
        return value.replace(/_/g, ' ');
      };

      const classes = await prisma.crc_class.findMany({
        include: {
          admin: { select: { first_name: true, last_name: true } },
          _count: { select: { students: true } },
        },
        orderBy: { created_at: "desc" },
      });

      return classes.map((c) => ({
        id: c.id.toString(),
        name: c.name,
        grade_group: formatEnumValue(c.grade_group),
        created_by: c.created_by_id.toString(),
        created_by_name: `${c.admin.first_name} ${c.admin.last_name}`.trim(),
        created_at: c.created_at,
        num_students: c._count.students,
      }));
    }),

  // Send bulk emails to students
  sendBulkEmails: adminProcedure
    .input(
      z.object({
        recipientEmails: z.array(z.string().email()),
        subject: z.string().min(1),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { recipientEmails, subject, content } = input;

      try {
        const { data, error } = await supabaseAdmin.functions.invoke("send_bulk_emails", {
          body: {
            recipient_emails: recipientEmails,
            subject: subject,
            content: content,
          }
        });

        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Failed to send emails",
          });
        }

        return {
          success: true,
          message: "Email sent successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send email",
        });
      }
    }),

  // Get student documents (academic report signed URL)
  getStudentDocuments: adminProcedure
    .input(
      z.object({
        studentId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { studentId } = input;

      try {
        const studentIdNum = parseInt(studentId);
        if (isNaN(studentIdNum)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid student ID",
          });
        }

        // Fetch student from Prisma
        const student = await prisma.students.findUnique({
          where: { id: BigInt(studentIdNum) },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            academic_report_path: true,
            resume_link: true,
          },
        });

        if (!student) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Student not found",
          });
        }

        // Generate signed URL for academic report if it exists
        let academic_report_url = null;
        let academic_report_filename = null;

        if (student.academic_report_path) {
          const { data: urlData, error: urlError } = await supabaseAdmin.storage
            .from('reports')
            .createSignedUrl(student.academic_report_path, 3600); // 1 hour expiry

          if (!urlError && urlData?.signedUrl) {
            academic_report_url = urlData.signedUrl;
          }

          // Extract filename from path
          const pathParts = student.academic_report_path.split('/');
          if (pathParts.length > 0) {
            academic_report_filename = pathParts[pathParts.length - 1];
          }
        }

        return {
          id: student.id.toString(),
          first_name: student.first_name,
          last_name: student.last_name,
          academic_report_path: student.academic_report_path,
          academic_report_filename: academic_report_filename,
          academic_report_url: academic_report_url,
          resume_link: student.resume_link,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch student documents",
        });
      }
    }),
});

