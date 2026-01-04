import { z } from "zod";
import { baseProcedure, adminProcedure, createTRPCRouter } from "../init";
import { prisma } from "@/lib/prisma";

export const essayRequestsManagementRouter = createTRPCRouter({
  getEssayRequests: adminProcedure
    .input(z.object({
      admin_id: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const whereClause: any = {};
      if (input.admin_id) {
        whereClause.admin_id = BigInt(input.admin_id);
      }
      
      const requests = await prisma.essay_requests.findMany({
        where: whereClause,
        include: {
          admin: true,
          students: true,
        },
        orderBy: { id: 'desc' }
      });

      return requests.map(request => ({
        id: request.id.toString(),
        title: request.title,
        description: request.description,
        deadline: request.deadline ? request.deadline.toISOString() : null,
        essay_link: request.essay_link,
        word_count: request.word_count.toString(),
        student_id: request.student_id.toString(),
        admin_id: request.admin_id.toString(),
        submitted_at: request.submitted_at ? request.submitted_at.toISOString() : null,
        created_at: request.submitted_at ? request.submitted_at.toISOString() : null,
        completed_at: request.completed_at ? request.completed_at.toISOString() : null,
        status: request.status,
        referred: request.referred,
        student_name: `${request.students.first_name} ${request.students.last_name}`,
        admin_name: `${request.admin.honorific || ''} ${request.admin.first_name} ${request.admin.last_name}`.trim(),
        grade: request.students.grade,
      }));
    }),

  getReferrals: adminProcedure
    .input(z.object({
      admin_id: z.string(),
      type: z.enum(['sent', 'received', 'all']),
    }))
    .query(async ({ input }) => {
      const adminId = BigInt(input.admin_id);
      const whereClause: any = {};

      if (input.type === 'sent') {
        whereClause.from_admin_id = adminId;
      } else if (input.type === 'received') {
        whereClause.to_admin_id = adminId;
      } else {
        whereClause.OR = [
          { from_admin_id: adminId },
          { to_admin_id: adminId }
        ];
      }

      const referrals = await prisma.essay_referrals.findMany({
        where: whereClause,
        include: {
          essay_requests: {
            include: {
              students: true,
            }
          },
          from_admin: true,
          to_admin: true,
        },
        orderBy: { referred_at: 'desc' },
      });

      return referrals.map(ref => ({
        id: ref.id.toString(),
        essayId: ref.essay_requested_id.toString(),
        essayTitle: ref.essay_requests.title,
        essayLink: ref.essay_requests.essay_link,
        studentName: `${ref.essay_requests.students.first_name} ${ref.essay_requests.students.last_name}`,
        referredTo: `${ref.to_admin.honorific || ''} ${ref.to_admin.first_name} ${ref.to_admin.last_name}`.trim(),
        referredBy: `${ref.from_admin.honorific || ''} ${ref.from_admin.first_name} ${ref.from_admin.last_name}`.trim(),
        referredAt: ref.referred_at.toISOString(),
        status: ref.has_completed ? 'completed' : 'pending',
        type: ref.from_admin_id === adminId ? 'sent' : 'received',
        deadline: ref.essay_requests.deadline ? ref.essay_requests.deadline.toISOString() : null,
        submittedAt: ref.essay_requests.submitted_at ? ref.essay_requests.submitted_at.toISOString() : null,
        wordCount: ref.essay_requests.word_count.toString(),
        has_completed: ref.has_completed,
        completed_at: ref.completed_at ? ref.completed_at.toISOString() : null,
      }));
    }),

  updateStatus: adminProcedure
    .input(z.object({
      id: z.string(),
      status: z.string(),
    }))
    .mutation(async ({ input }) => {
      await prisma.essay_requests.update({
        where: { id: BigInt(input.id) },
        data: { 
          status: input.status as any,
          ...(input.status === 'completed' ? { completed_at: new Date() } : {})
        },
      });
      return { success: true };
    }),

  deferTo: adminProcedure
    .input(z.object({
      essay_id: z.string(),
      from_admin_id: z.string(),
      to_admin_id: z.string(),
    }))
    .mutation(async ({ input }) => {
      await prisma.essay_referrals.create({
        data: {
          essay_requested_id: BigInt(input.essay_id),
          from_admin_id: BigInt(input.from_admin_id),
          to_admin_id: BigInt(input.to_admin_id),
        }
      });
      await prisma.essay_requests.update({
        where: { id: BigInt(input.essay_id) },
        data: { referred: true }
      });
      return { success: true };
    }),

  markReferralCompleted: adminProcedure
    .input(z.object({
      referral_id: z.string(),
    }))
    .mutation(async ({ input }) => {
      await prisma.essay_referrals.update({
        where: { id: BigInt(input.referral_id) },
        data: { 
          has_completed: true, 
          completed_at: new Date() 
        }
      });
      return { success: true };
    }),
    
  getAdmins: adminProcedure
    .query(async () => {
      const admins = await prisma.admin.findMany();
      return admins.map(a => ({
        id: a.id.toString(),
        name: `${a.honorific || ''} ${a.first_name} ${a.last_name}`.trim(),
        role: a.role,
      }));
    }),
});
