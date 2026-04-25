import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient as createServiceRoleClient } from '@/utils/supabase/service-role';

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
        
        // Check admin table using Prisma
        const adminCheck = await prisma.admin.findFirst({
          where: { user_id: data.user.id },
        });
          
        if (adminCheck) {
          console.log('✅ [Auth Callback] User is admin:', adminCheck);
          console.log('🔐 [Auth Callback] Admin details:', {
            id: adminCheck.id.toString(),
            first_name: adminCheck.first_name,
            last_name: adminCheck.last_name,
            email: adminCheck.email,
          });
        } else {
          console.log('❌ [Auth Callback] Admin not found');
        }
        
        // Check student table using Prisma
        const studentCheck = await prisma.students.findFirst({
          where: { user_id: data.user.id },
        });
          
        if (studentCheck) {
          console.log('✅ [Auth Callback] User is student:', studentCheck);
          console.log('🔐 [Auth Callback] Student details:', {
            id: studentCheck.id.toString(),
            student_id: studentCheck.student_id,
            first_name: studentCheck.first_name,
            last_name: studentCheck.last_name,
            email: studentCheck.email,
          });
        } else {
          console.log('❌ [Auth Callback] Student not found');
        }
      }

      console.log('🔄 [Auth Callback] Redirecting to:', next);
      console.log('🔄 [Auth Callback] Full redirect URL:', new URL(next, requestUrl.origin).toString());
      
      // Redirect to client callback page to handle registration with localStorage access
      const clientCallbackUrl = new URL('/auth/callback', requestUrl.origin);
      return NextResponse.redirect(clientCallbackUrl);
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
  console.log('🛡️ [Auth Callback POST] POST request received');
  try {
    const body = await request.json();
    const { user_id, student_code, admin_data, email } = body;

    console.log('�️ [Auth Callback POST] Processing registration request:', { 
      user_id, 
      student_code: student_code ? 'present' : 'absent', 
      admin_data: admin_data ? 'present' : 'absent',
      email 
    });
    console.log('🛡️ [Auth Callback POST] Full admin_data:', admin_data);

    if (!user_id) {
      console.error('❌ [Auth Callback POST] Missing user_id');
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    let registrationEmail = email;
    let fullName = '';

    // --- STUDENT REGISTRATION FLOW ---
    if (student_code) {
      console.log('🎓 [Auth Callback POST] Executing student registration flow');
      
      // Find the student by student_code using Prisma
      const student = await prisma.students.findFirst({
        where: { student_id: student_code },
      });

      if (!student) {
        console.error('❌ [Auth Callback POST] Student record not found');
        return NextResponse.json(
          { error: 'Student not found', details: 'Student record not found' },
          { status: 404 }
        );
      }

      if (student.user_id) {
        console.log('⚠️ [Auth Callback POST] Student already registered');
        return NextResponse.json(
          { error: 'Already registered', details: 'This student record is already linked' },
          { status: 409 }
        );
      }

      registrationEmail = email || student.email;
      fullName = `${student.first_name} ${student.last_name}`;

      // Link student to user_id using Prisma
      try {
        await prisma.students.update({
          where: { id: student.id },
          data: { user_id, email: registrationEmail },
        });
      } catch (updateError) {
        console.error('❌ [Auth Callback POST] Failed to link student:', updateError);
        return NextResponse.json({ 
          error: 'Link failed', 
          details: updateError instanceof Error ? updateError.message : 'Unknown error' 
        }, { status: 500 });
      }

      // Create profile
      try {
        await prisma.profiles.create({
          data: {
            user_id,
            email: registrationEmail,
            role: 'student',
            is_new_user: true,
            has_setup: false,
            Names: fullName,
          },
        });
      } catch (pErr) {
        console.error('❌ [Auth Callback POST] Profile creation error:', pErr);
      }

      console.log('✅ [Auth Callback POST] Student registration completed');
    } 
    // --- ADMIN REGISTRATION FLOW ---
    else if (admin_data) {
      console.log('🛡️ [Auth Callback POST] Executing admin registration flow');
      console.log('🛡️ [Auth Callback POST] Admin data details:', admin_data);
      
      const { honorific, firstName, lastName, role, token } = admin_data;
      registrationEmail = email; // For admins, email always comes from session
      fullName = `${firstName} ${lastName}`;
      
      console.log('🛡️ [Auth Callback POST] Registration details:', {
        user_id,
        honorific,
        firstName,
        lastName,
        role,
        registrationEmail,
        fullName,
        token: token ? `${token.substring(0, 8)}...` : 'none',
      });

      try {
        console.log('🛡️ [Auth Callback POST] Creating admin record in Prisma...');
        // Create admin record using Prisma
        const adminRecord = await prisma.admin.create({
          data: {
            user_id,
            honorific,
            first_name: firstName,
            last_name: lastName,
            role,
            email: registrationEmail,
          },
        });
        console.log('✅ [Auth Callback POST] Admin record created:', { id: adminRecord.id.toString() });

        console.log('🛡️ [Auth Callback POST] Creating profile record...');
        // Create profile
        const profileRecord = await prisma.profiles.create({
          data: {
            user_id,
            email: registrationEmail,
            role: 'admin',
            is_new_user: true,
            has_setup: false,
            Names: fullName,
          },
        });
        console.log('✅ [Auth Callback POST] Profile record created:', { id: profileRecord.id.toString() });

        // Mark invite as used if token is present
        if (token) {
          console.log('🛡️ [Auth Callback POST] Marking invite as used, token:', `${token.substring(0, 8)}...`);
          try {
            const updatedInvite = await prisma.admin_invites.update({
              where: { token },
              data: { used_at: new Date() },
            });
            console.log('✅ [Auth Callback POST] Invite marked as used:', { id: updatedInvite.id.toString() });
          } catch (inviteErr) {
            console.error('⚠️ [Auth Callback POST] Failed to mark invite as used:', inviteErr);
            console.error('⚠️ [Auth Callback POST] Invite error details:', inviteErr instanceof Error ? inviteErr.message : 'Unknown');
            // Don't fail the registration if invite marking fails
          }
        }
      } catch (adminErr) {
        console.error('❌ [Auth Callback POST] Admin creation error:', adminErr);
        console.error('❌ [Auth Callback POST] Error details:', {
          message: adminErr instanceof Error ? adminErr.message : 'Unknown',
          code: (adminErr as any).code,
          meta: (adminErr as any).meta,
        });
        console.error('❌ [Auth Callback POST] Error stack:', adminErr instanceof Error ? adminErr.stack : 'No stack');
        return NextResponse.json({ error: 'Admin creation failed', details: adminErr instanceof Error ? adminErr.message : 'Unknown' }, { status: 500 });
      }

      console.log('✅ [Auth Callback POST] Admin registration completed successfully');
    } else {
      console.error('❌ [Auth Callback POST] Neither student_code nor admin_data provided');
      return NextResponse.json({ error: 'Missing registration details' }, { status: 400 });
    }

    // --- SHARED: SEND WELCOME EMAIL ---
    if (registrationEmail) {
      try {
        console.log('📧 [Auth Callback POST] Invoking welcome email function for:', registrationEmail);
        const supabase = createServiceRoleClient();
        const { error: functionError } = await supabase.functions.invoke('send_welcome_email', {
          body: { email: registrationEmail },
        });

        if (functionError) {
          console.error('⚠️ [Auth Callback POST] Welcome email function failed:', functionError);
        } else {
          console.log('✅ [Auth Callback POST] Welcome email sent successfully');
          // Mark email as sent in profile
          await prisma.profiles.update({
            where: { user_id },
            data: { welcome_email_sent: true },
          });
        }
      } catch (emailErr) {
        console.error('⚠️ [Auth Callback POST] Error in email flow:', emailErr);
        // We don't fail the registration if only the email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
    });

  } catch (error) {
    console.error('❌ [Auth Callback POST] Critical error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
