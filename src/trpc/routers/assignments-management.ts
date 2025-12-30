import { adminProcedure, createTRPCRouter } from "../init";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const assignmentsManagementRouter = createTRPCRouter({
  // Get CRC classes for assignments management
  getCrcClasses: adminProcedure.query(async () => {
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

  // Get workshops for assignments management
  getWorkshops: adminProcedure
    .input(
      z.object({
        useCase: z.enum(['assignment']).optional(),
      }).optional()
    )
    .query(async () => {
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
        description: w.description,
        has_assignment: w.assignments.length > 0,
        date: w.date?.toISOString() ?? null,
        presentation_url: w.presentation_url,
        created_at: w.created_at.toISOString(),
        crc_classes: w.workshop_to_crc?.map(wtc => ({
          id: wtc.crc_class.id.toString(),
          name: wtc.crc_class.name
        })) || [],
        assignments: w.assignments.map(a => ({
          id: a.id.toString(),
          title: a.title
        }))
      }));
    }),

  // Get assignments for management (list or detail mode)
  getAssignmentsForManagement: adminProcedure
    .input(
      z.object({
        assignmentId: z.string().optional(),
        selectedClassId: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const { assignmentId, selectedClassId } = input || {};

      // Helper to serialize BigInt
      const serialize = (obj: any): any => {
        return JSON.parse(
          JSON.stringify(obj, (_key, value) => (typeof value === 'bigint' ? value.toString() : value))
        );
      };

      // Always provide a lightweight list of assignments for selectors
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
      });

      const studentsCount = await prisma.students.count();

      if (!assignmentId) {
        // List mode
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
        }));

        return { assignments: serialize(list) };
      }

      // Detail mode for one assignment
      const assignment = await prisma.assignments.findUnique({
        where: { id: BigInt(assignmentId) },
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
        },
      });

      if (!assignment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Assignment not found',
        });
      }

      const submissions = await prisma.submissions.findMany({
        where: { assignment_id: BigInt(assignmentId) },
        select: {
          id: true,
          student_id: true,
          google_doc_link: true,
          file_upload_link: true,
          submitted_at: true,
        },
        orderBy: { submitted_at: 'desc' },
      });

      const submissionByStudent = new Map(
        submissions.map((s) => [s.student_id.toString(), s])
      );

      // Check if selectedClassId is a grade group ID (ends with "_group") or a specific class ID
      let studentWhereClause: any = {};
      
      if (selectedClassId) {
        if (selectedClassId.endsWith('_group')) {
          // It's a grade group ID - extract grade group name and fetch all classes in that group
          const gradeGroupName = selectedClassId
            .replace('_group', '')
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          // Map formatted names back to enum values
          const gradeGroupMap: Record<string, string | null> = {
            'Enrichment Year': 'Enrichment_Year',
            'Senior 4': 'Senior_4',
            'Senior 5': 'Senior_5',
            'Senior 6': 'Senior_6',
            'Other': null
          };
          
          const enumValue = gradeGroupMap[gradeGroupName] || gradeGroupName.replace(' ', '_');
          
          if (enumValue) {
            // Fetch all classes in this grade group
            const gradeGroupClasses = await prisma.crc_class.findMany({
              where: {
                grade_group: enumValue as any
              },
              select: { id: true }
            });
            
            const classIds = gradeGroupClasses.map(c => c.id);
            
            if (classIds.length > 0) {
              studentWhereClause = {
                crc_class_id: { in: classIds }
              };
            }
          }
        } else {
          // It's a specific class ID
          studentWhereClause = {
            crc_class_id: BigInt(selectedClassId)
          };
        }
      } else {
        // Fall back to workshop's first CRC class
        const fallbackClassId = assignment.workshops?.workshop_to_crc?.[0]?.crc_class?.id?.toString();
        if (fallbackClassId) {
          studentWhereClause = {
            crc_class_id: BigInt(fallbackClassId)
          };
        }
      }

      const students = await prisma.students.findMany({
        where: studentWhereClause,
        select: { 
          id: true, 
          first_name: true, 
          last_name: true, 
          email: true,
          crc_class: {
            select: { name: true }
          }
        },
        orderBy: [{ first_name: 'asc' }, { last_name: 'asc' }],
      });

      const rows = students.map((s) => {
        const sub = submissionByStudent.get(s.id.toString());
        const submitted = Boolean(sub);
        const submittedAt = sub?.submitted_at ?? null;
        const onTime = submittedAt
          ? new Date(submittedAt).getTime() <= new Date(assignment.submission_idate).getTime()
          : null;
        const submissionType = submitted
          ? sub?.file_upload_link
            ? 'File upload'
            : sub?.google_doc_link
            ? 'Google link'
            : 'Unknown'
          : 'N/A';

        return serialize({
          student_id: s.id.toString(),
          name: `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim(),
          email: s.email ?? '',
          status: submitted ? 'submitted' : 'not_yet_submitted',
          submitted_at: submittedAt,
          submission_type: submissionType,
          on_time: onTime,
          google_doc_link: sub?.google_doc_link ?? null,
          file_upload_link: sub?.file_upload_link ?? null,
          view_url: sub?.file_upload_link ?? sub?.google_doc_link ?? null,
          crc_class_name: s.crc_class?.name ?? null,
        });
      });

      return serialize({
        assignment: {
          id: assignment.id.toString(),
          title: assignment.title,
          description: assignment.description,
          submission_idate: assignment.submission_idate,
          submission_style: assignment.submission_style,
          created_at: assignment.created_at,
          workshop_title: assignment.workshops?.title ?? null,
          workshop_crc_class: assignment.workshops?.workshop_to_crc?.[0]?.crc_class?.name ?? null,
        },
        metrics: {
          total_students: students.length,
          total_submitted: submissions.length,
        },
        rows,
        assignments: assignments.map((a) => ({ 
          id: a.id.toString(), 
          title: a.title, 
          workshop_title: a.workshops?.title ?? null,
          workshop_crc_class: a.workshops?.workshop_to_crc?.[0]?.crc_class?.name ?? null
        })),
      });
    }),

  // Get signed URL for file viewing
  getSignedUrl: adminProcedure
    .input(
      z.object({
        filePath: z.string(),
        bucket: z.string().default('submissions'),
        expiresIn: z.number().default(3600),
      })
    )
    .query(async ({ input }) => {
      const { filePath, bucket, expiresIn } = input;

      try {
        const { data, error } = await supabaseAdmin
          .storage
          .from(bucket)
          .createSignedUrl(filePath, expiresIn);

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message || 'Failed to create signed URL',
          });
        }

        return { signedUrl: data.signedUrl };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create signed URL',
        });
      }
    }),
});

