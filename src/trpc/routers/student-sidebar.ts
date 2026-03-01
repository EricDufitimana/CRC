import { createTRPCRouter, studentProcedure } from "../init";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role key required for listing
);
export const studentSidebarRouter = createTRPCRouter({

  getStudentData: studentProcedure
    .query(async ({ ctx }) => {
      try {
        const userId = ctx.user.user_id;
        // Query the students table to find the student with matching user_id
        const { data: student, error } = await supabase
          .from('students')
          .select('id, student_id, first_name, last_name, email, profile_picture, date_of_registration, user_id, grade, major_full, major_short, gpa, crc_class_id, profile_background')
          .eq('user_id', userId);

        // Check if student was found
        if (!student || student.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Student not found" });
        }

        // Return just the student ID
        const full_name = [student[0].first_name, student[0].last_name].filter(Boolean).join(' ');
        const responseData = {
          studentId: student[0].id,
          student_id: student[0].student_id,
          full_name: full_name,
          first_name: student[0].first_name,
          last_name: student[0].last_name,
          email: student[0].email,
          profile_picture: student[0].profile_picture,
          date_of_registration: student[0].date_of_registration,
          user_id: student[0].user_id,
          grade: student[0].grade,
          major_full: student[0].major_full,
          major_short: student[0].major_short,
          gpa: student[0].gpa,
          crc_class_id: student[0].crc_class_id,
          profile_background: student[0].profile_background
        };
        return responseData;
      } catch (error) {
        console.error("❌ Error fetching student data:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error fetching student data" });
      }
    }),


  updateAvatar: studentProcedure
    .input(z.object({
      avatarPath: z.string().optional(),
      profileBackground: z.string().optional(),
      avatarFile: z.object({
        name: z.string(),
        type: z.string(),
        size: z.number(),
        base64: z.string(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const studentId = ctx.user.id;
      const { avatarFile, avatarPath, profileBackground } = input;

      try {
        let finalAvatarPath: string | null = null;

        if (avatarFile) {
          console.log('📤 uploadAvatar: Uploading new avatar file');

          // Decode base64 and handle upload
          const base64Data = avatarFile.base64.split(',')[1]; // Remove data:image/png;base64, prefix
          const buffer = Buffer.from(base64Data, 'base64');

          // Create a safe filename
          const ext = avatarFile.name.split('.').pop() ?? 'jpg';
          const key = randomUUID();
          const currentDate = new Date().toISOString().split('T')[0];
          const path = `student-${studentId}/${currentDate}/${key}.${ext}`;

          console.log('🔍 uploadAvatar: File upload details:', {
            originalName: avatarFile.name,
            extension: ext,
            generatedKey: key,
            currentDate,
            uploadPath: path,
            fileSize: avatarFile.size,
            fileType: avatarFile.type
          });

          // Upload the buffer to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(path, buffer, {
              cacheControl: "3600",
              upsert: false,
              contentType: avatarFile.type || "image/jpeg",
            });

          if (uploadError) {
            console.error('❌ Upload error:', uploadError);
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to upload avatar file',
            });
          }

          finalAvatarPath = path;
          console.log('✅ Avatar uploaded successfully:', path);

        } else if (avatarPath) {
          // User selected an existing avatar
          console.log('🎯 Using existing avatar path:', avatarPath);
          finalAvatarPath = avatarPath;
        }

        // Update student record
        const updateData: any = {};
        if (finalAvatarPath) updateData.profile_picture = finalAvatarPath;
        if (profileBackground) updateData.profile_background = profileBackground;

        if (Object.keys(updateData).length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Nothing to update',
          });
        }

        console.log('💾 Updating student record:', updateData);

        const { data: updatedStudent, error: updateError } = await supabase
          .from('students')
          .update(updateData)
          .eq('id', studentId)
          .select('profile_picture, profile_background')
          .single();

        if (updateError || !updatedStudent) {
          console.error('❌ Database update error:', updateError);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update student profile',
          });
        }

        console.log('✅ Student profile updated successfully');

        return {
          success: true,
          data: {
            avatarPath: updatedStudent.profile_picture || '',
            profileBackground: updatedStudent.profile_background || '',
          }
        };

      } catch (error) {
        console.error('💥 updateAvatar: Unexpected error:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Unexpected error occurred',
        });
      }
    }),

  getProfilePicture: studentProcedure
    .input(z.object({
      profilePicturePath: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { profilePicturePath } = input;
      const studentId = ctx.user?.id;
      try {
        if (!profilePicturePath) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Profile Picture Path Not Provided'
          })
        }

        // If the stored value is already an absolute URL (DiceBear, etc.) — use it directly
        const isExternalUrl = profilePicturePath.startsWith('http://') || profilePicturePath.startsWith('https://');
        const isAvatar = isExternalUrl ? true : profilePicturePath.startsWith('default/');

        // Get profile background
        const { data: profileBackgroundData, error: profileBackgroundError } = await supabase
          .from("students")
          .select("profile_background")
          .eq("id", studentId);

        if (profileBackgroundError) {
          console.error('Error fetching profile background:', profileBackgroundError);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: profileBackgroundError.message
          });
        }

        const profileBackground = profileBackgroundData && profileBackgroundData.length > 0
          ? profileBackgroundData[0].profile_background
          : null;

        // Return external URL directly — no Supabase Storage call needed
        if (isExternalUrl) {
          return {
            success: true,
            imageUrl: profilePicturePath,
            isAvatar,
            profileBackground
          };
        }

        // Relative path — generate a signed URL from Supabase Storage
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from("avatars")
          .createSignedUrl(profilePicturePath, 3600);

        if (signedUrlError) {
          console.error('Error creating signed URL:', signedUrlError);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error creating signed URL'
          })
        }

        const imageUrl = signedUrlData?.signedUrl || null;

        if (!imageUrl) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: "Failed to generate signed URL for profile picture"
          });
        }

        return {
          success: true,
          imageUrl,
          isAvatar,
          profileBackground
        };

      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : "Unknown error occurred"
        });
      }
    }),
});