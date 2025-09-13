import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    console.log("API route called");
    
    const body = await request.json();
    console.log("Request body:", body);
    
    const { user_id, email, password, firstName, lastName, studentCode } = body;

    // Validate required fields
    if (!user_id || !email || !password || !firstName || !lastName || !studentCode) {
      console.log("Missing required fields:", { email, password, firstName, lastName, studentCode });
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Attempting to create profile and student in database...");

    // Create profile for the new user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          user_id: user_id,
          Names: `${firstName} ${lastName}`,
          email: email,
          role: 'student',
          is_new_user: true,
          welcome_email_sent: false
        }
      ])
      .select()
      .single();

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return NextResponse.json(
        { 
          message: "Failed to create profile",
          error: profileError.message 
        },
        { status: 500 }
      );
    }

    console.log("Profile created successfully:", profile.id);

    // Create student in Supabase database
    const { data: student, error } = await supabase
      .from('students')
      .insert([
        {
          user_id: user_id,
          first_name: firstName,
          last_name: lastName,
          student_id: studentCode,
        email: email,
          date_of_registration: new Date().toISOString(), // Format as YYYY-MM-DDTHH:MM:SS.sssZ
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { 
          message: "Failed to create student",
          error: error.message 
        },
        { status: 500 }
      );
    }

    console.log("Student created successfully:", student);

    // Return success response
    return NextResponse.json(
      { 
        message: "Student created successfully", 
        student: student 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating student:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        message: "Internal server error",
        error: error.message 
      },
      { status: 500 }
    );
  }
}