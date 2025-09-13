'use server'

import { supabaseAdmin } from '@/lib/supabase-admin'

export async function sendBulkEmails(recipientEmails, subject, content) {
  console.log('[SERVER] sendBulkEmails called with:', {
    recipientCount: recipientEmails?.length || 0,
    subject: subject?.substring(0, 50) + '...',
    contentLength: content?.length || 0,
    sampleEmails: recipientEmails?.slice(0, 3) || []
  });
  
  try {
    console.log('[SERVER] Invoking send_bulk_emails edge function...');
    const { data, error } = await supabaseAdmin.functions.invoke("send_bulk_emails", {
      body: {
        recipient_emails: recipientEmails,
        subject: subject,
        content: content,
      }
    });
    
    console.log('[SERVER] Edge function response:', { data, error });
    
    if (error) {
      console.error('[SERVER] Edge function error:', error);
      throw new Error(error.message);
    }
    
    console.log('[SERVER] Email sent successfully');
    return {
      success: true,
      message: "Email sent successfully",
    }
  } catch (error) {
    console.error("[SERVER] Error sending email:", error);
    return {
      success: false,
      message: "Failed to send email",
    }
  }
} 