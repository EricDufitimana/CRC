// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Declare Deno for TypeScript
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// @ts-ignore
serve(async (req) => {
  try {
    const { templateId, recipient_email, ...params } = await req.json();
    
    console.log('📧 Essay email function called with:', { templateId, recipient_email, params });
    
    if (!templateId || !recipient_email) {
      return new Response(JSON.stringify({ 
        error: "templateId and recipient_email are required parameters" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      return new Response(JSON.stringify({ error: "Brevo API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate required parameters based on template ID
    let requiredParams: string[] = [];
    let emailParams: any = {};

    switch (templateId) {
      case 6: // New essay for admin
        requiredParams = ['admin_name', 'student_name', 'essay_title', 'date_time', 'dashboard_link', 'description'];
        emailParams = {
          admin_name: params.admin_name,
          student_name: params.student_name,
          essay_title: params.essay_title,
          date_time: params.date_time,
          dashboard_link: params.dashboard_link,
          description: params.description
        };
        break;
      
      case 7: // Essay being reviewed
        requiredParams = ['essay_title', 'admin_name'];
        emailParams = {
          essay_title: params.essay_title,
          admin_name: params.admin_name
        };
        break;
      
      case 8: // Essay review done
        requiredParams = ['essay_title', 'admin_name'];
        emailParams = {
          essay_title: params.essay_title,
          admin_name: params.admin_name
        };
        break;
      
      case 9: // Essay referred (student notification)
        requiredParams = ['essay_title', 'to_admin', 'by_admin'];
        emailParams = {
          essay_title: params.essay_title,
          to_admin: params.to_admin,
          by_admin: params.by_admin
        };
        break;
      
      case 10: // Essay referred (admin notification)
        requiredParams = ['essay_title', 'admin_name', 'dashboard_link'];
        emailParams = {
          essay_title: params.essay_title,
          admin_name: params.admin_name,
          dashboard_link: params.dashboard_link
        };
        break;
      
      default:
        return new Response(JSON.stringify({ 
          error: `Invalid template ID: ${templateId}. Supported IDs: 6, 7, 8, 9, 10` 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
    }

    // Check if all required parameters are present
    const missingParams = requiredParams.filter(param => !params[param]);
    if (missingParams.length > 0) {
      return new Response(JSON.stringify({ 
        error: `Missing required parameters: ${missingParams.join(', ')}`,
        requiredParams,
        receivedParams: Object.keys(params)
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log('📧 Sending email with template ID:', templateId);
    console.log('📧 Email parameters:', emailParams);

    // Send email using Brevo API
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "CRC Admin",
          email: "streamoviesnetflix@gmail.com",
        },
        to: [{ email: recipient_email }],
        templateId: templateId,
        params: emailParams
      }),
    });
    
    const data = await res.json();

    if (!res.ok) {
      console.error('❌ Brevo API error:', data);
      return new Response(JSON.stringify({ 
        error: "Failed to send email", 
        details: data 
      }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log('✅ Email sent successfully:', data);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Essay email sent successfully",
      templateId,
      recipient_email,
      data: data 
    }), {
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error('❌ Essay email function error:', error);
    return new Response(JSON.stringify({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  # Template ID 6: New essay for admin
  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send_essay_emails' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"templateId":6,"recipient_email":"admin@example.com","admin_name":"John Doe","student_name":"Jane Smith","essay_title":"My Essay","date_time":"2024-01-15 14:30","dashboard_link":"http://localhost:3000/dashboard/admin/essay-requests","description":"Essay description"}'

  # Template ID 7: Essay being reviewed
  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send_essay_emails' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"templateId":7,"recipient_email":"student@example.com","essay_title":"My Essay","admin_name":"John Doe"}'

  # Template ID 8: Essay review done
  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send_essay_emails' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"templateId":8,"recipient_email":"student@example.com","essay_title":"My Essay","admin_name":"John Doe"}'

  # Template ID 9: Essay referred (student notification)
  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send_essay_emails' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"templateId":9,"recipient_email":"student@example.com","essay_title":"My Essay","to_admin":"John Doe","by_admin":"Jane Smith"}'

  # Template ID 10: Essay referred (admin notification)
  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send_essay_emails' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"templateId":10,"recipient_email":"admin@example.com","essay_title":"My Essay","admin_name":"John Doe","dashboard_link":"http://localhost:3000/dashboard/admin/essay-requests"}'

*/
