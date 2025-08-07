"use server"
import { createClient } from '@supabase/supabase-js';

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