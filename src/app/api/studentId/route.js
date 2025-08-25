import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

export async function GET(request) {
  // Get the userId from the URL query parameters
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  // Check if userId was provided
  if (!userId) {
    return NextResponse.json({ 
      error: 'User ID is required' 
    }, { 
      status: 400 
    });
  }
  
  // Create Supabase client with service role key (bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    console.log('🔍 API: Searching for userId:', userId);
    
    // Query the students table to find the student with matching user_id
    const { data: student, error } = await supabase
      .from('students')
      .select('id, student_id, first_name, last_name, email, profile_picture, date_of_registration, user_id, grade, major_full, major_short, gpa, crc_class_id')
      .eq('user_id', userId);
    
    console.log('🔍 API: Query result:', { student, error });
    
    // Check if student was found
    if (!student || student.length === 0) {
      console.log('🔍 API: No student found');
      return NextResponse.json({ 
        error: 'Student not found' 
      }, { 
        status: 404 
      });
    }
    
    // Return just the student ID
    const full_name = [student[0].first_name, student[0].last_name].filter(Boolean).join(' ');
    return NextResponse.json({ 
      studentId: student[0].id,
      student_id: student[0].student_id,
      full_name: full_name,
      first_name: student[0].first_name,
      last_name: student[0].last_name,
      email: student[0].email,
      profile_picture: student[0].profile_picture,
      date_of_registration: student[0].date_of_registration,
      user_id: student[0].user_id,
      grade: student[0].grade,
      major_full: student[0].major_full,
      major_short: student[0].major_short,
      gpa: student[0].gpa,
      crc_class_id: student[0].crc_class_id
    }, { 
      status: 200 
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ 
      error: errorMessage
    }, { 
      status: 500 
    });
  }
}