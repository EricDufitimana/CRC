import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const helpRouter = createTRPCRouter({
  sendHelpMessage: baseProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      message: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      try {
        console.log('🚀 [tRPC Help] sendHelpMessage started');
        console.log('📋 Request body:', input);
        
        const { name, email, message } = input;

        // Insert help message into Supabase
        const { data, error } = await supabase
          .from('help_messages')
          .insert([
            {
              name,
              email,
              message,
              created_at: new Date().toISOString(),
            }
          ]);

        if (error) {
          console.error('❌ [tRPC Help] Database error:', error);
          throw new Error('Failed to save help message');
        }

        console.log('✅ [tRPC Help] Help message saved successfully');
        
        return { 
          success: true, 
          message: 'Help message sent successfully' 
        };
      } catch (error) {
        console.error('❌ [tRPC Help] Error:', error);
        throw new Error('Failed to send help message');
      }
    }),
});
