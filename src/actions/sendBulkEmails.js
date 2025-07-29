'use server'

import { supabaseAdmin } from '@/lib/supabase-admin'

export async function sendBulkEmails(recipientEmails, subject, content) {
  try {
    const { data, error } = await supabaseAdmin.functions.invoke("send_bulk_emails", {
      body: {
        recipient_emails: recipientEmails,
        subject: subject,
        content: content,
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      success: true,
      message: "Email sent successfully",
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      message: "Failed to send email",
    }
  }
} 