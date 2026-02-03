import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 CRC Class Bulk Import API called');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const classId = formData.get('classId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!classId) {
      return NextResponse.json(
        { error: 'No class ID provided' },
        { status: 400 }
      );
    }

    console.log('📄 Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);
    console.log('🎯 Target class ID:', classId);

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/pdf', // .pdf
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'text/plain', // .txt
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload Excel, CSV, PDF, Word, or text files.' },
        { status: 400 }
      );
    }

    // Generate unique file path
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = `crc-class-imports/${fileName}`;

    console.log('📤 Uploading file to storage:', filePath);

    // Upload file to Supabase storage
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('reports')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error('❌ File upload error:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload file: ${uploadError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ File uploaded successfully');

    // Determine file type for the AI function
    let fileType = 'unknown';
    if (file.type.includes('excel') || file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      fileType = 'excel';
    } else if (file.type.includes('csv') || file.name.endsWith('.csv')) {
      fileType = 'csv';
    } else if (file.type.includes('pdf') || file.name.endsWith('.pdf')) {
      fileType = 'pdf';
    } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
      fileType = 'docx';
    } else if (file.type.includes('text') || file.name.endsWith('.txt')) {
      fileType = 'text';
    }

    console.log('🤖 Calling AI to extract names from file type:', fileType);

    // Call the extract_names_ai function
    const extractResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/extract_names_ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        filePath: filePath,
        fileType: fileType
      })
    });

    if (!extractResponse.ok) {
      const errorText = await extractResponse.text();
      console.error('❌ AI extraction error:', errorText);
      
      // Clean up uploaded file
      await supabase.storage.from('reports').remove([filePath]);
      
      return NextResponse.json(
        { error: `Failed to extract names: ${errorText}` },
        { status: 500 }
      );
    }

    const extractResult = await extractResponse.json();
    console.log('📊 AI extraction result:', {
      success: extractResult.success,
      namesCount: extractResult.names?.length || 0,
      confidence: extractResult.confidence,
      reasoning: extractResult.reasoning
    });

    if (!extractResult.success || !extractResult.names || extractResult.names.length === 0) {
      // Clean up uploaded file
      await supabase.storage.from('reports').remove([filePath]);
      
      return NextResponse.json(
        { 
          error: 'No student names found in the file',
          details: extractResult.reasoning || 'Unknown reason'
        },
        { status: 400 }
      );
    }

    console.log('🔍 Matching extracted names with students database...');

    // Get all students to match against
    const allStudents = await prisma.students.findMany({
      select: {
        id: true,
        first_name: true,
        last_name: true,
        student_id: true,
        email: true,
        crc_class_id: true
      }
    });

    console.log('👥 Total students in database:', allStudents.length);

    // Match extracted names with database students
    const matchedStudents: any[] = [];
    const unmatchedNames: string[] = [];

    for (const extractedName of extractResult.names) {
      const normalizedName = extractedName.toLowerCase().trim();
      let matched = false;

      for (const student of allStudents) {
        const studentFullName = `${student.first_name} ${student.last_name}`.toLowerCase();
        const studentReversed = `${student.last_name} ${student.first_name}`.toLowerCase();

        // Try various matching strategies
        if (
          studentFullName === normalizedName ||
          studentReversed === normalizedName ||
          studentFullName.includes(normalizedName) ||
          normalizedName.includes(studentFullName) ||
          studentReversed.includes(normalizedName) ||
          normalizedName.includes(studentReversed)
        ) {
          matchedStudents.push({
            studentId: student.id.toString(),
            name: `${student.first_name} ${student.last_name}`,
            studentIdNumber: student.student_id,
            email: student.email,
            currentClassId: student.crc_class_id?.toString() || null
          });
          matched = true;
          break;
        }
      }

      if (!matched) {
        unmatchedNames.push(extractedName);
      }
    }

    console.log('✅ Matching complete:', {
      totalExtracted: extractResult.names.length,
      matched: matchedStudents.length,
      unmatched: unmatchedNames.length
    });

    // Get class details
    const targetClass = await prisma.crc_class.findUnique({
      where: { id: BigInt(classId) },
      select: {
        id: true,
        name: true,
        grade_group: true
      }
    });

    if (!targetClass) {
      return NextResponse.json(
        { error: 'Target class not found' },
        { status: 404 }
      );
    }

    // Filter out students already in the target class
    const studentsToAdd = matchedStudents.filter(student => student.currentClassId !== classId);
    const alreadyInClass = matchedStudents.filter(student => student.currentClassId === classId);

    console.log('📊 Class assignment analysis:', {
      matchedTotal: matchedStudents.length,
      alreadyInTargetClass: alreadyInClass.length,
      canBeAdded: studentsToAdd.length
    });

    return NextResponse.json({
      success: true,
      extraction: {
        totalNames: extractResult.names.length,
        confidence: extractResult.confidence,
        reasoning: extractResult.reasoning
      },
      matching: {
        matched: matchedStudents.length,
        unmatched: unmatchedNames.length,
        alreadyInClass: alreadyInClass.length,
        canBeAdded: studentsToAdd.length
      },
      data: {
        targetClass: {
          id: targetClass.id.toString(),
          name: targetClass.name,
          grade_group: targetClass.grade_group
        },
        matchedStudents,
        unmatchedNames,
        studentsToAdd,
        alreadyInClass
      }
    });

  } catch (error) {
    console.error('❌ Bulk import error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during bulk import',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
