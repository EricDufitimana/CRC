// // Follow this setup guide to integrate the Deno language server with your editor:
// // https://deno.land/manual/getting_started/setup_your_environment
// // This enables autocomplete, go to definition, etc.

// // Setup type definitions for built-in Supabase Runtime APIs
// import "jsr:@supabase/functions-js/edge-runtime.d.ts"
// // @ts-ignore
// import "jsr:@supabase/functions-js/edge-runtime.d.ts"
// import { createClient } from "npm:@supabase/supabase-js@2";
// import pdfParse from "npm:pdf-parse";
// import * as mammoth from "npm:mammoth";
// // Declare Deno for TypeScript
// declare const Deno: {
//   env: {
//     get(key: string): string | undefined;
//   };
// };


// const supabase = createClient(
//   Deno.env.get("SUPABASE_URL")!,
//   Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
// );

// // Helper to extract averages
// function extractMostRecentAverage(text: string): number | null {
//   // Check for Annual Average first
//   const annual = text.match(/ANNUAL\s+AVERAGE\s+(\d+(\.\d+)?)/i);
//   if (annual) return parseFloat(annual[1]);

//   // Check for Progressive Average with up to 3 terms
//   const prog = text.match(
//     /PROGRESSIVE\s+AVERAGE\s+(\d+(\.\d+)?)\s+(\d+(\.\d+)?)(?:\s+(\d+(\.\d+)?))?/i
//   );

//   if (prog) {
//     const numbers: number[] = [];
//     if (prog[1]) numbers.push(parseFloat(prog[1]));
//     if (prog[3]) numbers.push(parseFloat(prog[3]));
//     if (prog[5]) numbers.push(parseFloat(prog[5]));
//     return numbers[numbers.length - 1]; // latest
//   }

//   return null;
// }

// Deno.serve(async (req) => {
//   try {
//     const { studentId, filePath } = await req.json();

//     // Download file from storage
//     const { data, error } = await supabase.storage
//       .from("student-reports")
//       .download(filePath);

//     if (error || !data) {
//       return new Response(
//         JSON.stringify({ error: "Unable to download file" }),
//         { status: 400 }
//       );
//     }

//     const buffer = await data.arrayBuffer();
//     const fileName = filePath.toLowerCase();
//     let text = "";

//     if (fileName.endsWith(".pdf")) {
//       const parsed = await pdfParse(Buffer.from(buffer));
//       text = parsed.text;
//     } else if (fileName.endsWith(".docx")) {
//       const result = await mammoth.extractRawText({ buffer });
//       text = result.value;
//     } else {
//       return new Response(
//         JSON.stringify({ error: "Unsupported file type" }),
//         { status: 400 }
//       );
//     }

//     const recent = extractMostRecentAverage(text);

//     if (recent === null) {
//       return new Response(
//         JSON.stringify({ error: "Could not extract average" }),
//         { status: 422 }
//       );
//     }

//     // Save to Supabase table
//     const { error: updateError } = await supabase
//       .from("students")
//       .update({
//         recent_term_average: recent,
//         report_extracted_text: text,
//       })
//       .eq("id", studentId);

//     if (updateError) throw updateError;

//     return new Response(
//       JSON.stringify({ success: true, average: recent }),
//       { status: 200 }
//     );
//   } catch (err) {
//     return new Response(JSON.stringify({ error: err.message }), {
//       status: 500,
//     });
//   }
// });
