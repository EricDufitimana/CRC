/**
 * Utility functions for sending opportunity emails using the unified send_opportunity_emails function
 */

interface EmailParams {
  templateId: number;
  recipient_email: string;
  [key: string]: any;
}

/**
 * Send a new opportunity submission email to admin
 */
export const sendNewOpportunityEmail = async (
  adminEmail: string,
  adminName: string,
  studentName: string,
  opportunityTitle: string,
  description: string,
  dateTime: string,
  dashboardLink: string
) => {
  const params: EmailParams = {
    templateId: 13,
    recipient_email: adminEmail,
    admin_name: adminName,
    student_name: studentName,
    opportunity_title: opportunityTitle,
    description,
    date_time: dateTime,
    dashboard_link: dashboardLink
  };

  return await sendOpportunityEmail(params);
};

/**
 * Send opportunity referred email to admin being referred to
 */
export const sendOpportunityReferredAdminEmail = async (
  adminEmail: string,
  toAdminName: string,
  opportunityTitle: string,
  studentName: string,
  byAdminName: string,
  dashboardLink: string
) => {
  const params: EmailParams = {
    templateId: 15,
    recipient_email: adminEmail,
    to_admin_name: toAdminName,
    opportunity_title: opportunityTitle,
    student_name: studentName,
    by_admin_name: byAdminName,
    dashboard_link: dashboardLink
  };

  return await sendOpportunityEmail(params);
};

/**
 * Send opportunity referred email to student
 */
export const sendOpportunityReferredStudentEmail = async (
  studentEmail: string,
  opportunityTitle: string,
  referredToAdminName: string
) => {
  const params: EmailParams = {
    templateId: 14,
    recipient_email: studentEmail,
    opportunity_title: opportunityTitle,
    referred_to_admin_name: referredToAdminName
  };

  return await sendOpportunityEmail(params);
};

/**
 * Send opportunity being reviewed email to student
 */
export const sendOpportunityBeingReviewedEmail = async (
  studentEmail: string,
  opportunityTitle: string
) => {
  const params: EmailParams = {
    templateId: 11,
    recipient_email: studentEmail,
    opportunity_title: opportunityTitle
  };

  return await sendOpportunityEmail(params);
};

/**
 * Send opportunity denied email to student
 */
export const sendOpportunityDeniedEmail = async (
  studentEmail: string,
  opportunityTitle: string,
  reason: string
) => {
  const params: EmailParams = {
    templateId: 16,
    recipient_email: studentEmail,
    opportunity_title: opportunityTitle,
    reason
  };

  return await sendOpportunityEmail(params);
};

/**
 * Send opportunity accepted email to student
 */
export const sendOpportunityAcceptedEmail = async (
  studentEmail: string,
  opportunityTitle: string
) => {
  const params: EmailParams = {
    templateId: 17,
    recipient_email: studentEmail,
    opportunity_title: opportunityTitle
  };

  return await sendOpportunityEmail(params);
};

/**
 * Core function that calls the Supabase Edge Function
 */
const sendOpportunityEmail = async (params: EmailParams) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send_opportunity_emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending opportunity email:', error);
    throw error;
  }
};
