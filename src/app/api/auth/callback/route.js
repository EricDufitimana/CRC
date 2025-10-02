import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      fetch: (url, options = {}) => {
        return fetch(url, {
          ...options,
          timeout: 30000, // 30 second timeout
        });
      }
    }
  }
);

// Helper function to retry Supabase operations
async function retrySupabaseOperation(operation, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries} for Supabase operation`);
      const result = await operation();
      return result;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = delay * Math.pow(2, attempt - 1);
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

export async function POST(request) {
  try {
    console.log('=== OAUTH CALLBACK API (POST) ===');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { user_id, student_code, admin_data } = body;

    if (!user_id) {
      console.error('No user_id provided');
      return NextResponse.json({ error: 'No user_id provided' }, { status: 400 });
    }

    // Get user details from Supabase with retry logic
    let user, userError;
    try {
      const result = await retrySupabaseOperation(
        () => supabase.auth.admin.getUserById(user_id),
        3, // max retries
        1000 // initial delay
      );
      user = result.data;
      userError = result.error;
    } catch (error) {
      console.error('Failed to get user after retries:', error);
      return NextResponse.json({ 
        error: 'Unable to verify user', 
        message: 'Network timeout while verifying user account',
        details: 'Please try again in a few moments',
        code: 'USER_VERIFICATION_TIMEOUT'
      }, { status: 503 });
    }
    
    if (userError || !user.user) {
      console.error('Error getting user:', userError);
      return NextResponse.json({ 
        error: 'User not found', 
        message: 'User account could not be verified',
        details: userError?.message || 'User not found in the system',
        code: 'USER_NOT_FOUND'
      }, { status: 404 });
    }

    console.log('User found:', user.user.id);
    console.log('User metadata:', user.user.user_metadata);

    // Handle admin creation if admin_data is provided
    if (admin_data) {
      console.log('Creating admin with data:', admin_data);
      
      try {
        // Create admin record
        const { data: adminRecord, error: adminError } = await supabase
          .from('admin')
          .insert({
            user_id: user.user.id,
            honorific: admin_data.honorific || null,
            first_name: admin_data.firstName,
            last_name: admin_data.lastName,
            role: admin_data.role,
            email: user.user.email
          })
          .select()
          .single();

        if (adminError) {
          console.error('Error creating admin:', adminError);
          return NextResponse.json({ 
            error: 'Admin creation failed', 
            message: adminError.message,
            details: adminError.details || adminError.message,
            code: 'ADMIN_CREATION_FAILED'
          }, { status: 500 });
        }

        console.log('Admin created successfully:', adminRecord.id);
        
        // Create profile for the admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.user.id,
            Names: `${admin_data.honorific ? admin_data.honorific + ' ' : ''}${admin_data.firstName} ${admin_data.lastName}`,
            role: admin_data.role,
            email: user.user.email,
            is_new_user: true,
            has_setup: false,
            welcome_email_sent: false
          })
          .select()
          .single();

        if (profileError) {
          console.warn('Profile creation failed for admin:', profileError);
          // Don't fail the entire process for profile creation
        } else {
          console.log('Profile created successfully for admin:', profile.id);
        }

        return NextResponse.json({ 
          message: 'Admin created successfully', 
          admin: adminRecord 
        });

      } catch (error) {
        console.error('Error in admin creation process:', error);
        return NextResponse.json({ 
          error: 'Admin creation failed', 
          message: error.message,
          details: error.details || error.message,
          code: 'ADMIN_CREATION_ERROR'
        }, { status: 500 });
      }
    }

    // Create profile for the new user with retry logic
    let profile, profileError;
    try {
      const result = await retrySupabaseOperation(
        () => supabase
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
          .single(),
        2, // max retries
        500 // initial delay
      );
      profile = result.data;
      profileError = result.error;
    } catch (error) {
      console.error('Failed to create profile after retries:', error);
      profileError = error;
    }

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Don't fail the entire process if profile creation fails
    } else {
      console.log('Profile created successfully:', profile.id);
    }

    // Find existing student record by student_id with retry logic
    let existingStudent, findError;
    try {
      const result = await retrySupabaseOperation(
        () => supabase
          .from('students')
          .select('*')
          .eq('student_id', student_code)
          .single(),
        3, // max retries
        500 // initial delay
      );
      existingStudent = result.data;
      findError = result.error;
    } catch (error) {
      console.error('Failed to find student after retries:', error);
      return NextResponse.json({ 
        error: 'Unable to verify student', 
        message: 'Network timeout while looking up student record',
        details: 'Please try again in a few moments',
        code: 'STUDENT_LOOKUP_TIMEOUT'
      }, { status: 503 });
    }

    if (findError) {
      console.error('Error finding student:', findError);
      return NextResponse.json({ 
        error: 'Student not found', 
        message: 'No student record found with the provided student code',
        details: `Student code ${student_code} not found in the system`,
        code: 'STUDENT_NOT_FOUND'
      }, { status: 404 });
    }

    if (!existingStudent) {
      console.error('Student not found with code:', student_code);
      return NextResponse.json({ 
        error: 'Student not found', 
        message: 'No student record found with the provided student code',
        details: `Student code ${student_code} not found in the system`,
        code: 'STUDENT_NOT_FOUND'
      }, { status: 404 });
    }

    // Check if student already has a user_id (already registered)
    if (existingStudent.user_id) {
      console.error('Student already registered:', existingStudent);
      return NextResponse.json({ 
        error: 'Student already registered', 
        message: 'This student is already registered with an account',
        details: `Student ${existingStudent.first_name} ${existingStudent.last_name} already has an account`,
        code: 'ALREADY_REGISTERED'
      }, { status: 409 });
    }

    console.log('Found existing student:', existingStudent);





    // Update the existing student record with the new user_id with retry logic
    console.log('Updating existing student with user_id:', user.user.id);

    let updatedStudent, updateError;
    try {
      const result = await retrySupabaseOperation(
        () => supabase
          .from('students')
          .update({ 
            user_id: user.user.id,
            email: user.user.email,
            date_of_registration: new Date().toISOString()
          })
          .eq('id', existingStudent.id)
          .select()
          .single(),
        3, // max retries
        500 // initial delay
      );
      updatedStudent = result.data;
      updateError = result.error;
    } catch (error) {
      console.error('Failed to update student after retries:', error);
      return NextResponse.json({ 
        error: 'Unable to update student', 
        message: 'Network timeout while updating student record',
        details: 'Please try again in a few moments',
        code: 'STUDENT_UPDATE_TIMEOUT'
      }, { status: 503 });
    }

    if (updateError) {
      console.error('Error updating student:', updateError);
      return NextResponse.json({ 
        error: 'Student update failed', 
        message: updateError.message,
        details: updateError.details || updateError.message,
        code: updateError.code
      }, { status: 500 });
    }

    console.log('Student updated successfully:', updatedStudent.id);
    
    // Send welcome email after successful student update
    try {
      console.log('📧 Sending welcome email for user:', user.user.id);
      
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
      const welcomeEmailResponse = await fetch(`${baseUrl}/api/send-welcome-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.user.id })
      });
      
      if (welcomeEmailResponse.ok) {
        const welcomeEmailData = await welcomeEmailResponse.json();
        console.log('✅ Welcome email sent successfully:', welcomeEmailData);
      } else {
        const welcomeEmailError = await welcomeEmailResponse.json();
        console.error('❌ Welcome email failed:', welcomeEmailError);
        // Don't fail the entire process if welcome email fails
      }
    } catch (welcomeEmailError) {
      console.error('❌ Error sending welcome email:', welcomeEmailError);
      // Don't fail the entire process if welcome email fails
    }
    
    return NextResponse.json({ message: 'Student updated successfully', student: updatedStudent });

  } catch (error) {
    console.error('Callback API error:', error);
    return NextResponse.json({ 
      error: 'Callback failed', 
      message: error.message,
      details: error.details || error.message 
    }, { status: 500 });
  }
}


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

    // Exchange code for session with retry logic
    let data, exchangeError;
    try {
      const result = await retrySupabaseOperation(
        () => supabase.auth.exchangeCodeForSession(code),
        3, // max retries
        1000 // initial delay
      );
      data = result.data;
      exchangeError = result.error;
    } catch (error) {
      console.error('Failed to exchange code after retries:', error);
      return NextResponse.redirect(new URL(`/login?error=exchange_timeout&details=${encodeURIComponent('Network timeout during authentication')}`, request.url));
    }
    
    if (exchangeError) {
      console.error('Code exchange error:', exchangeError);
      return NextResponse.redirect(new URL(`/login?error=exchange_failed&details=${encodeURIComponent(exchangeError.message)}`, request.url));
    }

    const user = data.user;
    console.log('User authenticated successfully:', user.id);
    console.log('User metadata:', user.user_metadata);

    // Check if student already exists in students table (for linking existing students)
    const { data: existingStudentRecord } = await supabase
      .from('students')
      .select('*')
      .eq('email', user.email)
      .single();

    let profileData = {
      user_id: user.id,
      email: user.email,
      role: 'student',
      is_new_user: true,
      welcome_email_sent: false
    };

    // If student exists in students table, use their actual information
    if (existingStudentRecord) {
      profileData.Names = `${existingStudentRecord.first_name} ${existingStudentRecord.last_name}`;
      console.log('Using existing student info for profile:', profileData.Names);
    } else {
      // Use Google metadata for new students
      profileData.Names = user.user_metadata?.full_name || user.user_metadata?.name || 'User';
      console.log('Using Google metadata for profile:', profileData.Names);
    }

    // Create profile for the new user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Don't fail the entire process if profile creation fails
    } else {
      console.log('Profile created successfully:', profile.id);
    }

    // Check if student already exists by user_id
    const { data: existingStudent } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingStudent) {
      console.log('Student already exists');
      
      // Check if this user is an admin
      const { data: adminRecord } = await supabase
        .from('admin')
        .select('*')
        .eq('email', user.email)
        .single();
      
      if (adminRecord) {
        console.log('Existing user is an admin, redirecting to admin-verification page');
        return NextResponse.redirect(new URL('/admin-verification', request.url));
      } else {
        console.log('Existing user is a student, redirecting to login');
        return NextResponse.redirect(new URL('/login?message=already_registered', request.url));
      }
    }

    // Check if student already exists by email (in case they registered with different method)
    const { data: existingStudentByEmail } = await supabase
      .from('students')
      .select('*')
      .eq('email', user.email)
      .single();

    if (existingStudentByEmail) {
      console.log('Student with this email already exists');
      return NextResponse.redirect(new URL('/login?error=email_already_registered&details=An account with this email already exists', request.url));
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
    

    
    // Generate a unique student code
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
    
    // Send welcome email after successful student creation
    try {
      console.log('📧 Sending welcome email for new student:', user.id);
      
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
      const welcomeEmailResponse = await fetch(`${baseUrl}/api/send-welcome-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id })
      });
      
      if (welcomeEmailResponse.ok) {
        const welcomeEmailData = await welcomeEmailResponse.json();
        console.log('✅ Welcome email sent successfully for new student:', welcomeEmailData);
      } else {
        const welcomeEmailError = await welcomeEmailResponse.json();
        console.error('❌ Welcome email failed for new student:', welcomeEmailError);
        // Don't fail the entire process if welcome email fails
      }
    } catch (welcomeEmailError) {
      console.error('❌ Error sending welcome email for new student:', welcomeEmailError);
      // Don't fail the entire process if welcome email fails
    }
    
    // Check if this user is an admin
    const { data: adminRecord } = await supabase
      .from('admin')
      .select('*')
      .eq('email', user.email)
      .single();
    
    if (adminRecord) {
      console.log('User is an admin, redirecting to admin-verification page for verification');
      return NextResponse.redirect(new URL('/admin-verification', request.url));
    } else {
      console.log('User is a student, redirecting to login with success message');
      return NextResponse.redirect(new URL('/login?message=google_signup_success', request.url));
    }

  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL(`/login?error=callback_failed&details=${encodeURIComponent(error.message)}`, request.url));
  }
} 