// Complete ASYV Report Card AI Processor - Fixed Version
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// Use consistent npm: imports
// @ts-ignore
import { createClient } from "npm:@supabase/supabase-js@2";
// @ts-ignore
import pdfParse from "npm:pdf-parse";
// @ts-ignore
import * as mammoth from "npm:mammoth";

// Declare Deno for TypeScript
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

console.log("🚀 Function starting up...");

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

console.log("✅ Supabase client initialized");

// Groq implementation for better cost and speed
async function extractAverageWithGroq(text: string): Promise<{ average: number | null, confidence: string, reasoning: string }> {
  console.log('🚀 Calling Groq Llama 3.1 8B to analyze text...');
  console.log('📊 Text length:', text.length);
  
  const systemPrompt = `You are an expert at analyzing ASYV (Agahozo Shalom Youth Village) report cards. 

Extract the MOST RECENT progressive average from this report card text.

CRITICAL PARSING RULES for "PROGRESSIVE AVERAGE" section:

1. CONCATENATED NUMBERS: Numbers like "9290" should be parsed as separate 2-digit averages: "92" and "90"
   - "9290" = 92 (1st term), 90 (2nd term) → return 90
   - "929394" = 92, 93, 94 → return 94

2. SPACE-SEPARATED: Numbers like "92 90" → return 90 (last one)

3. ANNUAL REPORTS: Pattern like "PROGRESSIVE AVERAGE\\n939393939494\\n93" → return 93 (final standalone)

4. VALIDATION: Progressive averages are 2-digit numbers between 40-100

Return ONLY this JSON format:
{
  "average": <number between 40-100 or null>,
  "confidence": "high|medium|low",
  "reasoning": "brief explanation of what you found"
}`;

  try {
    console.log('🔑 Checking for Groq API key...');
    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    
    if (!groqApiKey) {
      console.log('❌ No Groq API key found, trying OpenAI...');
      return await extractAverageWithOpenAI(text);
    }
    
    console.log('✅ Groq API key found');
    console.log('🔗 Making request to Groq API...');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Analyze this ASYV report card and extract the most recent progressive average:\n\n${text}`
          }
        ],
        max_tokens: 200,
        temperature: 0,
        top_p: 1,
        stream: false
      })
    });
    
    console.log('📡 Groq API response status:', response.status);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('❌ Groq API error:', response.status, response.statusText, errorBody);
      
      if (response.status === 429) {
        console.log('⏳ Rate limited, waiting 1 second...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log('🔄 Falling back to OpenAI...');
      return await extractAverageWithOpenAI(text);
    }

    const result = await response.json();
    console.log('🤖 Groq response received');
    
    if (result.choices?.[0]?.message?.content) {
      const aiResponse = result.choices[0].message.content.trim();
      console.log('🤖 Groq response content:', aiResponse);
      
      try {
        let jsonString = aiResponse;
        
        // Extract JSON if wrapped in other text
        const jsonMatch = aiResponse.match(/\{[^{}]*"average"[^{}]*\}/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
        }
        
        // Remove markdown code blocks if present
        jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        const parsedResponse = JSON.parse(jsonString);
        console.log('✅ Parsed Groq response:', parsedResponse);
        
        // Validate the response
        if (parsedResponse.average !== null) {
          const avg = Number(parsedResponse.average);
          if (isNaN(avg) || avg < 40 || avg > 100) {
            console.log('❌ Invalid average value, using fallback');
            return fallbackExtractionFixed(text);
          }
          parsedResponse.average = avg;
        }
        
        return {
          average: parsedResponse.average,
          confidence: parsedResponse.confidence || 'medium',
          reasoning: parsedResponse.reasoning || 'Groq Llama extraction completed'
        };
      } catch (parseError) {
        console.error('❌ Error parsing Groq response:', parseError);
        
        // Try to extract number from free-form text as backup
        const numberMatch = aiResponse.match(/average[^\d]*(\d{2})/i);
        if (numberMatch) {
          const extractedNum = parseInt(numberMatch[1]);
          if (extractedNum >= 40 && extractedNum <= 100) {
            return {
              average: extractedNum,
              confidence: 'low',
              reasoning: `Extracted ${extractedNum} from Groq free-form response`
            };
          }
        }
        
        return fallbackExtractionFixed(text);
      }
    } else {
      console.error('❌ Unexpected Groq response format');
      return fallbackExtractionFixed(text);
    }
    
  } catch (error) {
    console.error('💥 Groq API call failed:', error);
    return fallbackExtractionFixed(text);
  }
}

// OpenAI fallback implementation
async function extractAverageWithOpenAI(text: string): Promise<{ average: number | null, confidence: string, reasoning: string }> {
  console.log('🤖 Calling OpenAI to analyze text...');
  
  const systemPrompt = `You are an expert at analyzing ASYV (Agahozo Shalom Youth Village) report cards. 

CRITICAL PARSING RULES for "PROGRESSIVE AVERAGE" section:

1. CONCATENATED NUMBERS: Numbers like "9290" should be parsed as separate 2-digit averages: "92" and "90"
   - "9290" = 92 (1st term), 90 (2nd term) → return 90
   - "929394" = 92, 93, 94 → return 94

2. SPACE-SEPARATED: Numbers like "92 90" → return 90 (last one)

3. ANNUAL REPORTS: Pattern like "PROGRESSIVE AVERAGE\\n939393939494\\n93" → return 93 (final standalone)

4. VALIDATION: Progressive averages are 2-digit numbers between 40-100

NEVER return single digits or numbers over 100.

Return ONLY valid JSON:
{
  "average": <2-digit number between 40-100 or null>,
  "confidence": "high|medium|low",
  "reasoning": "explain exactly how you parsed the numbers"
}`;

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openaiApiKey) {
      return {
        average: null,
        confidence: 'low',
        reasoning: 'OpenAI API key not configured'
      };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `CRITICAL: Look for "PROGRESSIVE AVERAGE" section and parse the numbers correctly.

For concatenated numbers like "9290", split into pairs: 92, 90. Return the LAST number (90).

Here's the report card text:

${text}`
          }
        ],
        max_tokens: 300,
        temperature: 0,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      return fallbackExtractionFixed(text);
    }

    const result = await response.json();
    
    if (result.choices?.[0]?.message?.content) {
      const aiResponse = result.choices[0].message.content.trim();
      console.log('🤖 OpenAI raw response:', aiResponse);
      
      try {
        const parsedResponse = JSON.parse(aiResponse);
        
        const average = parsedResponse.average;
        if (average !== null) {
          if (typeof average !== 'number' || average < 40 || average > 100) {
            console.log(`❌ Invalid average ${average}, using fallback`);
            return fallbackExtractionFixed(text);
          }
          
          if (average < 10) {
            console.log(`❌ Average ${average} seems too low, using fallback`);
            return fallbackExtractionFixed(text);
          }
        }
        
        return {
          average: parsedResponse.average,
          confidence: parsedResponse.confidence || 'medium',
          reasoning: parsedResponse.reasoning || 'OpenAI extraction completed'
        };
      } catch (parseError) {
        console.error('❌ Error parsing OpenAI response:', parseError);
        return fallbackExtractionFixed(text);
      }
    }
    
    return fallbackExtractionFixed(text);
    
  } catch (error) {
    console.error('💥 OpenAI API call failed:', error);
    return fallbackExtractionFixed(text);
  }
}

// Enhanced fallback extraction specifically for your format
function fallbackExtractionFixed(text: string): { average: number | null, confidence: string, reasoning: string } {
  console.log('🔧 Using FIXED fallback pattern matching...');
  
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  console.log('📊 Looking for PROGRESSIVE AVERAGE section...');
  
  // Find the progressive average section
  const progressiveMatch = normalizedText.match(/PROGRESSIVE\s+AVERAGE\s+(.*?)(?:Class\s+Attendance|KEY|School|$)/i);
  
  if (!progressiveMatch) {
    console.log('❌ No PROGRESSIVE AVERAGE section found');
    return {
      average: null,
      confidence: 'low',
      reasoning: 'No PROGRESSIVE AVERAGE section found in document'
    };
  }
  
  const progressiveSection = progressiveMatch[1].trim();
  console.log('📄 Progressive section found:', `"${progressiveSection}"`);
  
  // Pattern 1: 4-digit concatenated (like "9290")
  if (/^\d{4}$/.test(progressiveSection)) {
    const first = parseInt(progressiveSection.substring(0, 2));
    const second = parseInt(progressiveSection.substring(2, 4));
    
    console.log(`📊 4-digit pattern: ${progressiveSection} → ${first}, ${second}`);
    
    if (first >= 40 && first <= 100 && second >= 40 && second <= 100) {
      return {
        average: second, // Return the most recent (second term)
        confidence: 'high',
        reasoning: `4-digit format "${progressiveSection}" split into terms ${first}, ${second}. Returned most recent: ${second}`
      };
    }
  }
  
  // Pattern 2: 6-digit concatenated (like "929394")
  if (/^\d{6}$/.test(progressiveSection)) {
    const first = parseInt(progressiveSection.substring(0, 2));
    const second = parseInt(progressiveSection.substring(2, 4));
    const third = parseInt(progressiveSection.substring(4, 6));
    
    console.log(`📊 6-digit pattern: ${progressiveSection} → ${first}, ${second}, ${third}`);
    
    if (third >= 40 && third <= 100) {
      return {
        average: third,
        confidence: 'high',
        reasoning: `6-digit format split into terms ${first}, ${second}, ${third}. Returned most recent: ${third}`
      };
    }
  }
  
  // Pattern 3: 8+ digit concatenated followed by final average (annual reports)
  const annualMatch = progressiveSection.match(/(\d{8,})\s+(\d{2})/);
  if (annualMatch) {
    const finalAverage = parseInt(annualMatch[2]);
    if (finalAverage >= 40 && finalAverage <= 100) {
      return {
        average: finalAverage,
        confidence: 'high',
        reasoning: `Annual report format: extracted final average ${finalAverage} after concatenated grades`
      };
    }
  }
  
  // Pattern 4: Space-separated numbers
  const spaceMatch = progressiveSection.match(/(\d{2})\s+(\d{2})/);
  if (spaceMatch) {
    const second = parseInt(spaceMatch[2]);
    if (second >= 40 && second <= 100) {
      return {
        average: second,
        confidence: 'high',
        reasoning: `Space-separated format: returned most recent term ${second}`
      };
    }
  }
  
  // Pattern 5: Single 2-digit number
  const singleMatch = progressiveSection.match(/^\d{2}$/);
  if (singleMatch) {
    const average = parseInt(singleMatch[0]);
    if (average >= 40 && average <= 100) {
      return {
        average: average,
        confidence: 'medium',
        reasoning: `Single average found: ${average}`
      };
    }
  }
  
  console.log('❌ No valid pattern matched');
  return {
    average: null,
    confidence: 'low',
    reasoning: `Could not parse progressive average from: "${progressiveSection}"`
  };
}

// Rate limiter for API calls
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private timeWindow: number;

  constructor(maxRequests: number = 30, timeWindowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.timeWindow - (now - oldestRequest) + 100;
      
      if (waitTime > 0) {
        console.log(`⏳ Rate limiting: waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    this.requests.push(now);
  }
}

