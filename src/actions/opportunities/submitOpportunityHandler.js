"use server"
import {createClient} from "@supabase/supabase-js"

export async function submitOpportunityHandler(prevState, formData) {
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
        title: formData.get('title'),
        description: formData.get('description'),
        deadline: formData.get('deadline') ? new Date(formData.get('deadline')) : null,
        link: formData.get('link'),
      }

      console.log('🔍 Submitting opportunity data:', submissionData);

      // Use Supabase client directly instead of REST API
      const { data: result, error } = await supabase
        .from('opportunities')
        .insert([submissionData])
        .select()
        .single();

      console.log('🔍 Supabase result:', result);
      console.log('🔍 Supabase error:', error);

      if (error) {
        throw new Error(error.message || 'Failed to submit opportunity')
      }

      // Send email notification to admin
      try {
        console.log('🔍 Sending email notification to admin for opportunity submission');
        
        // Fetch admin and student details for email
        const { data: admin, error: adminError } = await supabase
          .from('admin')
          .select('honorific, first_name, last_name, email')
          .eq('id', admin_id)
          .single();
        
        if (adminError) {
          console.error('❌ Error fetching admin details:', adminError);
        } else {
          const { data: student, error: studentError } = await supabase
            .from('students')
            .select('first_name, last_name')
            .eq('id', student_id)
            .single();
          
          if (studentError) {
            console.error('❌ Error fetching student details:', studentError);
          } else {
            // Prepare email parameters
            const adminName = `${admin.honorific || ''} ${admin.first_name || ''} ${admin.last_name || ''}`.trim() || 'CRC Fellow';
            const studentName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student';
            const opportunityTitle = submissionData.title;
            const description = submissionData.description || 'No description provided';
            const dateTime = new Date().toLocaleString();
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
            const dashboardLink = `${baseUrl}/dashboard/admin/opportunity-tracker`;
            
            console.log('🔍 Email parameters:', {
              adminName,
              studentName,
              opportunityTitle,
              description,
              dateTime,
              dashboardLink
            });
            
            // Call the Supabase Edge Function to send email
            const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send_opportunity_emails`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
              },
              body: JSON.stringify({
                templateId: 13,
                recipient_email: admin.email,
                admin_name: adminName,
                student_name: studentName,
                opportunity_title: opportunityTitle,
                description: description,
                date_time: dateTime,
                dashboard_link: dashboardLink
              })
            });
            
            if (emailResponse.ok) {
              console.log('✅ Email notification sent successfully to admin');
            } else {
              console.error('❌ Failed to send email notification:', emailResponse.status);
            }
          }
        }
      } catch (emailError) {
        console.error('❌ Error sending email notification:', emailError);
        // Don't fail the opportunity submission if email fails
      }

      return {
        success: true,
        message: 'Opportunity submitted successfully',
        data: result
      }
    } catch (error) {
      console.error('Opportunity submission error:', error);
      return {
        success: false,
        message: error.message || 'Failed to submit opportunity',
      }
    }
}