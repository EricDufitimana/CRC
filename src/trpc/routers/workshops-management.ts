import { adminProcedure, createTRPCRouter } from "../init";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";

const workshopSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  presentation_url: z.string().url().optional().or(z.literal("")),
  google_slide_url: z.string().url().optional().or(z.literal("")),
  workshop_date: z.string().min(1),
  workshop_groups: z.array(z.string()).min(1),
});

const assignmentSchema = z.object({
  workshop_id: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  submission_deadline: z.string(),
  submission_style: z.enum(["google_link", "file_upload"]),
  crc_class_group: z.string().optional(),
});

export const workshopsManagementRouter = createTRPCRouter({
  getWorkshopsByCategory: adminProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      if (input.category.startsWith('class:')) {
        const classId = BigInt(input.category.replace('class:', ''));
        const workshops = await prisma.workshops.findMany({
          where: {
            workshop_to_crc: {
              some: {
                crc_class_id: classId
              }
            }
          },
          include: {
            assignments: true,
            workshop_to_crc: {
              include: {
                crc_class: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          }
        });

        return workshops.map(w => ({
          id: w.id.toString(),
          title: w.title,
          description: w.description,
          date: w.date?.toISOString() || null,
          presentation_url: w.presentation_url,
          google_slide_url: w.google_slide_url,
          has_assignment: w.assignments.length > 0,
          crc_classes: w.workshop_to_crc.map(wtc => ({
            id: wtc.crc_class.id.toString(),
            name: wtc.crc_class.name,
            grade_group: wtc.crc_class.grade_group
          }))
        }));
      }

      // Logic for filtering by category
      // Mapping categories like 'ey' to grade groups
      const categoryMap: Record<string, string[]> = {
        'ey': ['Enrichment_Year'],
        'senior_4': ['Senior_4'],
      };

      // If it's senior_5 or senior_6 (and not a specific class)
      categoryMap['senior_5'] = ['Senior_5'];
      categoryMap['senior_6'] = ['Senior_6'];

      const gradeGroups = categoryMap[input.category] || [input.category];

      const workshops = await prisma.workshops.findMany({
        where: {
          workshop_to_crc: {
            some: {
              crc_class: {
                grade_group: { in: gradeGroups as any }
              }
            }
          }
        },
        include: {
          assignments: true,
          workshop_to_crc: {
            include: {
              crc_class: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      });

      return workshops.map(w => ({
        id: w.id.toString(),
        title: w.title,
        description: w.description,
        date: w.date?.toISOString() || null,
        presentation_url: w.presentation_url,
        google_slide_url: w.google_slide_url,
        has_assignment: w.assignments.length > 0,
        crc_classes: w.workshop_to_crc.map(wtc => ({
          id: wtc.crc_class.id.toString(),
          name: wtc.crc_class.name,
          grade_group: wtc.crc_class.grade_group
        }))
      }));
    }),

  getCrcClasses: adminProcedure.query(async () => {
    const classes = await prisma.crc_class.findMany({
      orderBy: { name: 'asc' }
    });
    return classes.map(c => ({
      id: c.id.toString(),
      name: c.name,
      grade_group: c.grade_group
    }));
  }),

  createWorkshop: adminProcedure
    .input(workshopSchema)
    .mutation(async ({ input }) => {
      const { title, description, presentation_url, google_slide_url, workshop_date, workshop_groups } = input;

      // Determine CRC classes
      let crcClassIds: bigint[] = [];

      for (const group of workshop_groups) {
        if (group.startsWith('class:')) {
          crcClassIds.push(BigInt(group.replace('class:', '')));
        } else {
          const classes = await prisma.crc_class.findMany({
            where: { grade_group: group as any },
            select: { id: true }
          });
          crcClassIds.push(...classes.map(c => c.id));
        }
      }

      // De-duplicate IDs
      crcClassIds = Array.from(new Set(crcClassIds));

      if (crcClassIds.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'No matching CRC classes found for selected groups'
        });
      }

      const workshop = await prisma.workshops.create({
        data: {
          title,
          description,
          date: new Date(workshop_date),
          presentation_url: presentation_url || null,
          google_slide_url: google_slide_url || null,
          has_assignment: false,
          workshop_to_crc: {
            create: crcClassIds.map(id => ({
              crc_class_id: id
            }))
          }
        }
      });

      return { id: workshop.id.toString() };
    }),

  getAssignmentByWorkshopId: adminProcedure
    .input(z.object({ workshopId: z.string() }))
    .query(async ({ input }) => {
      const assignment = await prisma.assignments.findFirst({
        where: { workshop_id: BigInt(input.workshopId) },
        orderBy: { created_at: 'desc' }
      });
      if (!assignment) return null;
      return {
        id: assignment.id.toString(),
        title: assignment.title,
        description: assignment.description,
        submission_deadline: assignment.submission_idate.toISOString(),
        submission_style: assignment.submission_style as "google_link" | "file_upload",
        created_at: assignment.created_at.toISOString()
      };
    }),

  updateWorkshop: adminProcedure
    .input(workshopSchema.extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id, title, description, presentation_url, google_slide_url, workshop_date, workshop_groups } = input;

      let crcClassIds: bigint[] = [];
      for (const group of workshop_groups) {
        if (group.startsWith('class:')) {
          crcClassIds.push(BigInt(group.replace('class:', '')));
        } else {
          const classes = await prisma.crc_class.findMany({
            where: { grade_group: group as any },
            select: { id: true }
          });
          crcClassIds.push(...classes.map(c => c.id));
        }
      }

      // De-duplicate IDs
      crcClassIds = Array.from(new Set(crcClassIds));

      await prisma.$transaction([
        prisma.workshop_to_crc_class.deleteMany({
          where: { workshop_id: BigInt(id) }
        }),
        prisma.workshops.update({
          where: { id: BigInt(id) },
          data: {
            title,
            description,
            date: new Date(workshop_date),
            presentation_url: presentation_url || null,
            google_slide_url: google_slide_url || null,
            workshop_to_crc: {
              create: crcClassIds.map(classId => ({
                crc_class_id: classId
              }))
            }
          }
        })
      ]);

      return { success: true };
    }),

  deleteWorkshop: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.workshops.delete({
        where: { id: BigInt(input.id) }
      });
      return { success: true };
    }),

  createAssignment: adminProcedure
    .input(assignmentSchema)
    .mutation(async ({ input }) => {
      const { workshop_id, title, description, submission_deadline, submission_style, crc_class_group } = input;

      const assignment = await prisma.assignments.create({
        data: {
          workshop_id: BigInt(workshop_id),
          title,
          description,
          submission_idate: new Date(submission_deadline),
          submission_style,
        }
      });

      await prisma.workshops.update({
        where: { id: BigInt(workshop_id) },
        data: { has_assignment: true }
      });

      // Email Logic (Optional: move to a utility if needed)
      // For now, focus on DB migration

      return { id: assignment.id.toString() };
    }),

  deleteAssignment: adminProcedure
    .input(z.object({ assignmentId: z.string(), workshopId: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.$transaction([
        prisma.assignments.delete({
          where: { id: BigInt(input.assignmentId) }
        }),
        prisma.workshops.update({
          where: { id: BigInt(input.workshopId) },
          data: { has_assignment: false }
        })
      ]);
      return { success: true };
    }),

  updateAssignment: adminProcedure
    .input(assignmentSchema.extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { id, title, description, submission_deadline, submission_style } = input;
      await prisma.assignments.update({
        where: { id: BigInt(id) },
        data: {
          title,
          description,
          submission_idate: new Date(submission_deadline),
          submission_style,
        }
      });
      return { success: true };
    }),
});
