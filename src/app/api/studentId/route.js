import { createClient } from '@supabase/supabase-js';
import { NextResponse } from "next/server";

export async function GET(request) {
  console.log('🔍 API: studentId route called');
  console.log('🔍 API: Request URL:', request.url);
  
  // Get the userId from the URL query parameters
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  console.log('🔍 API: Extracted userId from searchParams:', userId);
  
  // Check if userId was provided
  if (!userId) {
    console.log('❌ API: No userId provided in request');
    return NextResponse.json({ 
      error: 'User ID is required' 
    }, { 
      status: 400 
    });
  }
  
  console.log('🔍 API: Creating Supabase client with service role key');
  // Create Supabase client with service role key (bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  console.log('🔍 API: Supabase client created, NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('🔍 API: SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    console.log('🔍 API: Starting database query for userId:', userId);
    
    // Query the students table to find the student with matching user_id
    const { data: student, error } = await supabase
      .from('students')
      .select('id, student_id, first_name, last_name, email, profile_picture, date_of_registration, user_id, grade, major_full, major_short, gpa, crc_class_id, profile_background')
      .eq('user_id', userId);
    
    console.log('🔍 API: Database query completed');
    console.log('🔍 API: Query result - student data:', student);
    console.log('🔍 API: Query result - error:', error);
    
    // Check if student was found
    if (!student || student.length === 0) {
      console.log('❌ API: No student found in database for userId:', userId);
      return NextResponse.json({ 
        error: 'Student not found' 
      }, { 
        status: 404 
      });
    }
    
    console.log('✅ API: Student found successfully:', student[0]);
    
    // Return just the student ID
    const full_name = [student[0].first_name, student[0].last_name].filter(Boolean).join(' ');
    const responseData = {
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
      crc_class_id: student[0].crc_class_id,
      profile_background: student[0].profile_background
    };
    
    console.log('✅ API: Sending successful response with data:', responseData);
    return NextResponse.json(responseData, { 
      status: 200 
    });
    
  } catch (error) {
    console.error('❌ API: Error occurred:', error);
    console.error('❌ API: Error stack:', error.stack);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('❌ API: Returning error response:', errorMessage);
    return NextResponse.json({ 
      error: errorMessage
    }, { 
      status: 500 
    });
  }
}