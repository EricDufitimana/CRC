"use server"
import { createClient } from '@/utils/supabase/server';

export async function markReferralCompleted(referral_id) {
  try {
    console.log('Marking referral as completed:', referral_id);
    const referralIdBigInt = BigInt(referral_id); // Convert to BigInt
    const supabase = await createClient();

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
    console.log('Successfully marked referral as completed by essay ID');
    return { success: true, data };
  } catch (error) {
    console.error('Error in markReferralCompletedByEssayId:', error);
    return { success: false, message: error.message };
  }
} 