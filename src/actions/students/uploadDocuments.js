"use server"
import { createClient } from "@supabase/supabase-js";

export async function uploadStudentDocuments(prevState, formData) {
  console.log('🚀 uploadStudentDocuments: Action started');
  console.log('🔍 uploadStudentDocuments: prevState:', prevState);
  console.log('🔍 uploadStudentDocuments: formData entries:', Array.from(formData.entries()));
  
  try {
    console.log('🔍 uploadStudentDocuments: Creating Supabase client...');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    console.log('✅ uploadStudentDocuments: Supabase client created');

    // Extract form data
    const studentId = parseInt(formData.get("student_id"));
    const userId = formData.get("user_id");
    const academicReportFile = formData.get("academic_report");
    const resumeLink = formData.get("resume_link");

    console.log('🔍 uploadStudentDocuments: Extracted form data:', {
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
      console.error('❌ uploadStudentDocuments: Invalid student ID - not a number:', formData.get("student_id"));
      return { success: false, message: "Invalid student ID format" };
    }

    console.log('🔍 uploadStudentDocuments: Fetching student data from database...');
    // Get student name from database
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('first_name, last_name')
      .eq('id', studentId)
      .single();

    if (studentError || !studentData) {
      console.error('❌ uploadStudentDocuments: Failed to fetch student data:', studentError);
      return { success: false, message: "Student not found" };
    }

    const studentName = `${studentData.first_name}_${studentData.last_name}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    console.log('✅ uploadStudentDocuments: Student data fetched:', { studentName });

    let academicReportPath = null;
    let academicReportUrl = null;

    // Handle academic report file upload if provided
    if (academicReportFile && academicReportFile.name) {
      console.log('🔍 uploadStudentDocuments: Processing academic report upload...');
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

        const ext = academicReportFile.name.split('.').pop() ?? 'pdf';
        const key = crypto.randomUUID();
        const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const path = `${studentName}_${studentId}/academic_reports/${currentDate}/${key}.${ext}`;

        console.log('🔍 uploadStudentDocuments: Academic report upload details:', {
          originalName: academicReportFile.name,
          extension: ext,
          generatedKey: key,
          currentDate,
          uploadPath: path,
          fileSize: academicReportFile.size,
          fileType: academicReportFile.type
        });

        console.log('🔍 uploadStudentDocuments: Uploading academic report to Supabase storage...');
        const { error: uploadError } = await supabase.storage
          .from("reports")
          .upload(path, academicReportFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: academicReportFile.type || "application/pdf",
          });

        if (uploadError) {
          console.error('❌ uploadStudentDocuments: Academic report upload failed:', uploadError);
          return { success: false, message: uploadError.message || "Academic report upload failed" };
        }

        console.log('✅ uploadStudentDocuments: Academic report uploaded successfully to path:', path);
        academicReportPath = path;

        // Get public URL
        console.log('🔍 uploadStudentDocuments: Getting public URL for academic report...');
        const { data: publicUrlData } = supabase.storage
          .from("reports")
          .getPublicUrl(path);
        academicReportUrl = publicUrlData?.publicUrl || null;
        console.log('✅ uploadStudentDocuments: Academic report public URL generated:', academicReportUrl);

      } catch (uploadError) {
        console.error('❌ uploadStudentDocuments: Academic report upload error:', uploadError);
        return { success: false, message: uploadError.message || "Academic report upload failed" };
      }
    }

    // Update student record with the new data
    console.log('🔍 uploadStudentDocuments: Updating student record...');
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
        console.error('❌ uploadStudentDocuments: Failed to update student record:', updateError);
        return { success: false, message: "Failed to update student record" };
      }

      console.log('✅ uploadStudentDocuments: Student record updated successfully');
    }

    console.log('✅ uploadStudentDocuments: Action completed successfully');
    return { 
      success: true, 
      message: "Documents uploaded successfully",
      data: {
        academicReportPath,
        academicReportUrl,
        resumeLink: resumeLink?.trim() || null
      }
    };

  } catch (error) {
    console.error('❌ uploadStudentDocuments: Unexpected error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}
