import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get("studentId");
    
    if (!studentIdParam) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    const studentId = parseInt(studentIdParam);

    // Fetch student documents
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, first_name, last_name, academic_report_path, resume_link')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      console.error('❌ API: Student not found:', studentError);
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Generate signed URL for academic report if it exists
    let academic_report_url = null;
    if (student.academic_report_path) {
      const { data: urlData, error: urlError } = await supabase.storage
        .from('reports')
        .createSignedUrl(student.academic_report_path, 3600); // 1 hour expiry
      
      if (!urlError && urlData?.signedUrl) {
        academic_report_url = urlData.signedUrl;
      }
    }

    return NextResponse.json({
      id: student.id,
      first_name: student.first_name,
      last_name: student.last_name,
      academic_report_path: student.academic_report_path,
      academic_report_url: academic_report_url,
      resume_link: student.resume_link
    });

  } catch (error) {
    console.error('❌ API: Error fetching documents:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "An unexpected error occurred" 
    }, { status: 500 });
  }
}
