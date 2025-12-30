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
        provider: z.enum(['google']),
        redirectTo: z.string(),
        role: z.enum(['admin', 'student']).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      console.log('🔐 [tRPC Auth] getOAuthUrl: Starting OAuth URL generation');
      console.log('🔐 [tRPC Auth] getOAuthUrl: Input:', {
        provider: input.provider,
        redirectTo: input.redirectTo,
        role: input.role,
      });

      const supabase = await createClient();
      
      console.log('🔐 [tRPC Auth] getOAuthUrl: Initiating Supabase OAuth...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: input.provider,
        options: {
          redirectTo: input.redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('❌ [tRPC Auth] getOAuthUrl: OAuth error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to initiate OAuth',
        });
      }

      console.log('✅ [tRPC Auth] getOAuthUrl: OAuth URL generated successfully');
      console.log('🔐 [tRPC Auth] getOAuthUrl: Redirect URL:', input.redirectTo);
      return { url: data.url };
    }),

  // Sign in with email and password
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
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Server configuration error: SUPER_ADMIN_USER_ID not configured',
        });
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
        
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'User ID does not match required admin ID',
        });
      }
    }),

  // Check if user exists in students table
  checkUserExists: baseProcedure
    .input(
      z.object({
        userId: z.string(),
        table: z.enum(['students']),
      }),
    )
    .query(async ({ input }) => {
      if (input.table === 'students') {
        const student = await prisma.students.findFirst({
          where: {
            user_id: input.userId,
          },
          select: {
            id: true,
          },
        });

        return { exists: !!student };
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
      
      // Use service role client to bypass RLS
      const supabase = createServiceRoleClient();
      
      console.log('🔍 [tRPC Auth] checkSetupStatus: Querying profiles table...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('has_setup')
        .eq('user_id', input.userId)
        .single();

      if (profileError) {
        console.error('❌ [tRPC Auth] checkSetupStatus: Error fetching profile:', profileError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user profile',
        });
      }

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

