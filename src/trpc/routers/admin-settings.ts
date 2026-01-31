import { baseProcedure, createTRPCRouter, adminProcedure } from '../init';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import { TRPCError } from '@trpc/server';
import { randomUUID } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const adminSettingsRouter = createTRPCRouter({
  // Get admin settings
  getSettings: adminProcedure
    .query(async ({ ctx }) => {
      try {
        const adminId = ctx.user.id;
        
        const admin = await prisma.admin.findUnique({
          where: { id: adminId },
          select: {
            profile_picture: true,
            cal_link: true,
            cal_sessions_namespace: true,
            first_name: true,
            last_name: true,
            email: true,
            honorific: true
          }
        });

        if (!admin) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Admin not found'
          });
        }

        // Generate signed URL if profile picture exists and is a path
        let profilePictureUrl = admin.profile_picture;
        if (admin.profile_picture && !admin.profile_picture.startsWith('http')) {
          const { data: signedUrlData, error: signedError } = await supabase.storage
            .from('avatars')
            .createSignedUrl(admin.profile_picture, 3600); // 1 hour

          if (!signedError && signedUrlData) {
            profilePictureUrl = signedUrlData.signedUrl;
          }
        }

        return {
          ...admin,
          profile_picture: profilePictureUrl
        };
      } catch (error) {
        console.error('Error fetching admin settings:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch admin settings'
        });
      }
    }),

  // Update admin settings
  updateSettings: adminProcedure
    .input(z.object({
      cal_link: z.string().optional(),
      cal_sessions_namespace: z.any().optional(),
      profile_picture: z.string().optional(), // base64 string
    }))
    .mutation(async ({ ctx, input }) => {
      const adminId = ctx.user.id;
      
      try {
        let finalAvatarPath: string | null = null;

        // Handle avatar upload if provided
        if (input.profile_picture) {
          console.log('📤 Admin Settings: Uploading avatar file');
          
          // Decode base64
          // Expected format: "data:image/jpeg;base64,..."
          const base64Data = input.profile_picture.split(',')[1];
          if (!base64Data) {
             throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Invalid image data'
            });
          }

          const buffer = Buffer.from(base64Data, 'base64');
          
          // Generate unique filename
          const ext = 'jpg'; 
          const key = randomUUID();
          const fullName = `${ctx.user.first_name}_${ctx.user.last_name}`.replace(/\s+/g, '_');
          // Path structure: admin/[adminName]/avatar-[uuid].jpg
          const path = `admin/${fullName}/avatar-${key}.${ext}`;
          
          // Upload to Supabase Storage (using 'avatars' bucket as seen in setup.ts)
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(path, buffer, {
              cacheControl: '3600',
              upsert: false,
              contentType: 'image/jpeg',
            });
          
          if (uploadError) {
            console.error('❌ Admin avatar upload error:', uploadError);
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to upload avatar',
            });
          }
          
          // Get public URL (optional, but usually we just store the path and let the frontend construct the URL or use a signed URL getter)
          // In setup.ts it seems they store the path.
          finalAvatarPath = path;
        }

        // Prepare update data
        const updateData: any = {};
        if (input.cal_link !== undefined) updateData.cal_link = input.cal_link;
        if (input.cal_sessions_namespace !== undefined) updateData.cal_sessions_namespace = input.cal_sessions_namespace;
        if (finalAvatarPath) updateData.profile_picture = finalAvatarPath;

        // Update admin record in Prisma
        const updatedAdmin = await prisma.admin.update({
          where: { id: adminId },
          data: updateData,
        });

        console.log('✅ Admin Settings: Updated successfully');
        return {
          success: true,
          data: updatedAdmin
        };

      } catch (error) {
        console.error('💥 Admin Settings: Error updating:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update settings'
        });
      }
    }),
});
