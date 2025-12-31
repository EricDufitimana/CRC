import { adminProcedure, createTRPCRouter } from "../init";
import { prisma } from "@/lib/prisma";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const crcClassManagementRouter = createTRPCRouter({
  // Get all CRC classes
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

  // Create a new CRC class
  createCrcClass: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        grade_group: z.enum(['Enrichment_Year', 'Senior_4', 'Senior_5', 'Senior_6']).nullable().optional(),
        student_ids: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, grade_group, student_ids } = input;

      // Create the CRC class
      const created = await prisma.crc_class.create({
        data: {
          name: name.trim(),
          grade_group: grade_group ? (grade_group as 'Enrichment_Year' | 'Senior_4' | 'Senior_5' | 'Senior_6') : null,
          created_by_id: ctx.user.id as bigint,
        },
        include: {
          admin: { select: { first_name: true, last_name: true } },
        },
      });

      // If student_ids are provided, assign them to this class
      if (student_ids && student_ids.length > 0) {
        await prisma.students.updateMany({
          where: { id: { in: student_ids.map(id => BigInt(id)) } },
          data: { crc_class_id: created.id },
        });
      }

      const formatEnumValue = (value: string | null) => {
        if (!value) return null;
        return value.replace(/_/g, ' ');
      };

      return {
        id: created.id.toString(),
        name: created.name,
        grade_group: formatEnumValue(created.grade_group),
        created_by: created.created_by_id.toString(),
        created_by_name: `${created.admin.first_name} ${created.admin.last_name}`.trim(),
        created_at: created.created_at,
        num_students: 0,
      };
    }),

  // Delete a CRC class
  deleteCrcClass: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { id } = input;

      // First, remove all students from this class
      await prisma.students.updateMany({
        where: { crc_class_id: BigInt(id) },
        data: { crc_class_id: null },
      });

      // Then delete the class
      await prisma.crc_class.delete({ where: { id: BigInt(id) } });

      return { success: true };
    }),

  // Get students in a CRC class
  getCrcClassStudents: adminProcedure
    .input(
      z.object({
        classId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { classId } = input;

      const formatEnumValue = (value: string | null) => {
        if (!value) return null;
        return value.replace(/_/g, ' ');
      };

      const crcClass = await prisma.crc_class.findUnique({
        where: { id: BigInt(classId) },
        include: {
          admin: { select: { first_name: true, last_name: true } },
          students: { 
            select: { 
              id: true, 
              student_id: true,
              first_name: true, 
              last_name: true, 
              email: true,
              grade: true,
              major_short: true,
              gpa: true
            },
            orderBy: [{ first_name: 'asc' }, { last_name: 'asc' }]
          },
        },
      });

      if (!crcClass) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'CRC class not found',
        });
      }

      return {
        id: crcClass.id.toString(),
        name: crcClass.name,
        grade_group: formatEnumValue(crcClass.grade_group),
        created_by_name: `${crcClass.admin.first_name} ${crcClass.admin.last_name}`.trim(),
        created_at: crcClass.created_at,
        students: crcClass.students.map(s => ({
          id: s.id.toString(),
          student_id: s.student_id,
          full_name: `${s.first_name || ''} ${s.last_name || ''}`.trim(),
          first_name: s.first_name,
          last_name: s.last_name,
          email: s.email,
          grade: formatEnumValue(s.grade),
          major_short: s.major_short,
          gpa: s.gpa,
        }))
      };
    }),

  // Update CRC class name
  updateCrcClassName: adminProcedure
    .input(
      z.object({
        classId: z.string(),
        name: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { classId, name } = input;

      const updated = await prisma.crc_class.update({
        where: { id: BigInt(classId) },
        data: { name: name.trim() },
        include: {
          admin: { select: { first_name: true, last_name: true } },
        },
      });

      return {
        success: true,
        class: {
          id: updated.id.toString(),
          name: updated.name,
        },
        message: 'Class updated successfully',
      };
    }),

  // Add students to CRC class
  addStudentsToCrcClass: adminProcedure
    .input(
      z.object({
        classId: z.string(),
        studentIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const { classId, studentIds } = input;

      await prisma.students.updateMany({
        where: { id: { in: studentIds.map(id => BigInt(id)) } },
        data: { crc_class_id: BigInt(classId) },
      });

      return { success: true };
    }),

  // Remove students from CRC class
  removeStudentsFromCrcClass: adminProcedure
    .input(
      z.object({
        classId: z.string(),
        studentIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const { classId, studentIds } = input;

      await prisma.students.updateMany({
        where: { 
          id: { in: studentIds.map(id => BigInt(id)) },
          crc_class_id: BigInt(classId)
        },
        data: { crc_class_id: null },
      });

      return { success: true };
    }),

  // Bulk import students from file
  bulkImportStudents: adminProcedure
    .input(
      z.object({
        classId: z.string(),
        file: z.instanceof(File),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { classId, file } = input;

      // This is a complex operation that involves:
      // 1. Uploading file to Supabase storage
      // 2. Calling edge function to extract names
      // 3. Matching names with students
      // 4. Assigning matched students to class
      
      // For now, we'll use the existing API route logic
      // In a production app, you might want to move this logic here
      // or keep it as an API route if it requires special handling
      
      // Since tRPC doesn't handle FormData well, we'll keep bulk import as an API route
      // But we can create a wrapper that calls it
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Bulk import should be handled via API route due to file upload complexity',
      });
    }),
});

