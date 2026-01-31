import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { createClient as createServiceRoleClient } from '@/utils/supabase/service-role';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/account-check';

  console.log('🔐 [Auth Callback] Processing OAuth callback');
  console.log('🔐 [Auth Callback] Request URL:', request.url);
  console.log('🔐 [Auth Callback] Request origin:', requestUrl.origin);
  console.log('🔐 [Auth Callback] Code present:', !!code);
  console.log('🔐 [Auth Callback] Next URL:', next);
  console.log('🔐 [Auth Callback] Environment vars:', {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
  });

  if (code) {
    try {
      const supabase = await createClient();
      
      console.log('🔄 [Auth Callback] Exchanging code for session...');
      console.log('🔄 [Auth Callback] Code length:', code.length);
      console.log('🔄 [Auth Callback] Code preview:', code.substring(0, 20) + '...');
      
      // This is where the PKCE verifier is available (in cookies)
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('❌ [Auth Callback] Error exchanging code:', error);
        console.error('❌ [Auth Callback] Error details:', {
          message: error.message,
          status: error.status,
          code: error.code,
        });
        return NextResponse.redirect(
          new URL(`/auth/error?message=${encodeURIComponent(error.message)}`, requestUrl.origin)
        );
      }

      console.log('✅ [Auth Callback] Session established successfully');
      console.log('👤 [Auth Callback] User ID:', data.user?.id);
      console.log('👤 [Auth Callback] User email:', data.user?.email);
      console.log('👤 [Auth Callback] Session expires at:', data.session?.expires_at);

      // Check if user exists in admin or student tables
      if (data.user?.id) {
        console.log('🔍 [Auth Callback] Checking user role...');
        const adminClient = createServiceRoleClient();
        
        // Check admin table
        const { data: adminCheck, error: adminError } = await adminClient
          .from('admin')
          .select('*')
          .eq('user_id', data.user.id)
          .single();
          
        if (!adminError && adminCheck) {
          console.log('✅ [Auth Callback] User is admin:', adminCheck);
          console.log('🔐 [Auth Callback] Admin details:', {
            id: adminCheck.id,
            first_name: adminCheck.first_name,
            last_name: adminCheck.last_name,
            email: adminCheck.email,
          });
        } else {
          console.log('❌ [Auth Callback] Admin check failed:', adminError);
        }
        
        // Check student table
        const { data: studentCheck, error: studentError } = await adminClient
          .from('students')
          .select('*')
          .eq('user_id', data.user.id)
          .single();
          
        if (!studentError && studentCheck) {
          console.log('✅ [Auth Callback] User is student:', studentCheck);
          console.log('🔐 [Auth Callback] Student details:', {
            id: studentCheck.id,
            student_id: studentCheck.student_id,
            first_name: studentCheck.first_name,
            last_name: studentCheck.last_name,
            email: studentCheck.email,
          });
        } else {
          console.log('❌ [Auth Callback] Student check failed:', studentError);
        }
      }

      console.log('🔄 [Auth Callback] Redirecting to:', next);
      console.log('🔄 [Auth Callback] Full redirect URL:', new URL(next, requestUrl.origin).toString());
      
      // Redirect to the next page (account-check, admin dashboard, etc.)
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    } catch (error) {
      console.error('❌ [Auth Callback] Unexpected error:', error);
      console.error('❌ [Auth Callback] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return NextResponse.redirect(
        new URL('/auth/error?message=Authentication failed', requestUrl.origin)
      );
    }
  }

  console.log('⚠️ [Auth Callback] No code provided, redirecting to login');
  console.log('⚠️ [Auth Callback] Redirect URL:', new URL('/login', requestUrl.origin).toString());
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}

export async function POST(request: Request) {
  try {
    console.log('🔐 [Auth Callback POST] Processing student creation request');
    
    const body = await request.json();
    const { user_id, student_code, email } = body;

    console.log('📝 [Auth Callback POST] Request data:', { user_id, student_code, email });

    if (!user_id || !student_code) {
      console.error('❌ [Auth Callback POST] Missing required fields');
      return NextResponse.json(
        { error: 'Missing user_id or student_code' },
        { status: 400 }
      );
    }

    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient();

    // Find the student by student_code
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', student_code)
      .single();

    if (studentError || !student) {
      console.error('❌ [Auth Callback POST] Student not found:', studentError);
      return NextResponse.json(
        { error: 'Student not found', details: studentError?.message || 'Student record not found' },
        { status: 404 }
      );
    }

    // Check if student already has a user account
    if (student.user_id) {
      console.log('⚠️ [Auth Callback POST] Student already has user account');
      return NextResponse.json(
        { error: 'Student already registered', details: 'This student record is already linked to a user account' },
        { status: 409 }
      );
    }

    // Update student with user_id and email
    const { data: updatedStudent, error: updateError } = await supabase
      .from('students')
      .update({ 
        user_id,
        email: email || student.email // Use Google email or fallback to existing
      })
      .eq('id', student.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ [Auth Callback POST] Failed to update student:', updateError);
      return NextResponse.json(
        { error: 'Failed to update student', details: updateError.message },
        { status: 500 }
      );
    }

    // Create profile record for the user
    try {
      const profile = await prisma.profiles.create({
        data: {
          user_id: user_id,
          email: student.email,
          role: 'student',
          is_new_user: true,
          has_setup: false,
          Names: `${student.first_name} ${student.last_name}`
        },
      });

      console.log('✅ [Auth Callback POST] Profile created successfully:', profile);
    } catch (profileError) {
      console.error('❌ [Auth Callback POST] Failed to create profile:', profileError);
      // Don't fail the whole request if profile creation fails, but log it
      // The student was already updated successfully
    }

    console.log('✅ [Auth Callback POST] Student updated successfully:', updatedStudent);
    
    return NextResponse.json({
      success: true,
      message: 'Student account created successfully',
      student: updatedStudent
    });

  } catch (error) {
    console.error('❌ [Auth Callback POST] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
