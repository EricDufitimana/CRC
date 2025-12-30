import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { prisma } from '@/lib/prisma';

export const resourcesRouter = createTRPCRouter({
  // Get resources by category (only active resources for public)
  getByCategory: baseProcedure
    .input(
      z.object({
        category: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return await prisma.resources.findMany({
        where: {
          category: input.category,
          status: 'active',
        },
        orderBy: {
          created_at: 'desc',
        },
      });
    }),
});

