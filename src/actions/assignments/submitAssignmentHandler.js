"use server"
import { createClient } from "@supabase/supabase-js";

export async function submitAssignmentHandler(prevState, formData) {
  console.log('🚀 submitAssignmentHandler: Action started');
  console.log('🔍 submitAssignmentHandler: prevState:', prevState);
  console.log('🔍 submitAssignmentHandler: formData entries:', Array.from(formData.entries()));
  
  try {
    console.log('🔍 submitAssignmentHandler: Creating Supabase client...');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    console.log('✅ submitAssignmentHandler: Supabase client created');

    // Extract form data
    const studentId = parseInt(formData.get("student_id"));
    const assignmentId = parseInt(formData.get("assignment_id"));
    const submissionStyle = formData.get("submission_style");
    const googleDocLink = formData.get("google_doc_link");
    const file = formData.get("file");

    console.log('🔍 submitAssignmentHandler: Extracted form data:', {
      studentId,
      assignmentId,
      submissionStyle,
      googleDocLink: googleDocLink ? 'Present' : 'Missing',
      file: file ? {
        name: file.name,
        size: file.size,
        type: file.type
      } : 'Missing'
    });

    // Validate basic data types
    if (isNaN(studentId)) {
      console.error('❌ submitAssignmentHandler: Invalid student ID - not a number:', formData.get("student_id"));
      return { success: false, message: "Invalid student ID format" };
    }
    
    if (isNaN(assignmentId)) {
      console.error('❌ submitAssignmentHandler: Invalid assignment ID - not a number:', formData.get("assignment_id"));
      return { success: false, message: "Invalid assignment ID format" };
    }

    console.log('🔍 submitAssignmentHandler: Fetching student data from database...');
    // Get student name from database
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('first_name, last_name')
      .eq('id', studentId)
      .single();

    if (studentError) {
      console.error('❌ submitAssignmentHandler: Failed to fetch student data:', studentError);
      return { success: false, message: "Failed to fetch student information" };
    }

    console.log('✅ submitAssignmentHandler: Student data fetched:', studentData);
    const studentName = `${studentData.first_name}_${studentData.last_name}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    console.log('🔍 submitAssignmentHandler: Generated student name:', studentName);

    // Validate required fields
    console.log('🔍 submitAssignmentHandler: Validating required fields...');
    if (!studentId) {
      console.error('❌ submitAssignmentHandler: Student ID is missing');
      return { success: false, message: "Student ID not found" };
    }
    if (!assignmentId) {
      console.error('❌ submitAssignmentHandler: Assignment ID is missing');
      return { success: false, message: "Please enter a valid assignment ID" };
    }
    if (submissionStyle === "google_link" && !googleDocLink) {
      console.error('❌ submitAssignmentHandler: Google Doc link is missing for google_link submission');
      return { success: false, message: "Please provide a Google Doc link" };
    }
    if (submissionStyle === "file_upload" && (!file || !file.name)) {
      console.error('❌ submitAssignmentHandler: File is missing for file_upload submission:', file);
      return { success: false, message: "Please attach a file" };
    }
    console.log('✅ submitAssignmentHandler: All required fields validated');

    let fileUploadPath = null;
    let uploadedFileUrl = null;

    // Handle file upload only if submission style is file_upload
    if (submissionStyle === "file_upload" && file) {
      console.log('🔍 submitAssignmentHandler: Processing file upload...');
      try {
        const ext = file.name.split('.').pop() ?? 'bin';
        const key = crypto.randomUUID();
        const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const path = `${studentName}_${studentId}/${assignmentId}/${currentDate}/${key}.${ext}`;

        console.log('🔍 submitAssignmentHandler: File upload details:', {
          originalName: file.name,
          extension: ext,
          generatedKey: key,
          currentDate,
          uploadPath: path,
          fileSize: file.size,
          fileType: file.type
        });

        console.log('🔍 submitAssignmentHandler: Uploading file to Supabase storage...');
        const { error: uploadError } = await supabase.storage
          .from("submissions")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || "application/octet-stream",
          });

        if (uploadError) {
          console.error('❌ submitAssignmentHandler: File upload failed:', uploadError);
          return { success: false, message: uploadError.message || "Upload failed" };
        }

        console.log('✅ submitAssignmentHandler: File uploaded successfully to path:', path);
        fileUploadPath = path;

        // Get public URL
        console.log('🔍 submitAssignmentHandler: Getting public URL for uploaded file...');
        const { data: publicUrlData } = supabase.storage
          .from("submissions")
          .getPublicUrl(path);
        uploadedFileUrl = publicUrlData?.publicUrl || null;
        console.log('✅ submitAssignmentHandler: Public URL generated:', uploadedFileUrl);

      } catch (uploadError) {
        console.error('❌ submitAssignmentHandler: File upload error:', uploadError);
        return { success: false, message: `File upload error: ${uploadError.message}` };
      }
    } else if (submissionStyle === "google_link") {
      console.log('🔍 submitAssignmentHandler: Google link submission - no file upload needed');
    }

    // Prepare submission data
    const submissionData = {
      student_id: studentId,
      assignment_id: assignmentId,
      google_doc_link: submissionStyle === "google_link" ? googleDocLink : null,
      file_upload_link: submissionStyle === "file_upload" ? fileUploadPath : null,
    };

    console.log('🔍 submitAssignmentHandler: Prepared submission data:', submissionData);

    // Insert into database
    console.log('🔍 submitAssignmentHandler: Inserting submission into database...');
    const { data: result, error: dbError } = await supabase
      .from("submissions")
      .insert([submissionData])
      .select()
      .single();

    if (dbError) {
      console.error('❌ submitAssignmentHandler: Database insertion failed:', dbError);
      throw new Error(dbError.message || "Failed to submit assignment");
    }

    console.log('✅ submitAssignmentHandler: Submission inserted into database:', result);
    console.log('🎉 submitAssignmentHandler: Assignment submission completed successfully!');
    
    return { success: true, message: "Assignment submitted", data: result };

  } catch (error) {
    console.error('❌ submitAssignmentHandler: Unexpected error:', error);
    console.error('❌ submitAssignmentHandler: Error stack:', error.stack);
    return { success: false, message: error.message || "Submission failed" };
  }
}

