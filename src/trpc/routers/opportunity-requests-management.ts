import { z } from "zod";
import { baseProcedure, adminProcedure, createTRPCRouter } from "../init";
import { prisma } from "@/lib/prisma";

export const opportunityRequestsManagementRouter = createTRPCRouter({
  getOpportunityRequests: adminProcedure
    .input(z.object({
      admin_id: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const whereClause: any = {};
      if (input.admin_id) {
        whereClause.admin_id = BigInt(input.admin_id);
      }

      const opportunities = await prisma.opportunities.findMany({
        where: whereClause,
        include: {
          admin: true,
          students: true,
          opportunity_referrals: {
            include: {
              from_admin: true,
              to_admin: true,
            },
            orderBy: { referred_at: 'desc' }
          }
        },
        orderBy: { id: 'desc' }
      });

      return opportunities.map(opp => ({
        id: opp.id.toString(),
        title: opp.title,
        description: opp.description,
        deadline: opp.deadline ? opp.deadline.toISOString() : null,
        link: opp.link,
        submitted_at: opp.submitted_at ? opp.submitted_at.toISOString() : null,
        created_at: opp.submitted_at ? opp.submitted_at.toISOString() : null,
        status: opp.status,
        referred: opp.referred,
        student_id: opp.student_id.toString(),
        admin_id: opp.admin_id.toString(),
        student_name: `${opp.students.first_name} ${opp.students.last_name}`,
        admin_name: `${opp.admin.honorific || ''} ${opp.admin.first_name} ${opp.admin.last_name}`.trim(),
        grade: opp.students.grade,
        ai_category: opp.ai_category,
        reason: opp.reason,
        referral_info: opp.opportunity_referrals[0] ? {
          referred_by: `${opp.opportunity_referrals[0].from_admin.honorific || ''} ${opp.opportunity_referrals[0].from_admin.first_name} ${opp.opportunity_referrals[0].from_admin.last_name}`.trim(),
          referred_to: `${opp.opportunity_referrals[0].to_admin.honorific || ''} ${opp.opportunity_referrals[0].to_admin.first_name} ${opp.opportunity_referrals[0].to_admin.last_name}`.trim(),
          referred_at: opp.opportunity_referrals[0].referred_at.toISOString(),
          status: opp.opportunity_referrals[0].status,
        } : null
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

      const referrals = await prisma.opportunity_referrals.findMany({
        where: whereClause,
        include: {
          opportunities: {
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
        opportunityId: ref.opportunity_id.toString(),
        title: ref.opportunities.title,
        link: ref.opportunities.link,
        studentName: `${ref.opportunities.students.first_name} ${ref.opportunities.students.last_name}`,
        referredTo: `${ref.to_admin.honorific || ''} ${ref.to_admin.first_name} ${ref.to_admin.last_name}`.trim(),
        referredBy: `${ref.from_admin.honorific || ''} ${ref.from_admin.first_name} ${ref.from_admin.last_name}`.trim(),
        referredAt: ref.referred_at.toISOString(),
        status: ref.status, // Using the referral status field directly
        type: ref.from_admin_id === adminId ? 'sent' : 'received',
        deadline: ref.opportunities.deadline ? ref.opportunities.deadline.toISOString() : null,
        submittedAt: ref.opportunities.submitted_at ? ref.opportunities.submitted_at.toISOString() : null,
        ai_category: ref.opportunities.ai_category,
      }));
    }),

  updateStatus: adminProcedure
    .input(z.object({
      id: z.string(),
      status: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await prisma.opportunities.update({
        where: { id: BigInt(input.id) },
        data: {
          status: input.status as any,
          ...(input.reason ? { reason: input.reason } : {}),
          ...(input.status === 'accepted' ? { accepted_at: new Date() } : {})
        },
      });
      return { success: true };
    }),

  deferTo: adminProcedure
    .input(z.object({
      opportunity_id: z.string(),
      from_admin_id: z.string(),
      to_admin_id: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await prisma.opportunity_referrals.create({
        data: {
          opportunity_id: BigInt(input.opportunity_id),
          from_admin_id: BigInt(input.from_admin_id),
          to_admin_id: BigInt(input.to_admin_id),
          notes: input.notes,
        }
      });
      await prisma.opportunities.update({
        where: { id: BigInt(input.opportunity_id) },
        data: { referred: true }
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
