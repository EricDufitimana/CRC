import { TRPCError } from "@trpc/server";
import { adminProcedure, createTRPCRouter } from "../init";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const eventsManagementRouter = createTRPCRouter({
  getEvents: adminProcedure
    .input(z.object({
      category: z.string(),
    }))
    .query(async ({ input }) => {
      const eventType = input.category === "previous-events" ? "previous_events" : "upcoming_events";
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('type', eventType)
        .order('created_at', { ascending: false });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),

  deleteEvent: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', parseInt(input.id));

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return { success: true };
    }),
});
