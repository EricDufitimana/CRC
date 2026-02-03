import { adminProcedure, createTRPCRouter, baseProcedure, t } from "../init";
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

  // Get CRC classes by grade group (public endpoint for menu)
  getCrcClassesByGradeGroup: t.procedure
    .input(
      z.object({
        gradeGroup: z.enum(['s5', 's6', 'ey', 's4']).optional(),
      })
    )
    .query(async ({ input }) => {
      const { gradeGroup } = input;

      // Convert gradeGroup from frontend format to database format
      const dbGradeGroup = gradeGroup === 's5' ? 'Senior_5' : 
                          gradeGroup === 's6' ? 'Senior_6' :
                          gradeGroup === 'ey' ? 'Enrichment_Year' :
                          gradeGroup === 's4' ? 'Senior_4' : null;

      const formatEnumValue = (value: string | null) => {
        if (!value) return null;
        return value.replace(/_/g, ' ');
      };

      const crcClasses = await prisma.crc_class.findMany({
        where: dbGradeGroup ? { grade_group: dbGradeGroup } : undefined,
        select: {
          id: true,
          name: true,
          grade_group: true,
          _count: {
            select: {
              students: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      return crcClasses.map(crcClass => ({
        id: crcClass.id.toString(),
        name: crcClass.name,
        grade_group: formatEnumValue(crcClass.grade_group),
        num_students: crcClass._count.students
      }));
    }),

  // Create a new CRC class
  createCrcClass: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        grade_group: z.enum(['Enrichment_Year', 'Senior_4', 'Senior_5', 'Senior_6']),
        student_ids: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, grade_group, student_ids } = input;

      // Create the CRC class
      const created = await prisma.crc_class.create({
        data: {
          name: name.trim(),
          grade_group: grade_group as 'Enrichment_Year' | 'Senior_4' | 'Senior_5' | 'Senior_6',
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
        studentIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { classId, studentIds } = input;

      try {
        console.log('🔄 Starting bulk import for class:', classId);
        console.log('👥 Students to add:', studentIds.length);

        // Verify the class exists
        const targetClass = await prisma.crc_class.findUnique({
          where: { id: BigInt(classId) }
        });

        if (!targetClass) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Target class not found'
          });
        }

        // Update students to assign them to the class
        const updateResult = await prisma.students.updateMany({
          where: { 
            id: { in: studentIds.map(id => BigInt(id)) }
          },
          data: { crc_class_id: BigInt(classId) }
        });

        console.log('✅ Bulk import completed:', {
          classId,
          studentsUpdated: updateResult.count
        });

        return {
          success: true,
          classId,
          studentsUpdated: updateResult.count,
          message: `Successfully assigned ${updateResult.count} students to ${targetClass.name}`
        };

      } catch (error) {
        console.error('❌ Bulk import error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to bulk import students'
        });
      }
    }),
});

