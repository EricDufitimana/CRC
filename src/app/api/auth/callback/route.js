import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    console.log('=== OAUTH CALLBACK API (POST) ===');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { user_id, student_code } = body;

    if (!user_id) {
      console.error('No user_id provided');
      return NextResponse.json({ error: 'No user_id provided' }, { status: 400 });
    }

    // Get user details from Supabase
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(user_id);
    
    if (userError || !user.user) {
      console.error('Error getting user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('User found:', user.user.id);
    console.log('User metadata:', user.user.user_metadata);

    // Create profile for the new user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          user_id: user.user.id,
          Names: user.user.user_metadata?.full_name || user.user.user_metadata?.name || 'User',
          email: user.user.email,
          role: 'student',
          is_new_user: true,
          welcome_email_sent: false
        }
      ])
      .select()
      .single();

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Don't fail the entire process if profile creation fails
    } else {
      console.log('Profile created successfully:', profile.id);
    }

    // Check if student already exists
    const { data: existingStudent } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', user.user.id)
      .single();

    if (existingStudent) {
      console.log('Student already exists');
      return NextResponse.json({ message: 'Student already exists' });
    }

    // Extract user information from Google metadata
    const userMetadata = user.user.user_metadata;
    
    // Better extraction of names from Google OAuth
    let firstName = '';
    let lastName = '';
    
    if (userMetadata?.full_name) {
      const nameParts = userMetadata.full_name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    } else if (userMetadata?.given_name && userMetadata?.family_name) {
      firstName = userMetadata.given_name;
      lastName = userMetadata.family_name;
    } else if (userMetadata?.first_name && userMetadata?.last_name) {
      firstName = userMetadata.first_name;
      lastName = userMetadata.last_name;
    } else if (userMetadata?.name) {
      const nameParts = userMetadata.name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    
    // Fallback if no names found
    if (!firstName && !lastName) {
      firstName = 'Google';
      lastName = 'User';
    }
    
    const email = user.user.email;
    
    // Use provided student code or generate one
    const finalStudentCode = student_code || `GOOGLE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('Creating student with data:', { firstName, lastName, email, finalStudentCode });

    // Create student record
    const { data: student, error: createError } = await supabase
      .from('students')
      .insert([
        {
          user_id: user.user.id,
          first_name: firstName,
          last_name: lastName,
          student_id: finalStudentCode,
          email: email,
          date_of_registration: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error('Error creating student:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    console.log('Student created successfully:', student.id);
    return NextResponse.json({ message: 'Student created successfully', student });

  } catch (error) {
    console.error('Callback API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Keep the GET method for backward compatibility
export async function GET(request) {
  try {
    console.log('=== OAUTH CALLBACK API (GET) ===');
    console.log('Full URL:', request.url);
    
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    console.log('All search params:', Object.fromEntries(searchParams.entries()));
    console.log('Code exists:', !!code);
    console.log('Error:', error);

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
    }

    if (!code) {
      console.error('No authentication code received');
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    // Exchange code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Code exchange error:', exchangeError);
      return NextResponse.redirect(new URL(`/login?error=exchange_failed&details=${encodeURIComponent(exchangeError.message)}`, request.url));
    }

    const user = data.user;
    console.log('User authenticated successfully:', user.id);
    console.log('User metadata:', user.user_metadata);

    // Create profile for the new user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          user_id: user.id,
          Names: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          email: user.email,
          role: 'student',
          is_new_user: true,
          welcome_email_sent: false
        }
      ])
      .select()
      .single();

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Don't fail the entire process if profile creation fails
    } else {
      console.log('Profile created successfully:', profile.id);
    }

    // Check if student already exists
    const { data: existingStudent } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingStudent) {
      console.log('Student already exists');
      return NextResponse.redirect(new URL('/login?message=already_registered', request.url));
    }

    // Extract user information from Google metadata
    const userMetadata = user.user_metadata;
    
    // Better extraction of names from Google OAuth
    let firstName = '';
    let lastName = '';
    
    if (userMetadata?.full_name) {
      const nameParts = userMetadata.full_name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    } else if (userMetadata?.given_name && userMetadata?.family_name) {
      firstName = userMetadata.given_name;
      lastName = userMetadata.family_name;
    } else if (userMetadata?.first_name && userMetadata?.last_name) {
      firstName = userMetadata.first_name;
      lastName = userMetadata.last_name;
    } else if (userMetadata?.name) {
      const nameParts = userMetadata.name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    
    // Fallback if no names found
    if (!firstName && !lastName) {
      firstName = 'Google';
      lastName = 'User';
    }
    
    const email = user.email;
    
    // Generate a student code if none was provided
    const studentCode = `GOOGLE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('Creating student with data:', { firstName, lastName, email, studentCode });

    // Create student record
    const { data: student, error: createError } = await supabase
      .from('students')
      .insert([
        {
          user_id: user.id,
          first_name: firstName,
          last_name: lastName,
          student_id: studentCode,
          email: email,
          date_of_registration: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error('Error creating student:', createError);
      return NextResponse.redirect(new URL(`/login?error=student_creation_failed&details=${encodeURIComponent(createError.message)}`, request.url));
    }

    console.log('Student created successfully:', student.id);
    return NextResponse.redirect(new URL('/login?message=google_signup_success', request.url));

  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL(`/login?error=callback_failed&details=${encodeURIComponent(error.message)}`, request.url));
  }
} 