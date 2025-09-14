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
  console.log('🚀 Edge Function: send_help_message started');
  console.log('📋 Request method:', req.method);
  console.log('📋 Request URL:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔧 Handling CORS preflight request');
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    console.log('📥 Parsing request body...');
    const requestBody = await req.json();
    console.log('📋 Raw request body:', JSON.stringify(requestBody, null, 2));
    
    const {message, name, email} = requestBody;
    
    console.log('🔍 Extracted fields:');
    console.log('- name:', name);
    console.log('- email:', email);
    console.log('- message:', message);
    
    if(!message) {
      console.log('❌ Validation failed: message is required');
      return new Response(JSON.stringify({ error: "Message is required" }), { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      });
    }

    if(!name) {
      console.log('❌ Validation failed: name is required');
      return new Response(JSON.stringify({ error: "Name is required" }), { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      });
    }

    if(!email) {
      console.log('❌ Validation failed: email is required');
      return new Response(JSON.stringify({ error: "Email is required" }), { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      });
    }

    console.log('🔧 Checking environment variables...');
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    console.log('- BREVO_API_KEY:', brevoApiKey ? `${brevoApiKey.substring(0, 20)}...` : 'NOT SET');
    
    if(!brevoApiKey) {
      console.log('❌ BREVO_API_KEY is not set');
      return new Response(JSON.stringify({ error: "BREVO_API_KEY is not set" }), { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      });
    }

    console.log('📧 Preparing help support email payload...');
    const emailPayload = {
      sender: {
        name: "CRC Support System",
        email: "streamoviesnetflix@gmail.com",
      },
      to: [{email: "ericdufitimanaasyv@gmail.com"}],
      subject: `Help Request from ${name} - Admin Login Support`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 6px;">
          <h2 style="color: #374151; border-bottom: 1px solid #d1d5db; padding-bottom: 8px; margin-bottom: 20px;">Help Request - Account Access Issue</h2>
          
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 4px; margin: 16px 0; border-left: 3px solid #6b7280;">
            <p style="margin: 4px 0; font-weight: 600; color: #374151;">Priority: High - Account Access Issue</p>
            <p style="margin: 4px 0; color: #6b7280;"><strong>From:</strong> ${name}</p>
            <p style="margin: 4px 0; color: #6b7280;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 4px 0; color: #6b7280;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <h3 style="color: #374151; margin-top: 16px; margin-bottom: 8px;">Message:</h3>
          <div style="background-color: #ffffff; padding: 16px; border: 1px solid #e5e7eb; margin: 8px 0; border-radius: 4px;">
            <p style="margin: 0; line-height: 1.5; color: #374151; white-space: pre-wrap;">${message}</p>
          </div>
          
          <h3 style="color: #374151; margin-top: 16px; margin-bottom: 8px;">Action Required:</h3>
          <ul style="list-style-type: disc; margin-left: 20px; padding-left: 0; color: #6b7280; line-height: 1.5;">
            <li>Investigate the user's issue promptly.</li>
            <li>Respond to the user at ${email} as soon as possible.</li>
            <li>Verify account access if applicable.</li>
          </ul>

          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">This help request was sent from the CRC system.</p>
        </div>
      `,
    };
    console.log('📧 Help support email payload:', JSON.stringify(emailPayload, null, 2));

    console.log('⏳ Sending help support email via Brevo API...');
    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify(emailPayload)
    });

    console.log('📊 Brevo response status:', brevoResponse.status);
    console.log('📊 Brevo response headers:', Object.fromEntries(brevoResponse.headers.entries()));

    const data = await brevoResponse.json();
    console.log('📊 Brevo response data:', JSON.stringify(data, null, 2));

    if(!brevoResponse.ok) {
      console.log('❌ Brevo API returned error');
      return new Response(JSON.stringify({ 
        error: "Failed to send help support email", 
        details: data,
        brevoStatus: brevoResponse.status 
      }), { 
        status: brevoResponse.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      });
    }

    console.log('✅ Help support email sent successfully via Brevo');
    console.log('🎉 Edge Function: send_help_message completed successfully');
    
    return new Response(JSON.stringify({ 
      message: "Help support email sent successfully",
      brevoResponse: data 
    }), { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('💥 Unexpected error in send_help_message edge function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('💥 Error message:', errorMessage);
    console.error('💥 Error stack:', errorStack);
    
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: errorMessage,
      stack: errorStack 
    }), { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send_help_message' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"John Doe","email":"john@example.com","message":"I need help with admin login"}'

*/
