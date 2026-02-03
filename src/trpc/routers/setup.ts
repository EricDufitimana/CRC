import { baseProcedure, createTRPCRouter, studentProcedure } from '../init';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { randomUUID } from 'crypto';

// Interface for student data from Supabase
interface StudentData {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  profile_picture?: string;
  date_of_registration?: string;
  user_id?: string;
  grade?: string;
  major_full?: string;
  major_short?: string;
  gpa?: string;
  gender?: string;
  crc_class_id?: number;
  profile_background?: string;
  academic_report_path?: string;
  resume_link?: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const setupRouter = createTRPCRouter({
  // Get student data for setup page
  getStudentData: baseProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ input }): Promise<StudentData> => {
      try {
        const { data: student, error } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', input.userId)
          .single();

        if (error || !student) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Student not found'
          });
        }

        return student as StudentData;
      } catch (error) {
        console.error('Error fetching student data:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch student data'
        });
      }
    }),

  // Update student profile during setup
  updateProfile: studentProcedure
    .input(z.object({
      avatar_path: z.string().optional(),
      avatar: z.string().optional(), // base64 string
      academic_report: z.string().optional(), // base64 string
      academic_report_name: z.string().optional(), // original filename
      resume_link: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const studentId = ctx.user.id;
      const userId = ctx.user.user_id;
      
      try {
        // Fetch student data to get name information
        console.log("1. Fetching student data")
        const student = await prisma.students.findUnique({
          where: { id: studentId },
          select: {
            first_name: true,
            last_name: true,
            student_id: true,
          },
        });

        if (!student) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Student not found'
          });
        }

        let finalAvatarPath: string | null = null;

        // Handle avatar upload
        if (input.avatar) {
          console.log('📤 Setup: Uploading avatar file');
          
          // Decode base64
          const base64Data = input.avatar.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          
          // Generate unique filename
          const ext = 'jpg'; // Default extension
          const key = randomUUID();
          const currentDate = new Date().toISOString().split('T')[0];
          const path = `student-${studentId}/${currentDate}/avatar-${key}.${ext}`;

          console.log("2. Uploading the picture to the database")
          
          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(path, buffer, {
              cacheControl: '3600',
              upsert: false,
              contentType: 'image/jpeg',
            });
          
          if (uploadError) {
            console.error('❌ Avatar upload error:', uploadError);
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to upload avatar',
            });
          }
          
          finalAvatarPath = path;
        } else if (input.avatar_path) {
          finalAvatarPath = input.avatar_path;
        }

        // Handle academic report upload
        let academicReportPath: string | null = null;
        if (input.academic_report) {
          console.log('📄 Setup: Uploading academic report');
          
          const base64Data = input.academic_report.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          
          const currentDate = new Date().toISOString().split('T')[0];
          
          // Create student name path: FirstName_LastName_StudentID
          const studentNamePath = `${student.first_name}_${student.last_name}_${student.student_id}`;
          
          // Use original filename or fallback to report.pdf
          const fileName = input.academic_report_name || 'report.pdf';
          const path = `${studentNamePath}/${currentDate}/${fileName}`;
          console.log("3. Uploading report to the storage")
          
          const { error: uploadError } = await supabase.storage
            .from('reports')
            .upload(path, buffer, {
              cacheControl: '3600',
              upsert: false,
              contentType: 'application/pdf',
            });
          
          if (uploadError) {
            console.error('❌ Academic report upload error:', uploadError);
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to upload academic report',
            });
          }
          
          academicReportPath = path;
        }

        // Update student record
        const updateData: any = {};
        if (finalAvatarPath) updateData.profile_picture = finalAvatarPath;
        if (academicReportPath) updateData.academic_report_path = academicReportPath;
        if (input.resume_link) updateData.resume_link = input.resume_link;

        console.log("5. Updating Student Data")

        const { data: updatedStudent, error: updateError } = await supabase
          .from('students')
          .update(updateData)
          .eq('id', studentId)
          .select()
          .single();

        if (updateError || !updatedStudent) {
          console.error('❌ Student update error:', updateError);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update student profile',
          });
        }

        console.log('✅ Setup: Profile updated successfully');
        return {
          success: true,
          data: updatedStudent
        };

      } catch (error) {
        console.error('💥 Setup: Error updating profile:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update profile'
        });
      }
    }),

  // Mark setup as completed
  markSetupCompleted: studentProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.user.user_id;
      
      if (!userId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User ID is required'
        });
      }
      
      try {
        // Update user metadata to mark setup as completed
        const { error } = await supabase.auth.admin.updateUserById(
          userId,
          { user_metadata: { setup_completed: true } }
        );

        if (error) {
          console.error('❌ Error marking setup completed:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to mark setup as completed'
          });
        }

        console.log('✅ Setup: Marked as completed for user:', userId);
        return { success: true };

      } catch (error) {
        console.error('💥 Setup: Error marking setup completed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark setup as completed'
        });
      }
    }),
});
