"use server"
import { createClient } from '@supabase/supabase-js';
import { sendEssayReviewDoneEmailServer } from './sendEssayEmail';

export async function markReferralCompleted(referral_id) {
  try {
    console.log('Marking referral as completed:', referral_id);
    const referralIdBigInt = BigInt(referral_id); // Convert to BigInt
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('essay_referrals')
      .update({
        has_completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', referralIdBigInt);

    if (error) {
      console.error('Error marking referral as completed:', error);
      return { success: false, message: error.message };
    }
    console.log('Successfully marked referral as completed');
    return { success: true, data };
  } catch (error) {
    console.error('Error in markReferralCompleted:', error);
    return { success: false, message: error.message };
  }
}

export async function markReferralCompletedByEssayId(essay_id) {
  try {
    console.log('Marking referral as completed by essay ID:', essay_id);
    const essayIdBigInt = BigInt(essay_id); // Convert to BigInt
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // First, get the essay data to fetch admin name and essay title
    const { data: essayData, error: essayError } = await supabase
      .from('essay_requests')
      .select(`
        title,
        admin:admin_id (
          first_name,
          last_name,
          honorific
        )
      `)
      .eq('id', essayIdBigInt)
      .single();

    if (essayError) {
      console.error('Error fetching essay data:', essayError);
      return { success: false, message: essayError.message };
    }

    // Update the referral status
    const { data, error } = await supabase
      .from('essay_referrals')
      .update({
        has_completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('essay_requested_id', essayIdBigInt);

    if (error) {
      console.error('Error marking referral as completed by essay ID:', error);
      return { success: false, message: error.message };
    }

    // Update the essay status to completed
    const { error: essayUpdateError } = await supabase
      .from('essay_requests')
      .update({
        status: 'completed'
      })
      .eq('id', essayIdBigInt);

    if (essayUpdateError) {
      console.error('Error updating essay status:', essayUpdateError);
      return { success: false, message: essayUpdateError.message };
    }

    // Send email notification to student about essay completion
    try {
      const adminName = [
        essayData.admin?.honorific,
        essayData.admin?.first_name,
        essayData.admin?.last_name
      ].filter(Boolean).join(' ');

      // Get student email from the essay data
      const { data: studentData, error: studentError } = await supabase
        .from('essay_requests')
        .select(`
          students:student_id (
            email
          )
        `)
        .eq('id', essayIdBigInt)
        .single();

      if (studentError) {
        console.error('Error fetching student data for email:', studentError);
      } else {
        const studentEmail = studentData.students?.email;
        
        if (studentEmail && adminName && essayData.title) {
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
          console.log('   - Student email exists:', !!studentEmail);
          console.log('   - Admin name exists:', !!adminName);
          console.log('   - Essay title exists:', !!essayData.title);
        }
      }
    } catch (emailError) {
      console.error('❌ Error sending essay review completion notification:', emailError);
    }

    console.log('Successfully marked referral as completed by essay ID and updated essay status');
    return { success: true, data };
  } catch (error) {
    console.error('Error in markReferralCompletedByEssayId:', error);
    return { success: false, message: error.message };
  }
} 