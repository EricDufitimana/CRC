import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { studentId, userId, documentType } = await request.json();

    if (!studentId || !userId || !documentType) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Verify the student exists and belongs to the user
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, first_name, last_name, user_id, academic_report_path')
      .eq('id', studentId)
      .eq('user_id', userId)
      .single();

    if (studentError || !student) {
      console.error('❌ API: Student verification failed:', studentError);
      return NextResponse.json({ error: "Student not found or unauthorized" }, { status: 404 });
    }

    if (documentType === 'academic_report') {
      // Delete the file from storage if it exists
      if (student.academic_report_path) {
        const { error: deleteError } = await supabase.storage
          .from('reports')
          .remove([student.academic_report_path]);

        if (deleteError) {
          console.error('❌ API: Failed to delete file from storage:', deleteError);
          // Continue with database update even if storage deletion fails
        }
      }

      // Update the database to remove the academic report path
      const { error: updateError } = await supabase
        .from('students')
        .update({ academic_report_path: null })
        .eq('id', studentId);

      if (updateError) {
        console.error('❌ API: Failed to update student record:', updateError);
        return NextResponse.json({ error: "Failed to update student record" }, { status: 500 });
      }
    } else if (documentType === 'resume_link') {
      // Update the database to remove the resume link
      const { error: updateError } = await supabase
        .from('students')
        .update({ resume_link: null })
        .eq('id', studentId);

      if (updateError) {
        console.error('❌ API: Failed to update student record:', updateError);
        return NextResponse.json({ error: "Failed to update student record" }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Document deleted successfully" 
    });

  } catch (error) {
    console.error('❌ API: Error deleting document:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "An unexpected error occurred" 
    }, { status: 500 });
  }
}






