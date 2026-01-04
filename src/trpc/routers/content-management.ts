import { adminProcedure, createTRPCRouter } from "../init";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const contentManagementRouter = createTRPCRouter({
  // Get resources by category (admin - includes inactive)
  // This is a convenience wrapper that maps dashboard category names to DB category names
  getResourcesByCategory: adminProcedure
    .input(
      z.object({
        category: z.enum(['new-opportunities', 'recurring-opportunities', 'templates', 'english-learning']),
      })
    )
    .query(async ({ input }) => {
      const { category } = input;
      
      // Map dashboard category to database category value
      let dbCategory: string;
      switch (category) {
        case 'new-opportunities':
          dbCategory = 'new_opportunities';
          break;
        case 'recurring-opportunities':
          dbCategory = 'recurring_opportunities';
          break;
        case 'templates':
          dbCategory = 'templates';
          break;
        case 'english-learning':
          dbCategory = 'english_language_learning';
          break;
        default:
          dbCategory = 'new_opportunities';
      }

      const resources = await prisma.resources.findMany({
        where: {
          category: dbCategory,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      // Convert BigInt IDs to strings and format dates
      return resources.map(resource => ({
        ...resource,
        id: resource.id.toString(),
        opportunity_deadline: resource.opportunity_deadline ? resource.opportunity_deadline.toISOString().split('T')[0] : null,
        created_at: resource.created_at?.toISOString() || null,
        updated_at: resource.updated_at?.toISOString() || null,
      }));
    }),
});
