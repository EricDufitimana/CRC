"use server"
import { createClient } from '@supabase/supabase-js';

export async function deferTo(essay_id, from_admin_id, to_admin_id) {
  
  try{
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY 
    );
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