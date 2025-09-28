import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  console.log('🚀 Simple Document Upload API: Starting...');
  
  try {
    const formData = await request.formData();
    const studentId = parseInt(formData.get("student_id"));
    const userId = formData.get("user_id");
    const academicReportFile = formData.get("academic_report");
    const resumeLink = formData.get("resume_link");

    console.log('🔍 Simple Document Upload API: Extracted form data:', {
      studentId,
      userId: userId ? 'Present' : 'Missing',
      academicReportFile: academicReportFile ? {
        name: academicReportFile.name,
        size: academicReportFile.size,
        type: academicReportFile.type
      } : 'Missing',
      resumeLink: resumeLink ? 'Present' : 'Missing'
    });

    // Validate basic data types
    if (isNaN(studentId)) {
      console.error('❌ Simple Document Upload API: Invalid student ID');
      return NextResponse.json({ error: "Invalid student ID format" }, { status: 400 });
    }

    // Get student data
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('first_name, last_name')
      .eq('id', studentId)
      .single();

    if (studentError || !studentData) {
      console.error('❌ Simple Document Upload API: Student not found:', studentError);
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const studentName = `${studentData.first_name}_${studentData.last_name}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    console.log('✅ Simple Document Upload API: Student data fetched:', { studentName });

    let academicReportPath = null;
    let academicReportUrl = null;

    // Handle academic report file upload if provided
    if (academicReportFile && academicReportFile.name) {
      console.log('🔍 Simple Document Upload API: Processing academic report upload...');
      try {
        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(academicReportFile.type)) {
          throw new Error('Only PDF and DOC files are allowed for academic reports');
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (academicReportFile.size > maxSize) {
          throw new Error('File size must be less than 5MB');
        }

        // Use original filename
        const originalFileName = academicReportFile.name;
        const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const path = `${studentName}_${studentId}/academic_reports/${currentDate}/${originalFileName}`;

        console.log('🔍 Simple Document Upload API: Academic report upload details:', {
          originalName: academicReportFile.name,
          currentDate,
          uploadPath: path,
          fileSize: academicReportFile.size,
          fileType: academicReportFile.type
        });

        console.log('🔍 Simple Document Upload API: Uploading academic report to Supabase storage...');
        const { error: uploadError } = await supabase.storage
          .from("reports")
          .upload(path, academicReportFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: academicReportFile.type || "application/pdf",
          });

        if (uploadError) {
          console.error('❌ Simple Document Upload API: Academic report upload failed:', uploadError);
          return NextResponse.json({ error: uploadError.message || "Academic report upload failed" }, { status: 400 });
        }

        console.log('✅ Simple Document Upload API: Academic report uploaded successfully to path:', path);
        academicReportPath = path;

        // Get public URL
        console.log('🔍 Simple Document Upload API: Getting public URL for academic report...');
        const { data: publicUrlData } = supabase.storage
          .from("reports")
          .getPublicUrl(path);
        academicReportUrl = publicUrlData?.publicUrl || null;
        console.log('✅ Simple Document Upload API: Academic report public URL generated:', academicReportUrl);

      } catch (uploadError) {
        console.error('❌ Simple Document Upload API: Academic report upload error:', uploadError);
        return NextResponse.json({ error: uploadError.message || "Academic report upload failed" }, { status: 400 });
      }
    }

    // Update student record with the new data
    console.log('🔍 Simple Document Upload API: Updating student record...');
    const updateData = {};
    
    if (academicReportPath) {
      updateData.academic_report_path = academicReportPath;
    }
    
    if (resumeLink && resumeLink.trim()) {
      updateData.resume_link = resumeLink.trim();
    }

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', studentId);

      if (updateError) {
        console.error('❌ Simple Document Upload API: Failed to update student record:', updateError);
        return NextResponse.json({ error: "Failed to update student record" }, { status: 500 });
      }

      console.log('✅ Simple Document Upload API: Student record updated successfully');
    }

    console.log('✅ Simple Document Upload API: Action completed successfully');
    return NextResponse.json({ 
      success: true, 
      message: "Documents uploaded successfully",
      data: {
        academicReportPath,
        academicReportUrl,
        resumeLink: resumeLink?.trim() || null
      }
    });

  } catch (error) {
    console.error('❌ Simple Document Upload API: Unexpected error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "An unexpected error occurred" 
    }, { status: 500 });
  }
}

