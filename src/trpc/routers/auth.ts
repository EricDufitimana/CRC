import { z } from 'zod';
import { baseProcedure, createTRPCRouter, type AdminUser, type StudentUser } from '../init';
import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceRoleClient } from '@/utils/supabase/service-role';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/lib/prisma';

export const authRouter = createTRPCRouter({
  // Get OAuth URL for Google sign-in
  getOAuthUrl: baseProcedure
    .input(
      z.object({
        provider: z.enum(['google', 'github']),
        redirectTo: z.string(),
        role: z.enum(['admin', 'student']).optional(),
        origin: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      console.log('🔐 [tRPC Auth] getOAuthUrl: Starting OAuth URL generation');
      console.log('🔐 [tRPC Auth] getOAuthUrl: Input:', {
        provider: input.provider,
        redirectTo: input.redirectTo,
        role: input.role,
        origin: input.origin,
      });

      const supabase = await createClient();
      
      // Get the base URL - use client-provided origin first, then environment variable
      console.log('🔐 [tRPC Auth] getOAuthUrl: Origin received from client:', input.origin);
      console.log('🔐 [tRPC Auth] getOAuthUrl: Environment variable NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
      
      const baseUrl = input.origin || process.env.NEXT_PUBLIC_APP_URL;
      
      console.log('🔐 [tRPC Auth] getOAuthUrl: Base URL source:', input.origin ? 'client-provided' : 'environment variable');
      console.log('🔐 [tRPC Auth] getOAuthUrl: Final baseUrl:', baseUrl);
      
      // Redirect to auth callback route, which will then redirect to the final destination
      const callbackUrl = `${baseUrl}/api/auth/callback?next=${encodeURIComponent(input.redirectTo)}`;
      
      console.log('🔐 [tRPC Auth] getOAuthUrl: Base URL:', baseUrl);
      console.log('🔐 [tRPC Auth] getOAuthUrl: Callback URL:', callbackUrl);
      console.log('🔐 [tRPC Auth] getOAuthUrl: Environment vars:', {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        NODE_ENV: process.env.NODE_ENV,
      });
      console.log('🔐 [tRPC Auth] getOAuthUrl: Current hostname (if available):', typeof window !== 'undefined' ? window.location.hostname : 'server-side');
      console.log('🔐 [tRPC Auth] getOAuthUrl: Initiating Supabase OAuth...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: input.provider,
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('❌ [tRPC Auth] getOAuthUrl: OAuth error:', error);
        console.error('❌ [tRPC Auth] getOAuthUrl: Error details:', {
          message: error.message,
          status: error.status,
          code: error.code,
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to initiate OAuth',
        });
      }

      console.log('✅ [tRPC Auth] getOAuthUrl: OAuth URL generated successfully');
      console.log('🔐 [tRPC Auth] getOAuthUrl: Generated OAuth URL:', data.url);
      console.log('🔐 [tRPC Auth] getOAuthUrl: Redirect URL:', input.redirectTo);
      console.log('🔐 [tRPC Auth] getOAuthUrl: Full OAuth flow initiated for role:', input.role || 'not specified');
      return { url: data.url };
    }),

  // Exchange OAuth code for session (called from callback route)
  exchangeCodeForSession: baseProcedure
    .input(
      z.object({
        code: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      console.log('🔄 [tRPC Auth] exchangeCodeForSession: Starting code exchange');
      console.log('🔄 [tRPC Auth] exchangeCodeForSession: Code present:', !!input.code);

      const supabase = await createClient();
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(input.code);

      if (error) {
        console.error('❌ [tRPC Auth] exchangeCodeForSession: Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to exchange code for session',
        });
      }

      console.log('✅ [tRPC Auth] exchangeCodeForSession: Session established');
      console.log('👤 [tRPC Auth] exchangeCodeForSession: User ID:', data.user?.id);

      return {
        success: true,
        userId: data.user?.id || null,
      };
    }),
  signInWithPassword: baseProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ input }) => {
      const supabase = await createClient();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: error.message || 'Invalid credentials',
        });
      }

      return {
        user: data.user,
        session: data.session,
      };
    }),

  // Sign out
  signOut: baseProcedure.mutation(async () => {
    const supabase = await createClient();
    
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to sign out',
      });
    }

    return { success: true };
  }),

  // Get current session
  getSession: baseProcedure.query(async () => {
    const supabase = await createClient();
    
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to get session',
      });
    }

    return { session };
  }),

  // Register student (link student_id to user_id)
  registerStudent: baseProcedure
    .input(
      z.object({
        userId: z.string(),
        studentCode: z.string(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ input }) => {
      console.log('🎓 [tRPC Auth] registerStudent: Starting student registration');
      
      const supabase = createServiceRoleClient();
      let registrationEmail = input.email;
      let fullName = '';

      // Find the student by student_code
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('student_id', input.studentCode)
        .single();

      if (studentError || !student) {
        console.error('❌ [tRPC Auth] registerStudent: Student record not found:', studentError);
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Student not found',
        });
      }

      if (student.user_id) {
        console.log('⚠️ [tRPC Auth] registerStudent: Student already registered');
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Already registered',
        });
      }

      registrationEmail = input.email || student.email;
      fullName = `${student.first_name} ${student.last_name}`;

      // Link student to user_id
      const { error: updateError } = await supabase
        .from('students')
        .update({ user_id: input.userId, email: registrationEmail })
        .eq('id', student.id);

      if (updateError) {
        console.error('❌ [tRPC Auth] registerStudent: Failed to link student:', updateError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Link failed',
        });
      }

      // Create profile
      try {
        await prisma.profiles.create({
          data: {
            user_id: input.userId,
            email: registrationEmail,
            role: 'student',
            is_new_user: true,
            has_setup: false,
            Names: fullName,
          },
        });
      } catch (pErr) {
        console.error('❌ [tRPC Auth] registerStudent: Profile creation error:', pErr);
      }

      console.log('✅ [tRPC Auth] registerStudent: Student registration completed');
      return { success: true, email: registrationEmail };
    }),

  // Register admin (create admin record with optional invite token)
  registerAdmin: baseProcedure
    .input(
      z.object({
        userId: z.string(),
        email: z.string().email(),
        honorific: z.string().optional(),
        firstName: z.string(),
        lastName: z.string(),
        role: z.string(),
        token: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      console.log('🛡️ [tRPC Auth] registerAdmin: Starting admin registration');

      const fullName = `${input.firstName} ${input.lastName}`;

      // Validate token if provided
      if (input.token) {
        const invite = await prisma.admin_invites.findUnique({
          where: { token: input.token },
        });

        if (!invite) {
          console.error('❌ [tRPC Auth] registerAdmin: Invalid token');
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid invite link',
          });
        }

        if (invite.used_at) {
          console.error('❌ [tRPC Auth] registerAdmin: Token already used');
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This link has already been used',
          });
        }
      }

      try {
        // Create admin record using Prisma
        await prisma.admin.create({
          data: {
            user_id: input.userId,
            honorific: input.honorific,
            first_name: input.firstName,
            last_name: input.lastName,
            role: input.role,
            email: input.email,
          },
        });

        // Create profile
        await prisma.profiles.create({
          data: {
            user_id: input.userId,
            email: input.email,
            role: 'admin',
            is_new_user: true,
            has_setup: false,
            Names: fullName,
          },
        });

        // Mark invite as used if token is present
        if (input.token) {
          console.log('🛡️ [tRPC Auth] registerAdmin: Marking invite as used');
          try {
            await prisma.admin_invites.update({
              where: { token: input.token },
              data: { used_at: new Date() },
            });
            console.log('✅ [tRPC Auth] registerAdmin: Invite marked as used');
          } catch (inviteErr) {
            console.error('⚠️ [tRPC Auth] registerAdmin: Failed to mark invite as used:', inviteErr);
            // Don't fail the registration if invite marking fails
          }
        }
      } catch (adminErr) {
        console.error('❌ [tRPC Auth] registerAdmin: Admin creation error:', adminErr);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: adminErr instanceof Error ? adminErr.message : 'Admin creation failed',
        });
      }

      console.log('✅ [tRPC Auth] registerAdmin: Admin registration completed');
      return { success: true, email: input.email };
    }),

  // Send welcome email
  sendWelcomeEmail: baseProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      console.log('📧 [tRPC Auth] sendWelcomeEmail: Sending welcome email to:', input.email);
      
      const supabase = createServiceRoleClient();
      
      const { error: functionError } = await supabase.functions.invoke('send_welcome_email', {
        body: { email: input.email },
      });

      if (functionError) {
        console.error('⚠️ [tRPC Auth] sendWelcomeEmail: Welcome email function failed:', functionError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send welcome email',
        });
      }

      console.log('✅ [tRPC Auth] sendWelcomeEmail: Welcome email sent successfully');
      return { success: true };
    }),

  // Get current user with admin/student IDs
  getUser: baseProcedure.query(async ({ ctx }) => {
    console.log('👤 [tRPC Auth] getUser: Starting user data fetch');
    console.log('👤 [tRPC Auth] getUser: Context role:', ctx.role);
    console.log('👤 [tRPC Auth] getUser: Context user exists:', !!ctx.user);

    // Use context data instead of calling Supabase auth (which requires session)
    // The context already has the user data from Prisma
    if (!ctx.user || !ctx.role) {
      console.log('⚠️ [tRPC Auth] getUser: No user or role in context');
      return {
        userId: null,
        adminId: null,
        studentId: null,
        role: null,
        user: null,
      };
    }

    // Get userId from context user (user_id field)
    const userId = ctx.user.user_id;
    
    if (!userId) {
      console.log('⚠️ [tRPC Auth] getUser: No user_id in context user');
      return {
        userId: null,
        adminId: null,
        studentId: null,
        role: null,
        user: null,
      };
    }

    console.log('👤 [tRPC Auth] getUser: User ID from context:', userId);
    console.log('👤 [tRPC Auth] getUser: User role from context:', ctx.role);

    if (ctx.role === 'admin') {
      const adminUser = ctx.user as AdminUser;
      const adminId = adminUser.id.toString();
      console.log('✅ [tRPC Auth] getUser: Admin user detected');
      console.log('👤 [tRPC Auth] getUser: Admin ID:', adminId);
      console.log('👤 [tRPC Auth] getUser: Admin details:', {
        id: adminId,
        user_id: userId,
        first_name: adminUser.first_name,
        last_name: adminUser.last_name,
        email: adminUser.email,
        role: adminUser.role,
      });
      
      return {
        userId: userId,
        adminId: adminId,
        studentId: null,
        role: 'admin' as const,
        user: adminUser,
      };
    } else if (ctx.role === 'student') {
      const studentUser = ctx.user as StudentUser;
      const studentId = Number(studentUser.id);
      console.log('✅ [tRPC Auth] getUser: Student user detected');
      console.log('👤 [tRPC Auth] getUser: Student ID:', studentId);
      console.log('👤 [tRPC Auth] getUser: Student details:', {
        id: studentId,
        user_id: userId,
        student_id: studentUser.student_id,
        first_name: studentUser.first_name,
        last_name: studentUser.last_name,
        email: studentUser.email,
      });
      
      return {
        userId: userId,
        adminId: null,
        studentId: studentId,
        role: 'student' as const,
        user: studentUser,
      };
    }

    console.log('⚠️ [tRPC Auth] getUser: Unknown role in context');
    return {
      userId: userId,
      adminId: null,
      studentId: null,
      role: null,
      user: null,
    };
  }),

  // Check if user is super admin
  checkSuperAdmin: baseProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      console.log('🔍 [tRPC Auth] checkSuperAdmin: Starting super admin verification');
      console.log('🔍 [tRPC Auth] checkSuperAdmin: Input userId:', input.userId);
      
      const targetUserId = process.env.SUPER_ADMIN_USER_ID;
      
      if (!targetUserId) {
        console.error('❌ [tRPC Auth] checkSuperAdmin: SUPER_ADMIN_USER_ID environment variable not set');
        return {
          success: false,
          message: 'Server configuration error: SUPER_ADMIN_USER_ID not configured',
        };
      }
      
      console.log('🔍 [tRPC Auth] checkSuperAdmin: Target super admin ID:', targetUserId);
      console.log('🔍 [tRPC Auth] checkSuperAdmin: Comparing user IDs...');
      console.log('🔍 [tRPC Auth] checkSuperAdmin: Input ID === Target ID?', input.userId === targetUserId);
      
      if (input.userId === targetUserId) {
        console.log('✅ [tRPC Auth] checkSuperAdmin: User is authorized super admin');
        console.log('✅ [tRPC Auth] checkSuperAdmin: Verification successful');
        console.log('✅ [tRPC Auth] checkSuperAdmin: Redirecting to:', '/dashboard/admin');
        
        return {
          success: true,
          message: 'User is authorized admin',
          redirectTo: '/dashboard/admin',
        };
      } else {
        console.log('❌ [tRPC Auth] checkSuperAdmin: User ID does not match super admin ID');
        console.log('❌ [tRPC Auth] checkSuperAdmin: Access denied');
        console.log('🔍 [tRPC Auth] checkSuperAdmin: Input ID:', input.userId);
        console.log('🔍 [tRPC Auth] checkSuperAdmin: Expected ID:', targetUserId);
        
        return {
          success: false,
          message: 'User is not super admin',
        };
      }
    }),

  // Check if user exists in students or admins table
  checkUserExists: baseProcedure
    .input(
      z.object({
        userId: z.string(),
        table: z.enum(['students', 'admins']),
      }),
    )
    .query(async ({ input }) => {
      console.log('🔍 [tRPC Auth] checkUserExists: Checking user existence');
      console.log('🔍 [tRPC Auth] checkUserExists: Table:', input.table);
      console.log('🔍 [tRPC Auth] checkUserExists: User ID:', input.userId);
      
      if (input.table === 'students') {
        const student = await prisma.students.findFirst({
          where: {
            user_id: input.userId,
          },
          select: {
            id: true,
          },
        });

        console.log('📊 [tRPC Auth] checkUserExists: Student exists:', !!student);
        return { exists: !!student };
      }
      
      if (input.table === 'admins') {
        const admin = await prisma.admin.findFirst({
          where: {
            user_id: input.userId,
          },
          select: {
            id: true,
          },
        });

        console.log('📊 [tRPC Auth] checkUserExists: Admin exists:', !!admin);
        return { exists: !!admin };
      }

      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid table specified',
      });
    }),

  // Check if student has completed setup
  checkSetupStatus: baseProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      console.log('🔍 [tRPC Auth] checkSetupStatus: Starting setup status check');
      console.log('🔍 [tRPC Auth] checkSetupStatus: User ID:', input.userId);
      
      console.log('🔍 [tRPC Auth] checkSetupStatus: Querying profiles table...');
      const profile = await prisma.profiles.findUnique({
        where: {
          user_id: input.userId,
        },
        select: {
          has_setup: true,
        },
      });

      if (!profile) {
        console.log('⚠️ [tRPC Auth] checkSetupStatus: Profile not found for user:', input.userId);
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      console.log('✅ [tRPC Auth] checkSetupStatus: Profile found');
      console.log('🔍 [tRPC Auth] checkSetupStatus: has_setup:', profile.has_setup);

      return {
        success: true,
        has_setup: profile.has_setup || false,
      };
    }),

    getProfile: baseProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user || !ctx.role) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
        });
      }
      
      if (ctx.role === 'admin') {
        const adminUser = ctx.user as AdminUser;
        return {
          id: adminUser.id.toString(),
          first_name: adminUser.first_name,
          last_name: adminUser.last_name,
          email: adminUser.email,
          honorific: adminUser.honorific,
        };
      }

      if (ctx.role === 'student') {
        const studentUser = ctx.user as StudentUser;
        return {
          id: studentUser.id.toString(),
          first_name: studentUser.first_name,
          last_name: studentUser.last_name,
          email: studentUser.email,
        };
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unknown user role',
      });
    }),
});

