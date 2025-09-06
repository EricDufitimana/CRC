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
    const { opportunityName, opportunityLink, emails: userEmails, category } = await req.json();
    
    if (!opportunityName || !opportunityLink) {
      return new Response(JSON.stringify({ error: "Opportunity name and link are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // If no emails provided, don't send emails
    if (!userEmails || !Array.isArray(userEmails) || userEmails.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No emails provided, skipping email send"
      }), {
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

    // Determine template ID based on category
    let templateId = 4; // Default template for opportunities
    if (category === "templates") {
      templateId = 5; // Template for templates category
    }



    // Send email to all users
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
        to: userEmails.map((email: string) => ({ email })),
        templateId: templateId,
        params: {
          name: opportunityName,
          link: opportunityLink
        }
      }),
    });
    
    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ 
        error: "Failed to send emails", 
        details: data 
      }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Opportunity notification sent to ${userEmails.length} users successfully`,
      data: data 
    }), {
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error) {
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-new-opportunity-notification' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"opportunityName":"Summer Internship","opportunityLink":"http://localhost:3000/opportunities/summer-internship","emails":["student1@example.com","student2@example.com"]}'

*/
