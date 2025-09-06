"use server"
import { createClient } from '@supabase/supabase-js';
import { sendNewEssayForAdminEmailServer } from './sendEssayEmail';

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
        console.error('❌ Essay submission failed:', error);
        throw new Error(error.message || 'Failed to submit essay')
      }

      console.log('✅ Essay submitted successfully to database!');
      console.log('📝 Essay ID:', result.id);
      console.log('📝 Essay Title:', result.title);
      console.log('📝 Student ID:', result.student_id);
      console.log('📝 Admin ID:', result.admin_id);

      console.log('🔍 Fetching admin and student data for email notification...');
      
      // Get admin and student names for email notification
      const { data: adminData, error: adminError } = await supabase
        .from('admin')
        .select('first_name, last_name, honorific, email')
        .eq('id', admin_id)
        .single();

      if (adminError) {
        console.error('❌ Failed to fetch admin data:', adminError);
      } else {
        console.log('✅ Admin data fetched successfully:', adminData);
      }

      const adminEmail = adminData?.email;

      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('first_name, last_name')
        .eq('id', student_id)
        .single();

      if (studentError) {
        console.error('❌ Failed to fetch student data:', studentError);
      } else {
        console.log('✅ Student data fetched successfully:', studentData);
      }

      // Send email notification
      if (adminData && studentData && adminEmail) {
        console.log('📧 Preparing email notification...');
        
        const adminName = [adminData.honorific, adminData.first_name, adminData.last_name]
          .filter(Boolean)
          .join(' ');
        
        const studentName = [studentData.first_name, studentData.last_name]
          .filter(Boolean)
          .join(' ');

        const currentDateTime = new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/admin/essay-requests`;

        console.log('📧 Email details prepared:');
        console.log('   - Admin Name:', adminName);
        console.log('   - Student Name:', studentName);
        console.log('   - Essay Title:', submissionData.title);
        console.log('   - Date/Time:', currentDateTime);
        console.log('   - Admin Email:', adminEmail);
        console.log('   - Dashboard Link:', dashboardLink);

        try {
          console.log('📧 Calling unified essay email function...');
          
          const emailResult = await sendNewEssayForAdminEmailServer(
            adminEmail,
            adminName,
            studentName,
            submissionData.title,
            currentDateTime,
            dashboardLink,
            submissionData.description
          );

          console.log('✅ Essay notification email sent successfully!');
          console.log('📧 Email function response:', emailResult);
        } catch (emailError) {
          console.error('❌ Error sending essay notification email:', emailError);
          console.error('📧 Error stack:', emailError.stack);
        }
      } else {
        console.log('⚠️ Skipping email notification - missing required data');
        console.log('   - Admin data exists:', !!adminData);
        console.log('   - Student data exists:', !!studentData);
        console.log('   - Admin email exists:', !!adminEmail);
      }

      console.log('🎉 Essay submission process completed successfully!');
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