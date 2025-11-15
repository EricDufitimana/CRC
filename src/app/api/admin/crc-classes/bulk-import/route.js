import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  console.log('🚀 Bulk Import Students API: Starting...');
  
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const classId = formData.get("classId");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!classId) {
      return NextResponse.json({ error: "No class ID provided" }, { status: 400 });
    }

    console.log('📁 File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      classId: classId
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
    
    const edgeFunctionResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/extract_names_ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify(requestPayload)
    });
    
    console.log('📡 Edge function response status:', edgeFunctionResponse.status);

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

    const extractedNames = extractionResult.names || [];
    console.log('📝 Extracted names:', extractedNames.length);

    if (extractedNames.length === 0) {
      return NextResponse.json({ 
        error: "No names found in the document" 
      }, { status: 400 });
    }

    // Find matching students in the database
    console.log('🔍 Finding matching students in database...');
    
    const { data: allStudents, error: studentsError } = await supabase
      .from('students')
      .select('id, first_name, last_name, email, crc_class_id')
      .is('crc_class_id', null); // Only students not already assigned to a class

    if (studentsError) {
      console.error('❌ Error fetching students:', studentsError);
      return NextResponse.json({ 
        error: "Failed to fetch students from database" 
      }, { status: 500 });
    }

    console.log('📊 Total unassigned students:', allStudents.length);

    // Match extracted names with students
    const matchedStudents = [];
    const unmatchedNames = [];

    extractedNames.forEach(extractedName => {
      // Normalize the extracted name to lowercase for comparison
      const normalizedExtractedName = extractedName.trim().toLowerCase();
      
      const foundStudent = allStudents.find(student => {
        // Get first and last names, normalize to lowercase
        const firstName = (student.first_name || '').trim().toLowerCase();
        const lastName = (student.last_name || '').trim().toLowerCase();
        
        // Try both name orders: "FirstName LastName" and "LastName FirstName"
        const fullNameNormal = `${firstName} ${lastName}`.trim();
        const fullNameReversed = `${lastName} ${firstName}`.trim();
        
        // Match if either order matches
        return fullNameNormal === normalizedExtractedName || 
               fullNameReversed === normalizedExtractedName;
      });

      if (foundStudent) {
        matchedStudents.push(foundStudent);
      } else {
        unmatchedNames.push(extractedName);
      }
    });

    console.log('✅ Matched students:', matchedStudents.length);
    console.log('❌ Unmatched names:', unmatchedNames.length);

    if (matchedStudents.length === 0) {
      return NextResponse.json({ 
        error: "No matching students found in the database" 
      }, { status: 400 });
    }

    // Assign students to the class
    console.log('📝 Assigning students to class:', classId);
    
    const studentIds = matchedStudents.map(student => student.id);
    
    const { error: updateError } = await supabase
      .from('students')
      .update({ crc_class_id: parseInt(classId) })
      .in('id', studentIds);

    if (updateError) {
      console.error('❌ Error updating students:', updateError);
      return NextResponse.json({ 
        error: "Failed to assign students to class" 
      }, { status: 500 });
    }

    console.log('✅ Successfully assigned students to class');

    return NextResponse.json({
      success: true,
      totalExtracted: extractedNames.length,
      matchedStudents: matchedStudents.length,
      unmatchedNames: unmatchedNames,
      assignedStudents: matchedStudents.map(s => ({
        id: s.id,
        name: `${s.first_name} ${s.last_name}`.trim(),
        email: s.email
      })),
      processingTime: extractionResult.processingTime,
      extractionMethod: extractionResult.reasoning
    });

  } catch (error) {
    console.error('❌ Bulk import error:', error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
