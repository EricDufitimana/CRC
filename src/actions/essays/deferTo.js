"use server"
import { createClient } from '@supabase/supabase-js';
import { sendEssayReferredStudentEmailServer, sendEssayReferredAdminEmailServer } from './sendEssayEmail';

export async function deferTo(essay_id, from_admin_id, to_admin_id) {
  
  try{
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY 
    );

    // First, get the essay data and admin information
    const { data: essayData, error: essayError } = await supabase
      .from('essay_requests')
      .select(`
        title,
        students:student_id (
          email
        )
      `)
      .eq('id', BigInt(essay_id))
      .single();

    if (essayError) {
      console.error('Error fetching essay data:', essayError);
      return {
        success: false,
        message: essayError.message,
      }
    }

    // Get the admin names and emails
    const { data: fromAdminData, error: fromAdminError } = await supabase
      .from('admin')
      .select('first_name, last_name, honorific')
      .eq('id', BigInt(from_admin_id))
      .single();

    if (fromAdminError) {
      console.error('Error fetching from admin data:', fromAdminError);
      return {
        success: false,
        message: fromAdminError.message,
      }
    }

    const { data: toAdminData, error: toAdminError } = await supabase
      .from('admin')
      .select('first_name, last_name, honorific, email')
      .eq('id', BigInt(to_admin_id))
      .single();

    if (toAdminError) {
      console.error('Error fetching to admin data:', toAdminError);
      return {
        success: false,
        message: toAdminError.message,
      }
    }

    // Insert the referral
    const {data, error} = await supabase.from('essay_referrals').insert({
      essay_requested_id: essay_id,
      from_admin_id: from_admin_id,
      to_admin_id: to_admin_id,
      referred_at: new Date()
    });

    if(error){
      return {
        success: false,
        message: error.message,
      }
    }

    // Send email notification to student
    try {
      const studentEmail = essayData.students?.email;
      const byAdmin = [fromAdminData.honorific, fromAdminData.first_name, fromAdminData.last_name].filter(Boolean).join(' ');
      const toAdmin = [toAdminData.honorific, toAdminData.first_name, toAdminData.last_name].filter(Boolean).join(' ');

      if (studentEmail && byAdmin && toAdmin && essayData.title) {
        console.log('📧 Sending essay referral notification to student...');
        
        const emailResult = await sendEssayReferredStudentEmailServer(
          studentEmail,
          essayData.title,
          toAdmin,
          byAdmin
        );

        if (emailResult.success) {
          console.log('✅ Essay referral notification sent successfully to student');
        } else {
          console.error('❌ Failed to send essay referral notification:', emailResult);
        }
      } else {
        console.log('⚠️ Missing required data for notification:');
        console.log('   - Student email exists:', !!studentEmail);
        console.log('   - By admin name exists:', !!byAdmin);
        console.log('   - To admin name exists:', !!toAdmin);
        console.log('   - Essay title exists:', !!essayData.title);
      }
    } catch (emailError) {
      console.error('❌ Error sending essay referral notification:', emailError);
    }

    // Send email notification to receiving admin
    try {
      const toAdmin = [toAdminData.honorific, toAdminData.first_name, toAdminData.last_name].filter(Boolean).join(' ');
      const toAdminEmail = toAdminData.email;
      const dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/admin/essay-requests`;

      if (toAdmin && essayData.title && toAdminEmail) {
        console.log('📧 Sending essay referral notification to receiving admin...');
        
        const emailResult = await sendEssayReferredAdminEmailServer(
          toAdminEmail,
          essayData.title,
          toAdmin,
          dashboardLink
        );

        if (emailResult.success) {
          console.log('✅ Essay referral notification sent successfully to receiving admin');
        } else {
          console.error('❌ Failed to send essay referral notification to admin:', emailResult);
        }
      } else {
        console.log('⚠️ Missing required data for admin notification:');
        console.log('   - To admin name exists:', !!toAdmin);
        console.log('   - Essay title exists:', !!essayData.title);
        console.log('   - To admin email exists:', !!toAdminEmail);
      }
    } catch (emailError) {
      console.error('❌ Error sending essay referral notification to admin:', emailError);
    }

    return {
      success: true,
      message: "Essay deferred successfully",
    }
  } catch (error) {
    console.error("Error deferring essay:", error);
    return {
      success: false,
      message: "Error deferring essay",
    }
  }

}