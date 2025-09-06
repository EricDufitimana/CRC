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
  console.log('🚀 Edge Function: send_message started');
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

    console.log('📧 Preparing email payload...');
    const emailPayload = {
      sender: {
        name: "CRC Admin",
        email: "streamoviesnetflix@gmail.com",
      },
      to: [{email: "ericdufitimanaasyv@gmail.com"}],
      subject: `Contact Form Message from ${name}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">New Contact Form Submission</h2>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          </div>
          
          <h3 style="color: #333; margin-top: 20px;">Message:</h3>
          <div style="background-color: #fff; padding: 15px; border-left: 4px solid #4CAF50; margin: 10px 0;">
            <p style="margin: 0; line-height: 1.6;">${message}</p>
          </div>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">This message was sent from the CRC website contact form.</p>
        </div>
      `,
    };
    console.log('📧 Email payload:', JSON.stringify(emailPayload, null, 2));

    console.log('⏳ Sending email via Brevo API...');
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
        error: "Failed to send email", 
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

    console.log('✅ Email sent successfully via Brevo');
    console.log('🎉 Edge Function: send_message completed successfully');
    
    return new Response(JSON.stringify({ 
      message: "Email sent successfully",
      brevoResponse: data 
    }), { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('💥 Unexpected error in send_message edge function:', error);
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send_bulk_emails' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
