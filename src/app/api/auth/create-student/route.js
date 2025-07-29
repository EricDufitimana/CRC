import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { user_id, first_name, last_name, student_id, email } = await request.json();

    console.log('API: Creating student with data:', { user_id, first_name, last_name, student_id, email });

    // Check if student already exists
    const { data: existingStudent } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (existingStudent) {
      console.log('API: Student already exists');
      return NextResponse.json({ success: true, message: 'Student already exists' });
    }

    // Create student record
    const { data: student, error: createError } = await supabase
      .from('students')
      .insert([
        {
          user_id: user_id,
          first_name: first_name,
          last_name: last_name,
          student_id: student_id,
          email: email,
          date_of_registration: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error('API: Error creating student:', createError);
      return NextResponse.json({ success: false, error: createError.message }, { status: 500 });
    }

    console.log('API: Student created successfully:', student.id);
    return NextResponse.json({ success: true, student: student });

  } catch (error) {
    console.error('API: Create student error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 