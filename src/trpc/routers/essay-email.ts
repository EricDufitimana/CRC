import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const essayEmailRouter = createTRPCRouter({
  sendEssayEmail: baseProcedure
    .input(z.object({
      recipientEmail: z.string().email(),
      templateId: z.number(),
      params: z.record(z.any()),
    }))
    .mutation(async ({ input }) => {
      try {
        console.log('📧 [tRPC Essay Email] Sending essay email:', input);
        
        const response = await supabase.functions.invoke('send_essay_emails', {
          body: {
            templateId: input.templateId,
            recipient_email: input.recipientEmail,
            ...input.params
          }
        });

        if (response.error) {
          console.error('❌ [tRPC Essay Email] Function error:', response.error);
          throw new Error(`Failed to send essay email: ${response.error.message}`);
        }

        console.log('✅ [tRPC Essay Email] Email sent successfully:', response.data);
        return { success: true, data: response.data };
      } catch (error) {
        console.error('❌ [tRPC Essay Email] Error:', error);
        throw new Error(error instanceof Error ? error.message : "Unknown error occurred");
      }
    }),

  // Helper functions for specific essay email types
  sendNewEssayForAdminEmail: baseProcedure
    .input(z.object({
      adminEmail: z.string().email(),
      adminName: z.string(),
      studentName: z.string(),
      essayTitle: z.string(),
      dateTime: z.string(),
      dashboardLink: z.string(),
      description: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await supabase.functions.invoke('send_essay_emails', {
        body: {
          templateId: 6,
          recipient_email: input.adminEmail,
          admin_name: input.adminName,
          student_name: input.studentName,
          essay_title: input.essayTitle,
          date_time: input.dateTime,
          dashboard_link: input.dashboardLink,
          description: input.description
        }
      });
    }),

  sendEssayBeingReviewedEmail: baseProcedure
    .input(z.object({
      studentEmail: z.string().email(),
      essayTitle: z.string(),
      adminName: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await supabase.functions.invoke('send_essay_emails', {
        body: {
          templateId: 7,
          recipient_email: input.studentEmail,
          essay_title: input.essayTitle,
          admin_name: input.adminName
        }
      });
    }),

  sendEssayReviewDoneEmail: baseProcedure
    .input(z.object({
      studentEmail: z.string().email(),
      essayTitle: z.string(),
      adminName: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await supabase.functions.invoke('send_essay_emails', {
        body: {
          templateId: 8,
          recipient_email: input.studentEmail,
          essay_title: input.essayTitle,
          admin_name: input.adminName
        }
      });
    }),

  sendEssayReferredStudentEmail: baseProcedure
    .input(z.object({
      studentEmail: z.string().email(),
      essayTitle: z.string(),
      toAdmin: z.string(),
      byAdmin: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await supabase.functions.invoke('send_essay_emails', {
        body: {
          templateId: 9,
          recipient_email: input.studentEmail,
          essay_title: input.essayTitle,
          to_admin: input.toAdmin,
          by_admin: input.byAdmin
        }
      });
    }),

  sendEssayReferredAdminEmail: baseProcedure
    .input(z.object({
      adminEmail: z.string().email(),
      essayTitle: z.string(),
      adminName: z.string(),
      dashboardLink: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await supabase.functions.invoke('send_essay_emails', {
        body: {
          templateId: 10,
          recipient_email: input.adminEmail,
          essay_title: input.essayTitle,
          admin_name: input.adminName,
          dashboard_link: input.dashboardLink
        }
      });
    }),
});
