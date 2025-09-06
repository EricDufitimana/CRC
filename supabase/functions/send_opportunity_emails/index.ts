// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// @ts-ignore
serve(async (req) => {
  try {
    const { 
      templateId, 
      admin_name, 
      student_name, 
      opportunity_title, 
      description, 
      date_time, 
      dashboard_link,
      to_admin_name,
      by_admin_name,
      referred_to_admin_name,
      reason,
      recipient_email
    } = await req.json();
    
    console.log("Received request with templateId:", templateId, "and params:", {
      admin_name, 
      student_name, 
      opportunity_title, 
      description, 
      date_time, 
      dashboard_link,
      to_admin_name,
      by_admin_name,
      referred_to_admin_name,
      reason,
      recipient_email
    });
    
    // Validate required parameters based on template ID
    let requiredParams = [];
    let emailParams = {};
    
    switch (templateId) {
      case 13: // New Opportunity Submission
        requiredParams = ['admin_name', 'student_name', 'opportunity_title', 'description', 'date_time', 'dashboard_link', 'recipient_email'];
        emailParams = {
          admin_name,
          student_name,
          opportunity_title,
          description,
          date_time,
          dashboard_link
        };
        break;
        
      case 15: // Opportunity Referred (admin)
        requiredParams = ['to_admin_name', 'opportunity_title', 'student_name', 'by_admin_name', 'dashboard_link', 'recipient_email'];
        emailParams = {
          to_admin_name,
          opportunity_title,
          student_name,
          by_admin_name,
          dashboard_link
        };
        break;
        
      case 14: // Opportunity Referred (student)
        requiredParams = ['opportunity_title', 'referred_to_admin_name', 'student_name', 'recipient_email'];
        emailParams = {
          opportunity_title,
          referred_to_admin_name,
          student_name
        };
        break;
        
      case 11: // Opportunity Being Reviewed
        requiredParams = ['opportunity_title', 'student_name', 'recipient_email'];
        emailParams = {
          opportunity_title,
          student_name
        };
        break;
        
      case 16: // Opportunity Denied
        requiredParams = ['opportunity_title', 'reason', 'student_name', 'recipient_email'];
        emailParams = {
          opportunity_title,
          reason,
          student_name
        };
        break;
        
      case 17: // Opportunity Accepted
        requiredParams = ['opportunity_title', 'student_name', 'recipient_email'];
        emailParams = {
          opportunity_title,
          student_name
        };
        break;
        
      default:
        return new Response(JSON.stringify({ error: "Invalid template ID. Supported IDs: 11, 13, 14, 15, 16, 17" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
    }
    
    // Check if all required parameters are provided
    const receivedParams = {
      admin_name, 
      student_name, 
      opportunity_title, 
      description, 
      date_time, 
      dashboard_link,
      to_admin_name,
      by_admin_name,
      referred_to_admin_name,
      reason,
      recipient_email
    };
    
    const missingParams = requiredParams.filter(param => !receivedParams[param as keyof typeof receivedParams]);
    if (missingParams.length > 0) {
      console.error("Missing required parameters:", missingParams);
      console.error("Received params:", receivedParams);
      return new Response(JSON.stringify({ 
        error: `Missing required parameters: ${missingParams.join(', ')}`,
        requiredParams,
        receivedParams: Object.keys(receivedParams).filter(key => receivedParams[key as keyof typeof receivedParams])
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      console.error("BREVO_API_KEY environment variable is not set");
      return new Response(JSON.stringify({ error: "BREVO_API_KEY environment variable is not set" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Sending email with template ID:", templateId, "to:", recipient_email, "with params:", emailParams);

    // Send email using Brevo API
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "api-key": brevoApiKey 
      },
      body: JSON.stringify({
        sender: { 
          name: "CRC Admin", 
          email: "streamoviesnetflix@gmail.com" 
        },
        to: [{ email: recipient_email }],
        templateId: templateId,
        params: emailParams
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Brevo API error:", errorText);
      return new Response(JSON.stringify({ 
        error: "Failed to send email via Brevo API",
        brevoError: errorText
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await res.json();
    console.log(`Email sent successfully with template ${templateId}:`, result);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email sent successfully",
      templateId,
      recipientEmail: recipient_email
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in send_opportunity_emails:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: "Internal server error", 
      details: errorMessage
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
