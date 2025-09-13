'use server'

import { supabaseAdmin } from '@/lib/supabase-admin'
import MarkdownIt from 'markdown-it'

export async function sendOpportunityEmail(recipientEmail, subject, content, opportunityTitle, studentName, actionType = 'accepted') {
  try {
    console.log('sendOpportunityEmail called with:', { 
      recipientEmail, 
      subject, 
      contentLength: content?.length,
      opportunityTitle, 
      studentName,
      actionType
    });
    
    // Convert markdown to HTML
    const md = new MarkdownIt()
    const htmlContent = md.render(content)
    
    console.log('Markdown converted to HTML, length:', htmlContent.length);
    
    // Create appropriate subject based on action type
    let emailSubject = subject;
    if (!subject) {
      if (actionType === 'accepted') {
        emailSubject = `${opportunityTitle} Opportunity Has Been Found Valid`;
      } else if (actionType === 'denied') {
        emailSubject = `${opportunityTitle} Opportunity Update`;
      }
    }
    
    const { data, error } = await supabaseAdmin.functions.invoke("send_opportunity_accepted", {
      body: {
        recipient_email: recipientEmail,
        subject: emailSubject,
        content: htmlContent,
        opportunity_title: opportunityTitle,
        student_name: studentName
      }
    });
    
    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message);
    }
    
    console.log('Email sent successfully, response:', data);
    return {
      success: true,
      message: "Opportunity email sent successfully",
    }
  } catch (error) {
    console.error("Error sending opportunity email:", error);
    return {
      success: false,
      message: `Failed to send opportunity email: ${error.message}`,
    }
  }
} 