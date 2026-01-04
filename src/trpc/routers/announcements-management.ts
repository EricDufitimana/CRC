import { z } from "zod";
import { baseProcedure, adminProcedure, createTRPCRouter } from "../init";
import { prisma } from "@/lib/prisma";

export const announcementsManagementRouter = createTRPCRouter({
  getAnnouncements: baseProcedure
    .input(z.object({
      page: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const listWhereClause = {
        ...(input?.page ? { 
          page: input.page as any,
          is_active: true 
        } : {}),
      };
      
      const list = await prisma.announcements.findMany({
        where: listWhereClause,
        orderBy: { created_at: "desc" },
      });

      return list.map((n) => ({
        id: n.id.toString(),
        message: n.message,
        end_time: n.end_time ? n.end_time.toISOString() : null,
        is_active: n.is_active,
        created_at: n.created_at ? n.created_at.toISOString() : null,
        page: n.page,
      }));
    }),

  createAnnouncement: adminProcedure
    .input(z.object({
      message: z.string(),
      page: z.string(),
      end_time: z.string().nullable(),
      is_active: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const result = await prisma.announcements.create({
        data: {
          message: input.message,
          page: input.page as any,
          end_time: input.end_time ? new Date(input.end_time) : null,
          is_active: input.is_active,
        },
      });
      
      return {
        ...result,
        id: result.id.toString(),
      };
    }),

  updateAnnouncement: adminProcedure
    .input(z.object({
      id: z.string(),
      message: z.string(),
      page: z.string(),
      end_time: z.string().nullable(),
    }))
    .mutation(async ({ input }) => {
      const result = await prisma.announcements.update({
        where: { id: BigInt(input.id) },
        data: {
          message: input.message,
          page: input.page as any,
          end_time: input.end_time ? new Date(input.end_time) : null,
        },
      });
      
      return {
        ...result,
        id: result.id.toString(),
      };
    }),

  updateAnnouncementStatus: adminProcedure
    .input(z.object({
      id: z.string(),
      is_active: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const result = await prisma.announcements.update({
        where: { id: BigInt(input.id) },
        data: { is_active: input.is_active },
      });
      
      return {
        ...result,
        id: result.id.toString(),
      };
    }),

  deleteAnnouncement: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input }) => {
      await prisma.announcements.delete({
        where: { id: BigInt(input.id) },
      });
      return { success: true };
    }),
});
