import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  console.log('🚀 Bulk Import Names API: Starting...');
  
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log('📁 File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/pdf', // .pdf
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'text/plain' // .txt
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Please upload Excel, CSV, PDF, DOCX, or TXT files." 
      }, { status: 400 });
    }

    // Upload file to Supabase storage
    const fileName = `bulk-import-${Date.now()}-${file.name}`;
    const filePath = `bulk-imports/${fileName}`;

    console.log('📤 Uploading file to storage:', filePath);

    const { error: uploadError } = await supabase.storage
      .from("reports")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    console.log('✅ File uploaded successfully');

    // Call the edge function to extract names
    console.log('🤖 Calling edge function for name extraction...');
    
    const requestPayload = {
      filePath: filePath,
      fileType: file.type
    };
    
    console.log('📤 Request payload:', requestPayload);
    console.log('🔗 Edge function URL:', `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/extract_names_ai`);
    console.log('🔑 Service role key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    const edgeFunctionResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/extract_names_ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify(requestPayload)
    });
    
    console.log('📡 Edge function response status:', edgeFunctionResponse.status);
    console.log('📡 Edge function response headers:', Object.fromEntries(edgeFunctionResponse.headers.entries()));

    if (!edgeFunctionResponse.ok) {
      const errorText = await edgeFunctionResponse.text();
      console.error('❌ Edge function error:', errorText);
      return NextResponse.json({ 
        error: "Failed to extract names from document" 
      }, { status: 500 });
    }

    const responseText = await edgeFunctionResponse.text();
    console.log('📄 Raw response text:', responseText);
    
    let extractionResult;
    try {
      extractionResult = JSON.parse(responseText);
      console.log('📊 Parsed extraction result:', extractionResult);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.log('📄 Raw response that failed to parse:', responseText);
      return NextResponse.json({ 
        error: "Invalid response from edge function" 
      }, { status: 500 });
    }

    if (!extractionResult.success) {
      return NextResponse.json({ 
        error: extractionResult.error || "Failed to extract names" 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      names: extractionResult.names || [],
      method: extractionResult.method || 'AI Name Extraction',
      confidence: extractionResult.confidence,
      reasoning: extractionResult.reasoning,
      totalNames: extractionResult.names?.length || 0,
      processingTime: extractionResult.processingTime,
      extractedData: extractionResult.extractedData
    });

  } catch (error) {
    console.error('❌ Bulk import error:', error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
