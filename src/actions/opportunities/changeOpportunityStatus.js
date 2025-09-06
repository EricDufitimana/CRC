"use server"
import { createClient } from '@supabase/supabase-js';

export async function changeOpportunityStatus(opportunityId, newStatus, reason = null) {
  try {
    console.log('changeOpportunityStatus called with:', { opportunityId, newStatus, reason });
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Validate the status value
    const validStatuses = ['pending', 'in_review', 'accepted', 'denied'];
    if (!validStatuses.includes(newStatus)) {
      console.error('Invalid status value:', newStatus);
      return {
        success: false,
        message: `Invalid status value: ${newStatus}. Valid values are: ${validStatuses.join(', ')}`,
      };
    }
    
    console.log('Updating opportunity status to:', newStatus);
    
    const updateData = { status: newStatus };
    
    // Add accepted_at timestamp for accept/deny actions
    if (newStatus === 'accepted' || newStatus === 'denied') {
      updateData.accepted_at = new Date().toISOString();
    }
    
    if (reason !== null) {
      updateData.reason = reason;
    }
    
    const { data, error } = await supabase
      .from('opportunities')
      .update(updateData)
      .eq('id', opportunityId)
      .select();

    if (error) {
      console.error('Supabase error updating opportunity status:', error);
      return {
        success: false,
        message: error.message,
      };
    }

    console.log('Opportunity status updated successfully:', data);
    return {
      success: true,
      message: 'Opportunity status updated successfully',
      data: data
    };
  } catch (error) {
    console.error('Error in changeOpportunityStatus:', error);
    return {
      success: false,
      message: 'Failed to update opportunity status',
    };
  }
} 