'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function sendEssayEmailServer(
  recipientEmail: string,
  templateId: number,
  params: Record<string, any>
) {
  try {
    console.log('📧 Sending essay email:', { recipientEmail, templateId, params });
    
    const response = await supabase.functions.invoke('send_essay_emails', {
      body: {
        templateId,
        recipient_email: recipientEmail,
        ...params
      }
    });

    if (response.error) {
      console.error('❌ Essay email function error:', response.error);
      throw new Error(`Failed to send essay email: ${response.error.message}`);
    }

    console.log('✅ Essay email sent successfully:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Error sending essay email:', error);
    throw error;
  }
}

// Helper functions for specific essay email types
export async function sendNewEssayForAdminEmailServer(
  adminEmail: string,
  adminName: string,
  studentName: string,
  essayTitle: string,
  dateTime: string,
  dashboardLink: string,
  description: string
) {
  return sendEssayEmailServer(adminEmail, 6, {
    admin_name: adminName,
    student_name: studentName,
    essay_title: essayTitle,
    date_time: dateTime,
    dashboard_link: dashboardLink,
    description
  });
}

export async function sendEssayBeingReviewedEmailServer(
  studentEmail: string,
  essayTitle: string,
  adminName: string
) {
  return sendEssayEmailServer(studentEmail, 7, {
    essay_title: essayTitle,
    admin_name: adminName
  });
}

export async function sendEssayReviewDoneEmailServer(
  studentEmail: string,
  essayTitle: string,
  adminName: string
) {
  return sendEssayEmailServer(studentEmail, 8, {
    essay_title: essayTitle,
    admin_name: adminName
  });
}

export async function sendEssayReferredStudentEmailServer(
  studentEmail: string,
  essayTitle: string,
  toAdmin: string,
  byAdmin: string
) {
  return sendEssayEmailServer(studentEmail, 9, {
    essay_title: essayTitle,
    to_admin: toAdmin,
    by_admin: byAdmin
  });
}

export async function sendEssayReferredAdminEmailServer(
  adminEmail: string,
  essayTitle: string,
  adminName: string,
  dashboardLink: string
) {
  return sendEssayEmailServer(adminEmail, 10, {
    essay_title: essayTitle,
    admin_name: adminName,
    dashboard_link: dashboardLink
  });
}
