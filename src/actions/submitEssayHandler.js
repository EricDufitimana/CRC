"use server"
import { createClient } from '@supabase/supabase-js';
export async function submitEssayHandler(prevState, formData) {
    try{
      // Get the current user's student ID first
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
        title: formData.get('title'),
        essay_link: formData.get('googleDocsLink'), 
        word_count: parseInt(formData.get('word_count') || '0'),
        description: formData.get('description'),
        deadline: formData.get('deadline') ? new Date(formData.get('deadline')) : null,
      }

      console.log('🔍 Submitting essay data:', submissionData);

      // Use Supabase client directly instead of REST API
      const { data: result, error } = await supabase
        .from('essay_requests')
        .insert([submissionData])
        .select()
        .single();

      console.log('🔍 Supabase result:', result);
      console.log('🔍 Supabase error:', error);

      if (error) {
        throw new Error(error.message || 'Failed to submit essay')
      }

      return {
        success: true,
        message: 'Essay submitted successfully',
        data: result
      }
    } catch (error) {
      console.error('Essay submission error:', error);
      return {
        success: false,
        message: error.message || 'Failed to submit essay',
      }
    }
}