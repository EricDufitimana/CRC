"use server"
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function acceptOpportunityReferral(referralId, reason = null) {
  try {
    console.log('Accepting opportunity referral:', referralId);
    
    // First, get the referral to find the opportunity_id
    const { data: referral, error: referralError } = await supabaseAdmin
      .from('opportunity_referrals')
      .select('opportunity_id')
      .eq('id', referralId)
      .single();

    if (referralError) {
      console.error('Error fetching referral:', referralError);
      throw new Error('Failed to fetch referral');
    }

    console.log('Found referral with opportunity_id:', referral.opportunity_id);

    // Update the referral status
    const { error: referralUpdateError } = await supabaseAdmin
      .from('opportunity_referrals')
      .update({
        status: 'accepted',
        has_completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', referralId);

    if (referralUpdateError) {
      console.error('Error updating referral status:', referralUpdateError);
      throw new Error('Failed to update referral status');
    }

    // Update the opportunity status to accepted
    const { error: opportunityUpdateError } = await supabaseAdmin
      .from('opportunities')
      .update({
        status: 'accepted',
        reason: reason
      })
      .eq('id', referral.opportunity_id);

    if (opportunityUpdateError) {
      console.error('Error updating opportunity status:', opportunityUpdateError);
      throw new Error('Failed to update opportunity status');
    }

    console.log('Successfully accepted opportunity referral and updated opportunity status');
    return { success: true };
  } catch (error) {
    console.error('Error in acceptOpportunityReferral:', error);
    throw error;
  }
} 