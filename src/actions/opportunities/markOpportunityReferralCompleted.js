"use server"
import { createClient } from '@supabase/supabase-js';

export async function markOpportunityReferralCompleted(referral_id){
  console.log('🔍 Server action: markOpportunityReferralCompleted called with referral_id:', referral_id);
  try{
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('🔍 Server action: Updating opportunity_referrals table...');
    const {data, error} = await supabase.from('opportunity_referrals').update({
      has_completed: true,
      completed_at: new Date()
    }).eq('id', referral_id);

    if(error){
      console.error('❌ Server action: Database error:', error);
      return {
        success: false,
        message: error.message,
      }
    }
    console.log('🔍 Server action: Successfully updated referral in database');
    return {
      success: true,
      message: 'Opportunity referral marked as completed',
    }
  }catch(error){
    console.error('Error marking opportunity referral as completed:', error);
    return {
      success: false,
      message: 'Error marking opportunity referral as completed',
    }
  }
} 