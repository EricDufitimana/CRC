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
      .select('id')
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
    return NextResponse.json({ 
      studentId: student[0].id 
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