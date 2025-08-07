"use server"
import { createClient } from '@supabase/supabase-js';

export async function changeReferStatus(essay_id){
  try{
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const {data, error} = await supabase.from('essay_requests').update({
      referred: 'TRUE'
    }).eq('id', essay_id);

    if(error){
      return {
        success: false,
        message: error.message,
      }
    }
    return {
      success: true,
      message: 'Essay referred successfully',
    }
  }catch(error){
    console.error('Error referring essay:', error);
    return {
      success: false,
      message: 'Error referring essay',
    }
  }
}