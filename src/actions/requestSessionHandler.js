"use server"
import {createClient} from "@supabase/supabase-js"

export async function requestSessionHandler(prevState, formData) {
  try{
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get the student_id from formData (passed from the page)
    const student_id = parseInt(formData.get('student_id'));
    if (!student_id) {
      return {
        success: false,
        message: 'Student ID not found',
      }
    }

    // Get the admin_id from the form (CRC Fellow selection)
    const admin_id = parseInt(formData.get('admin_id'));
    if (!admin_id) {
      return {
        success: false,
        message: 'Please select a CRC Fellow',
      }
    }

    const submissionData = {
      student_id: student_id,
      admin_id: admin_id,
      topic: formData.get('topic'),
      description: formData.get('description'),
      requested_date: formData.get('requested_date'),
      requested_time: formData.get('requested_time'),
      session_duration: formData.get('session_duration') || '40_min', // Default to 40_min
    }

    console.log('🔍 Submitting session request data:', submissionData);

    // Use Supabase client directly instead of REST API
    const { data: result, error } = await supabase
      .from('session_requests')
      .insert([submissionData])
      .select()
      .single();

    console.log('🔍 Supabase result:', result);
    console.log('🔍 Supabase error:', error);

    if (error) {
      throw new Error(error.message || 'Failed to submit session request')
    }

    return {
      success: true,
      message: 'Session request submitted successfully',
      data: result
    }
  } catch (error) {
    console.error('Session request submission error:', error);
    return {
      success: false,
      message: error.message || 'Failed to submit session request',
    }
  }
}
