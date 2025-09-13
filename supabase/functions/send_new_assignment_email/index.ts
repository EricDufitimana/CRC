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
  console.log('🚀 Edge Function started - send_new_assignment_email');
  
  try {
    console.log('📥 Parsing request body...');
    const { assignment_title, description, deadline, student_emails, crc_class_name } = await req.json();
    
    console.log('📧 Assignment notification function called with:', { 
      assignment_title, 
      description, 
      deadline, 
      student_emails, 
      crc_class_name 
    });
    
    console.log('🔍 Starting parameter validation...');
    
    // Enhanced parameter validation with detailed logging
    if (!assignment_title) {
      console.error('❌ Missing assignment_title parameter');
      return new Response(JSON.stringify({ 
        error: "assignment_title is required" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    if (!description) {
      console.error('❌ Missing description parameter');
      return new Response(JSON.stringify({ 
        error: "description is required" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    if (!deadline) {
      console.error('❌ Missing deadline parameter');
      return new Response(JSON.stringify({ 
        error: "deadline is required" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    if (!student_emails) {
      console.error('❌ Missing student_emails parameter');
      return new Response(JSON.stringify({ 
        error: "student_emails is required" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    if (!crc_class_name) {
      console.error('❌ Missing crc_class_name parameter');
      return new Response(JSON.stringify({ 
        error: "crc_class_name is required" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log('✅ All required parameters present');

    // Validate that student_emails is an array
    console.log('🔍 Validating student_emails array...');
    console.log('🔍 student_emails type:', typeof student_emails);
    console.log('🔍 student_emails value:', student_emails);
    console.log('🔍 Is Array?', Array.isArray(student_emails));
    
    if (!Array.isArray(student_emails)) {
      console.error('❌ student_emails is not an array:', typeof student_emails);
      return new Response(JSON.stringify({ 
        error: "student_emails must be an array",
        receivedType: typeof student_emails,
        receivedValue: student_emails
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    if (student_emails.length === 0) {
      console.error('❌ student_emails array is empty');
      return new Response(JSON.stringify({ 
        error: "student_emails must be a non-empty array",
        arrayLength: student_emails.length
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Additional validation: check if all emails are strings
    const invalidEmails = student_emails.filter(email => typeof email !== 'string' || !email.trim());
    if (invalidEmails.length > 0) {
      console.error('❌ Found invalid emails:', invalidEmails);
      return new Response(JSON.stringify({ 
        error: "All student emails must be valid strings",
        invalidEmails: invalidEmails
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log('✅ student_emails validation passed:', {
      isArray: Array.isArray(student_emails),
      length: student_emails.length,
      emails: student_emails
    });

    console.log('🔍 Checking environment variables...');
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      console.error('❌ BREVO_API_KEY environment variable not found');
      return new Response(JSON.stringify({ error: "Brevo API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.log('✅ BREVO_API_KEY found (length:', brevoApiKey.length, ')');

    const siteUrl = Deno.env.get("NEXT_PUBLIC_SITE_URL");
    console.log('🔍 Site URL environment variable:', siteUrl || 'NOT_SET');

    // Format deadline for display
    console.log('🔍 Processing deadline...');
    console.log('📅 Raw deadline value:', deadline);
    console.log('📅 Deadline type:', typeof deadline);
    
    let deadlineDate;
    try {
      deadlineDate = new Date(deadline);
      console.log('📅 Parsed deadline date:', deadlineDate);
      console.log('📅 Is valid date:', !isNaN(deadlineDate.getTime()));
    } catch (dateError) {
      console.error('❌ Error parsing deadline:', dateError);
      return new Response(JSON.stringify({ 
        error: "Invalid deadline format" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (isNaN(deadlineDate.getTime())) {
      console.error('❌ Invalid deadline date:', deadline);
      return new Response(JSON.stringify({ 
        error: "Invalid deadline date" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    console.log('📅 Formatted deadline:', formattedDeadline);

    // Prepare email parameters
    const emailParams = {
      assignment_title,
      description,
      deadline: formattedDeadline,
      crc_class_name,
      dashboard_link: `${siteUrl || "http://localhost:3000"}/dashboard/student/cypress/assignments`
    };

    console.log('📧 Email parameters prepared:', emailParams);
    console.log('📧 Recipients count:', student_emails.length);
    console.log('📧 Recipients:', student_emails);

    // Prepare Brevo API request
    const brevoRequest = {
      sender: {
        name: "CRC Admin",
        email: "streamoviesnetflix@gmail.com",
      },
      to: student_emails.map((email: string) => ({ email })),
      templateId: 18, 
      params: emailParams
    };

    console.log('📤 Brevo API request prepared:', JSON.stringify(brevoRequest, null, 2));

    console.log('📤 Sending request to Brevo API...');
    console.log('📤 API URL: https://api.brevo.com/v3/smtp/email');
    console.log('📤 Template ID: 18');
    console.log('📤 Request body size:', JSON.stringify(brevoRequest).length, 'characters');

    // Send email to all students in the group
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify(brevoRequest),
    });
    
    console.log('📥 Brevo API response received');
    console.log('📥 Response status:', res.status);
    console.log('📥 Response status text:', res.statusText);
    console.log('📥 Response headers:', Object.fromEntries(res.headers.entries()));

    let data;
    try {
      data = await res.json();
      console.log('📥 Response data:', data);
    } catch (parseError) {
      console.error('❌ Failed to parse response JSON:', parseError);
      const responseText = await res.text();
      console.log('📥 Raw response text:', responseText);
      
      return new Response(JSON.stringify({ 
        error: "Failed to parse Brevo API response", 
        parseError: parseError instanceof Error ? parseError.message : String(parseError),
        rawResponse: responseText,
        status: res.status,
        statusText: res.statusText
      }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!res.ok) {
      console.error('❌ Brevo API error response:', {
        status: res.status,
        statusText: res.statusText,
        data: data
      });
      return new Response(JSON.stringify({ 
        error: "Failed to send emails", 
        details: data,
        status: res.status,
        statusText: res.statusText
      }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log('✅ Assignment notification emails sent successfully:', data);
    console.log('✅ Response status:', res.status);
    console.log('✅ Response data keys:', Object.keys(data));

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Assignment notification sent to ${student_emails.length} students successfully`,
      assignment_title,
      crc_class_name,
      recipient_count: student_emails.length,
      data: data 
    }), {
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error('❌ Assignment notification function error:', error);
    console.error('❌ Error type:', typeof error);
    
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : {
      name: 'Unknown',
      message: String(error),
      stack: undefined
    };
    
    console.error('❌ Error details:', errorDetails);
    
    return new Response(JSON.stringify({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error),
      errorType: typeof error,
      ...errorDetails
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send_new_assignment_email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"assignment_title":"Essay Writing Assignment","description":"Write a 1000-word essay on climate change","deadline":"2024-12-31T23:59:00.000Z","student_emails":["student1@example.com","student2@example.com"],"crc_class_name":"Senior 4"}'

*/
