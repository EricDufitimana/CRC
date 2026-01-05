import { z } from 'zod';
import { baseProcedure, adminProcedure, createTRPCRouter } from '../init';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const resourcesRouter = createTRPCRouter({
  // Get resources by category (public - only active, or admin - all)
  getByCategory: baseProcedure
    .input(
      z.object({
        category: z.string(),
        includeInactive: z.boolean().optional().default(false),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { category, includeInactive } = input;
      
      // If includeInactive is true, check if user is admin
      // ctx.role can be null for unauthenticated users
      const isAdmin = ctx.role === 'admin';
      const shouldIncludeInactive = includeInactive && isAdmin;

      const where: any = {
        category: category,
      };

      // Only filter by status if not including inactive or if user is not admin
      if (!shouldIncludeInactive) {
        where.status = 'active';
      }

      const resources = await prisma.resources.findMany({
        where,
        orderBy: {
          created_at: 'desc',
        },
      });

      // Convert BigInt IDs to strings
      return resources.map(resource => ({
        ...resource,
        id: resource.id.toString(),
        opportunity_deadline: resource.opportunity_deadline ? resource.opportunity_deadline.toISOString().split('T')[0] : null,
        created_at: resource.created_at?.toISOString() || null,
        updated_at: resource.updated_at?.toISOString() || null,
      }));
    }),

  // Get recent resources (public - only active)
  getRecent: baseProcedure
    .input(
      z.object({
        limit: z.number().optional().default(6),
      }),
    )
    .query(async ({ input }) => {
      const { limit } = input;

      const resources = await prisma.resources.findMany({
        where: {
          status: 'active',
        },
        select: {
          id: true,
          title: true,
          category: true,
          created_at: true,
        },
        orderBy: {
          created_at: 'desc',
        },
        take: limit,
      });

      return resources.map(resource => ({
        ...resource,
        id: resource.id.toString(),
        created_at: resource.created_at?.toISOString() || null,
      }));
    }),

  // Create a new resource (admin only)
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        url: z.string().url(),
        secondary_url: z.string().optional(),
        image_address: z.string().optional(),
        opportunity_deadline: z.string().optional(),
        category: z.string(),
        notifyAllStudents: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { title, description, url, secondary_url, image_address, opportunity_deadline, category, notifyAllStudents } = input;

      // Map dashboard category to database category value
      let dbCategory = category;
      if (category === "new-opportunities") dbCategory = "new_opportunities";
      if (category === "recurring-opportunities") dbCategory = "recurring_opportunities";
      if (category === "english-learning") dbCategory = "english_language_learning";

      const resource = await prisma.resources.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          url: url.trim(),
          secondary_url: secondary_url?.trim() || null,
          image_address: image_address?.trim() || null,
          opportunity_deadline: opportunity_deadline ? new Date(opportunity_deadline) : null,
          category: dbCategory,
          status: 'active',
        },
      });

      // Send notification emails if requested
      if (notifyAllStudents) {
        try {
          // Fetch all student emails from Supabase (since students table is in Supabase)
          const { data: students, error: studentsError } = await supabase
            .from('students')
            .select('id, email');

          if (!studentsError && students && students.length > 0) {
            const studentsWithEmails = students
              .map(student => ({ id: student.id, email: student.email }))
              .filter(student => student.email);

            // Prioritize students with IDs 21-32 for testing
            const priorityStudents = studentsWithEmails.filter(student => 
              student.id >= 21 && student.id <= 32
            );

            const limitedEmails = priorityStudents.map(s => s.email);

            // Map category to actual page URL
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
              (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
            
            let opportunityLink: string;
            switch (dbCategory) {
              case 'new_opportunities':
                opportunityLink = `${baseUrl}/resources/newopportunities`;
                break;
              case 'recurring_opportunities':
                opportunityLink = `${baseUrl}/resources/internships`;
                break;
              case 'templates':
                opportunityLink = `${baseUrl}/resources/templates`;
                break;
              case 'english_language_learning':
                opportunityLink = `${baseUrl}/resources/ell`;
                break;
              default:
                opportunityLink = `${baseUrl}/resources/newopportunities`;
            }

            // Call the edge function to send emails
            await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-new-opportunity-notification`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              },
              body: JSON.stringify({
                opportunityName: title,
                opportunityLink: opportunityLink,
                emails: limitedEmails,
                category: dbCategory
              }),
            });
          }
        } catch (notificationError) {
          // Don't fail the resource creation if notification fails
          console.error("Error sending notifications:", notificationError);
        }
      }

      return {
        ...resource,
        id: resource.id.toString(),
        opportunity_deadline: resource.opportunity_deadline ? resource.opportunity_deadline.toISOString().split('T')[0] : null,
        created_at: resource.created_at?.toISOString() || null,
        updated_at: resource.updated_at?.toISOString() || null,
      };
    }),

  // Update a resource (admin only)
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        url: z.string().url().optional(),
        secondary_url: z.string().optional(),
        image_address: z.string().optional(),
        opportunity_deadline: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;

      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title.trim();
      if (updates.description !== undefined) updateData.description = updates.description.trim();
      if (updates.url !== undefined) updateData.url = updates.url.trim();
      if (updates.secondary_url !== undefined) updateData.secondary_url = updates.secondary_url?.trim() || null;
      if (updates.image_address !== undefined) updateData.image_address = updates.image_address?.trim() || null;
      if (updates.opportunity_deadline !== undefined) {
        updateData.opportunity_deadline = updates.opportunity_deadline ? new Date(updates.opportunity_deadline) : null;
      }

      const resource = await prisma.resources.update({
        where: {
          id: BigInt(id),
        },
        data: updateData,
      });

      return {
        ...resource,
        id: resource.id.toString(),
        opportunity_deadline: resource.opportunity_deadline ? resource.opportunity_deadline.toISOString().split('T')[0] : null,
        created_at: resource.created_at?.toISOString() || null,
        updated_at: resource.updated_at?.toISOString() || null,
      };
    }),

  // Deactivate a resource (set status to inactive) (admin only)
  deactivate: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { id } = input;
      
      await prisma.resources.update({
        where: {
          id: BigInt(id),
        },
        data: {
          status: 'inactive',
        },
      });

      return { success: true };
    }),

  // Reactivate a resource (set status to active) (admin only)
  reactivate: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { id } = input;
      
      await prisma.resources.update({
        where: {
          id: BigInt(id),
        },
        data: {
          status: 'active',
        },
      });

      return { success: true };
    }),

  // Delete a resource permanently (admin only)
  delete: adminProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { id } = input;
      
      await prisma.resources.delete({
        where: {
          id: BigInt(id),
        },
      });

      return { success: true };
    }),
});
