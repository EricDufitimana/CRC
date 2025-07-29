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

interface Email {
  recipient_emails: string[];
  subject: string;
  content: string;
}

// @ts-ignore
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
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
    const email: Email = await req.json();
    if(!email.recipient_emails || email.recipient_emails.length === 0) {
      return new Response(JSON.stringify({ error: "Recipient emails are required" }), { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      });
    }
    if(!email.subject || !email.content) {
      return new Response(JSON.stringify({ error: "Subject and content are required" }), { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      });
    }
  const brevoApiKey = Deno.env.get("BREVO_API_KEY");
  if(!brevoApiKey) {
    return new Response(JSON.stringify({ error: "BREVO_API_KEY is not set" }), { status: 500 });
  }


  const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
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
      to: email.recipient_emails.map(email => ({email})),
      subject: email.subject,
      htmlContent: email.content,

    })

  });
  const data = await brevoResponse.json();
  if(!brevoResponse.ok) {
    return new Response(JSON.stringify({ error: "Failed to send email", details: data }), { 
      status: brevoResponse.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });
  }

  return new Response(JSON.stringify({ message: "Email sent successfully" }), { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    }
  });
 } catch (error) {
  return new Response(JSON.stringify({ error: "Internal server error" }), { 
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
