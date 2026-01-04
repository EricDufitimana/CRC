import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

export const essayViewRouter = createTRPCRouter({
  updateEssayView: baseProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        console.log('📄 [tRPC Essay View] Updating essay view for ID:', input.id);
        
        // Get the current essay data to check if it's pending
        const currentEssay = await prisma.essay_requests.findUnique({
          where: { id: BigInt(input.id) },
          include: {
            admin: {
              select: {
                first_name: true,
                last_name: true,
                honorific: true,
                email: true
              }
            },
            students: {
              select: {
                first_name: true,
                last_name: true,
                email: true
              }
            }
          }
        });

        if (!currentEssay) {
          throw new Error('Essay not found');
        }

        // Check if status is changing from pending to in_review
        const wasPending = currentEssay.status === 'pending';

        // Update the status
        const updateStatus = await prisma.essay_requests.update({
          where: { id: BigInt(input.id) },
          data: {
            status: "in_review"
          },
        });

        // Send email notification if status changed from pending to in_review
        if (wasPending) {
          console.log('📧 Sending essay review notification...');
          
          try {
            // Prepare admin name and student email
            const adminName = [currentEssay.admin?.honorific, currentEssay.admin?.first_name, currentEssay.admin?.last_name]
              .filter(Boolean)
              .join(' ');
            
            const studentEmail = currentEssay.students?.email;
            
            if (studentEmail && adminName) {
              const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
              );
              
              const emailResult = await supabase.functions.invoke('send_essay_emails', {
                body: {
                  templateId: 7,
                  recipient_email: studentEmail,
                  essay_title: currentEssay.title,
                  admin_name: adminName
                }
              });

              if (!emailResult.error) {
                console.log('✅ Essay review notification sent successfully');
              } else {
                console.error('❌ Failed to send essay review notification:', emailResult.error);
              }
            } else {
              console.log('⚠️ Missing required data for notification:');
              console.log('   - Student email exists:', !!studentEmail);
              console.log('   - Admin name exists:', !!adminName);
            }
          } catch (emailError) {
            console.error('❌ Error sending essay review notification:', emailError);
          }
        }

        return { 
          message: "Essay view updated successfully", 
          id: input.id 
        };
      } catch (error) {
        console.error('❌ [tRPC Essay View] Error:', error);
        throw new Error('Failed to update essay view');
      }
    }),
});
