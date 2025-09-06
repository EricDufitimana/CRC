"use server"
import { createClient } from '@supabase/supabase-js';

export async function changeOpportunityReferStatus(opportunity_id){
  try{
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const {data, error} = await supabase.from('opportunities').update({
      referred: 'TRUE'
    }).eq('id', opportunity_id);

    if(error){
      return {
        success: false,
        message: error.message,
      }
    }
    return {
      success: true,
      message: 'Opportunity referred successfully',
    }
  }catch(error){
    console.error('Error referring opportunity:', error);
    return {
      success: false,
      message: 'Error referring opportunity',
    }
  }
} 