const rateLimiter = new RateLimiter(30, 60000);

console.log("✅ All functions loaded, starting server...");

// Main Deno serve function
// @ts-ignore
Deno.serve(async (req) => {
  console.log(`📨 ${req.method} request received`);
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS request');
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    console.log('🚀 ASYV Report Card AI Processor started...');
    
    let body;
    try {
      body = await req.json();
    } catch (jsonError) {
      console.error('❌ Invalid JSON in request body:', jsonError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }
    
    console.log('📨 Request body:', body);
    
    const { filePath, useFallback } = body;
    
    if (!filePath) {
      console.log('❌ Error: No filePath provided');
      return new Response(
        JSON.stringify({ error: "filePath is required" }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }
    
    console.log('📥 Downloading file from storage:', filePath);
    
    // Download file from storage
    const { data, error } = await supabase.storage
      .from("reports")
      .download(filePath);
      
    if (error) {
      console.log('❌ Storage download error:', error);
      return new Response(
        JSON.stringify({ error: `Storage error: ${error.message}` }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }
    
    if (!data) {
      console.log('❌ No data returned from storage');
      return new Response(
        JSON.stringify({ error: "File not found" }),
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }
    
    console.log('🔄 Converting to buffer...');
    const buffer = await data.arrayBuffer();
    const fileName = filePath.toLowerCase();
    let text = "";
    
    console.log('📄 Processing file type:', fileName);
    
    try {
      if (fileName.endsWith(".pdf")) {
        console.log('📑 Processing PDF file...');
        const parsed = await pdfParse(new Uint8Array(buffer));
        text = parsed.text;
        console.log('✅ PDF text extracted, length:', text.length);
      } else if (fileName.endsWith(".docx")) {
        console.log('📄 Processing DOCX file...');
        const result = await mammoth.extractRawText({ buffer: new Uint8Array(buffer) });
        text = result.value;
        console.log('✅ DOCX text extracted, length:', text.length);
      } else {
        console.log('❌ Unsupported file type:', fileName);
        return new Response(
          JSON.stringify({ error: "Unsupported file type. Only PDF and DOCX are supported for ASYV report cards." }),
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          }
        );
      }
    } catch (parseError) {
      console.error('❌ File parsing error:', parseError);
      return new Response(
        JSON.stringify({ 
          error: `Failed to parse ASYV report card: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`,
          extractedText: text || "No text could be extracted from the document"
        }),
        { 
          status: 422,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }
    
    if (!text || text.trim().length === 0) {
      console.log('❌ No text extracted from file');
      return new Response(
        JSON.stringify({ 
          error: "No readable text found in the ASYV report card document",
          extractedText: ""
        }),
        { 
          status: 422,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }
    
    console.log('🔍 Extracting PROGRESSIVE AVERAGE from ASYV report card...');
    
    // Check if this looks like an ASYV report card
    const isAsyvReport = text.includes('AGAHOZO SHALOM YOUTH VILLAGE') || 
                        text.includes('LIQUIDNET FAMILY HIGH SCHOOL') ||
                        text.includes('PROGRESSIVE REPORT CARD');
    
    if (isAsyvReport) {
      console.log('✅ Confirmed: This is an ASYV report card');
    } else {
      console.log('⚠️  Warning: This may not be an ASYV report card format');
    }
    
    console.log('📊 Use fallback flag:', useFallback);
    
    let result;
    
    // Try AI first (unless explicitly requesting fallback)
    if (!useFallback) {
      console.log('🤖 Attempting AI analysis...');
      await rateLimiter.waitIfNeeded();
      result = await extractAverageWithGroq(text);
      
      // If AI fails, use fallback
      if (result.average === null) {
        console.log('🔄 AI failed, switching to fallback...');
        result = fallbackExtractionFixed(text);
        result.reasoning = `AI failed. Used fallback: ${result.reasoning}`;
      }
    } else {
      console.log('🔧 Using fallback method as requested...');
      result = fallbackExtractionFixed(text);
    }
    
    console.log('🎯 Final analysis result:', result);
    
    if (result.average === null) {
      console.log('❌ No average found, returning error response');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Could not extract PROGRESSIVE AVERAGE from the text",
          confidence: result.confidence,
          reasoning: result.reasoning,
          isAsyvFormat: isAsyvReport,
          hint: "Ensure the text contains 'PROGRESSIVE AVERAGE' with numerical values",
          extractedText: text
        }),
        { 
          status: 422,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }
    
    console.log('✅ Success! Returning final response');
    
    return new Response(
      JSON.stringify({ 
        success: true,
        average: result.average,
        confidence: result.confidence,
        reasoning: result.reasoning,
        isAsyvFormat: isAsyvReport,
        method: result.confidence === 'low' ? 'Fallback Pattern Matching' : 'AI + Fallback',
        textLength: text.length,
        extractedText: text
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
    
  } catch (err) {
    console.error('💥 AI Analysis error:', err);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `AI Analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        details: err instanceof Error ? err.stack : 'No stack trace'
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
      }
    );
  }
});

console.log("🎉 Edge function fully loaded and ready!");