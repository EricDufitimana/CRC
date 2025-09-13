"use server"
import { createClient } from '@supabase/supabase-js';

export async function deferOpportunityTo(opportunity_id, from_admin_id, to_admin_id) {
  
  try{
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY 
    );
    
    // Insert the referral record
    const {data, error} = await supabase.from('opportunity_referrals').insert({
      opportunity_id: opportunity_id,
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
    
    // Send referral emails
    try {
      console.log('🔍 Sending referral emails for opportunity:', opportunity_id);
      
      // Fetch opportunity details
      const { data: opportunity, error: oppError } = await supabase
        .from('opportunities')
        .select('title, description, student_id')
        .eq('id', opportunity_id)
        .single();
      
      if (oppError) {
        console.error('❌ Error fetching opportunity details:', oppError);
      } else {
        // Fetch admin details
        const { data: fromAdmin, error: fromAdminError } = await supabase
          .from('admin')
          .select('honorific, first_name, last_name')
          .eq('id', from_admin_id)
          .single();
        
        const { data: toAdmin, error: toAdminError } = await supabase
          .from('admin')
          .select('honorific, first_name, last_name, email')
          .eq('id', to_admin_id)
          .single();
        
        // Fetch student details
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('first_name, last_name, email')
          .eq('id', opportunity.student_id)
          .single();
        
        if (!fromAdminError && !toAdminError && !studentError) {
          // Construct admin names
          const fromAdminName = `${fromAdmin.honorific || ''} ${fromAdmin.first_name || ''} ${fromAdmin.last_name || ''}`.trim();
          const toAdminName = `${toAdmin.honorific || ''} ${toAdmin.first_name || ''} ${toAdmin.last_name || ''}`.trim();
          const studentName = `${student.first_name || ''} ${student.last_name || ''}`.trim();
          
          const dashboardLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/admin/opportunity-tracker`;
          
          console.log('🔍 Email parameters:', {
            fromAdminName,
            toAdminName,
            studentName,
            opportunityTitle: opportunity.title,
            dashboardLink
          });
          
          // Send email to the admin being referred (Template 15)
          if (toAdmin.email) {
            const adminEmailResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send_opportunity_emails`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
              },
              body: JSON.stringify({
                templateId: 15,
                recipient_email: toAdmin.email,
                to_admin_name: toAdminName,
                opportunity_title: opportunity.title,
                student_name: studentName,
                by_admin_name: fromAdminName,
                dashboard_link: dashboardLink
              })
            });
            
            if (adminEmailResponse.ok) {
              console.log('✅ Referral email sent to admin successfully');
            } else {
              console.error('❌ Failed to send referral email to admin:', adminEmailResponse.status);
            }
          }
          
          // Send email to the student (Template 14)
          if (student.email) {
            const studentEmailResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send_opportunity_emails`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
              },
              body: JSON.stringify({
                templateId: 14,
                recipient_email: student.email,
                opportunity_title: opportunity.title,
                referred_to_admin_name: toAdminName,
                student_name: studentName
              })
            });
            
            if (studentEmailResponse.ok) {
              console.log('✅ Referral email sent to student successfully');
            } else {
              console.error('❌ Failed to send referral email to student:', studentEmailResponse.status);
            }
          }
        } else {
          console.error('❌ Error fetching admin or student details for emails');
        }
      }
    } catch (emailError) {
      console.error('❌ Error sending referral emails:', emailError);
      // Don't fail the referral if email fails
    }
    
    return {
      success: true,
      message: "Opportunity deferred successfully",
    }
  } catch (error) {
    console.error("Error deferring opportunity:", error);
    return {
      success: false,
      message: "Error deferring opportunity",
    }
  }

} 