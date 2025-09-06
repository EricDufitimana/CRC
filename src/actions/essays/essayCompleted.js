"use server"
import { createClient } from '@supabase/supabase-js';
import { sendEssayReviewDoneEmailServer } from './sendEssayEmail';

export async function essayCompleted(essay_id) {
  try{
    console.log('essayCompleted called with essay_id:', essay_id);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Convert string to BigInt for database comparison
    const essayIdBigInt = BigInt(essay_id);
    console.log('Converted to BigInt:', essayIdBigInt);

    // First, get the essay data to fetch admin name, essay title, and student email
    const { data: essayData, error: essayError } = await supabase
      .from('essay_requests')
      .select(`
        title,
        admin:admin_id (
          first_name,
          last_name,
          honorific
        ),
        students:student_id (
          email
        )
      `)
      .eq('id', essayIdBigInt)
      .single();

    if (essayError) {
      console.error('Error fetching essay data:', essayError);
      return {
        success: false,
        message: essayError.message,
      }
    }

    const {data, error} = await supabase.from('essay_requests').update({
      status: 'completed',
      completed_at: new Date()
    }).eq('id', essayIdBigInt);

    console.log('Supabase update result:', { data, error });

    if(error){
      console.error('Supabase error:', error);
      return {
        success: false,
        message: error.message,
      }
    }

    // Send email notification
    try {
      const adminName = [
        essayData.admin?.honorific,
        essayData.admin?.first_name,
        essayData.admin?.last_name
      ].filter(Boolean).join(' ');

      const studentEmail = essayData.students?.email;

      if (adminName && essayData.title && studentEmail) {
        console.log('📧 Sending essay review completion notification...');
        
        const emailResult = await sendEssayReviewDoneEmailServer(
          studentEmail,
          essayData.title,
          adminName
        );

        if (emailResult.success) {
          console.log('✅ Essay review completion notification sent successfully');
        } else {
          console.error('❌ Failed to send essay review completion notification:', emailResult);
        }
      } else {
        console.log('⚠️ Missing required data for notification:');
        console.log('   - Admin name exists:', !!adminName);
        console.log('   - Essay title exists:', !!essayData.title);
        console.log('   - Student email exists:', !!studentEmail);
      }
    } catch (emailError) {
      console.error('❌ Error sending essay review completion notification:', emailError);
    }
    
    console.log('Essay updated successfully:', data);
    return {
      success: true,
      message: "Essay completed successfully",
    }
  } catch (error) {
    console.error("Error completing essay:", error);
    return {
      success: false,
      message: error.message,
    }
  }
}