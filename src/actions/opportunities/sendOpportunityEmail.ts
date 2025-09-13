"use server";

import { createClient } from '@supabase/supabase-js';

export async function sendOpportunityEmailServer(
  templateId: number,
  recipientEmail: string,
  params: Record<string, any>
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('Calling send_opportunity_emails function with:', {
      templateId,
      recipientEmail,
      params
    });

    const { data, error } = await supabase.functions.invoke('send_opportunity_emails', {
      body: {
        templateId,
        recipient_email: recipientEmail,
        ...params
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending opportunity email:', error);
    throw error;
  }
}

// Helper functions for specific email types
export async function sendOpportunityBeingReviewedEmailServer(
  studentEmail: string,
  opportunityTitle: string,
  studentName: string
) {
  return await sendOpportunityEmailServer(11, studentEmail, {
    opportunity_title: opportunityTitle,
    student_name: studentName
  });
}

export async function sendOpportunityAcceptedEmailServer(
  studentEmail: string,
  opportunityTitle: string,
  studentName: string
) {
  return await sendOpportunityEmailServer(17, studentEmail, {
    opportunity_title: opportunityTitle,
    student_name: studentName
  });
}

export async function sendOpportunityDeniedEmailServer(
  studentEmail: string,
  opportunityTitle: string,
  reason: string,
  studentName: string
) {
  return await sendOpportunityEmailServer(16, studentEmail, {
    opportunity_title: opportunityTitle,
    reason,
    student_name: studentName
  });
}
