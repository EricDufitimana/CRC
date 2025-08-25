"use server"
import { createClient } from "@supabase/supabase-js";

export async function submitAssignmentHandler(prevState, formData) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const studentId = parseInt(formData.get("student_id"));
    const assignmentId = parseInt(formData.get("assignment_id"));
    const submissionStyle = formData.get("submission_style");
    const googleDocLink = formData.get("google_doc_link");
    const file = formData.get("file");

    // Get student name from database
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('first_name, last_name')
      .eq('id', studentId)
      .single();

    if (studentError) {
      return { success: false, message: "Failed to fetch student information" };
    }

    const studentName = `${studentData.first_name}_${studentData.last_name}`.replace(/[^a-zA-Z0-9_-]/g, '_');

    // Validate required fields first
    if (!studentId) {
      return { success: false, message: "Student ID not found" };
    }
    if (!assignmentId) {
      return { success: false, message: "Please enter a valid assignment ID" };
    }
    if (submissionStyle === "google_link" && !googleDocLink) {
      return { success: false, message: "Please provide a Google Doc link" };
    }
    if (submissionStyle === "file_upload" && (!file || !file.name)) {
      return { success: false, message: "Please attach a file" };
    }

    let fileUploadPath = null;
    let uploadedFileUrl = null;

    // Handle file upload only if submission style is file_upload
    if (submissionStyle === "file_upload" && file) {
      try {
        const ext = file.name.split('.').pop() ?? 'bin';
        const key = crypto.randomUUID();
        const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const path = `${studentName}_${studentId}/${assignmentId}/${currentDate}/${key}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("submissions")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || "application/octet-stream",
          });

        if (uploadError) {
          return { success: false, message: uploadError.message || "Upload failed" };
        }

        fileUploadPath = path;

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("submissions")
          .getPublicUrl(path);
        uploadedFileUrl = publicUrlData?.publicUrl || null;

      } catch (uploadError) {
        return { success: false, message: `File upload error: ${uploadError.message}` };
      }
    }

    // Prepare submission data
    const submissionData = {
      student_id: studentId,
      assignment_id: assignmentId,
      google_doc_link: submissionStyle === "google_link" ? googleDocLink : null,
      file_upload_link: submissionStyle === "file_upload" ? fileUploadPath : null,
    };

    // Insert into database
    const { data: result, error: dbError } = await supabase
      .from("submissions")
      .insert([submissionData])
      .select()
      .single();

    if (dbError) {
      throw new Error(dbError.message || "Failed to submit assignment");
    }

    return { success: true, message: "Assignment submitted", data: result };

  } catch (error) {
    return { success: false, message: error.message || "Submission failed" };
  }
}

