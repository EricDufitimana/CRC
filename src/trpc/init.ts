import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import superjson from 'superjson';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
export type AdminUser = {
  id: bigint;
  user_id: string;
  honorific: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  role: string; // or specific role type
}

export type StudentUser = {
  id: bigint;
  user_id: string | null;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  profile_picture: string | null;
  date_of_registration: Date | null;
  grade: string | null;
  major_full: string | null;
  major_short: string | null;
  gpa: string | null;
  crc_class_id: bigint | null;
  gender: string | null;
}

type Context = {
  user: AdminUser | StudentUser | null;
  role: 'admin' | 'student' | null;
}
export const createTRPCContext = async (): Promise<Context> => {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('🔧 [Context] Creating tRPC context');
    console.log('🔧 [Context] Auth user:', user?.id);
    console.log('🔧 [Context] Auth error:', authError);
    
    // Allow unauthenticated access for public resources
    if (authError || !user) {
      console.log('⚠️ [Context] No authenticated user');
      return { user: null, role: null };
    }
    
    const adminUser = await prisma.admin.findFirst({
      where: {
        user_id: user.id,
      },
      select: {
        id: true,
        user_id: true,
        honorific: true,
        first_name: true,
        last_name: true,
        role: true,
        email: true,
      }
    });
    
    if (adminUser) {
      console.log('✅ [Context] Found admin user:', adminUser.id);
      return { user: adminUser, role: 'admin' };
    }
    
    const studentUser = await prisma.students.findFirst({
      where: {
        user_id: user.id,
      },
      select: {
        id: true,
        user_id: true,
        student_id: true,
        first_name: true,
        last_name: true,
        email: true,
        profile_picture: true,
        date_of_registration: true,
        grade: true,
        major_full: true,
        major_short: true,
        gpa: true,
        crc_class_id: true,
        gender: true,
      }
    });
    
    if (studentUser) {
      console.log('✅ [Context] Found student user:', studentUser.id);
      return { user: studentUser, role: 'student' };
    }
    
    console.log('⚠️ [Context] User authenticated but no admin/student record found');
    return { user: null, role: null };
    
  } catch (error) {
    console.error('❌ [Context] Error creating context:', error);
    return { user: null, role: null };
  }
};

export const getServerContext = cache(createTRPCContext);

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

// Protected Procedure
export const protectedProcedure = t.procedure.use(({ctx, next}) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user,
      role: ctx.role,
    },
  });
})

// Admin Procedure
export const adminProcedure = protectedProcedure.use(({ctx, next}) => {
  if (ctx.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({
    ctx: {
      user: ctx.user as AdminUser,
      role: ctx.role as const,
    },
  });
})

// Student Procedure
export const studentProcedure = protectedProcedure.use(({ctx, next}) => {
  if (ctx.role !== 'student') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({
    ctx: {
      user: ctx.user as StudentUser,
      role: ctx.role as const,
    },
  });
})