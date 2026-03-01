import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const profilePictureRouter = createTRPCRouter({
  getProfilePicture: baseProcedure
    .input(z.object({
      profilePicturePath: z.string(),
      studentId: z.number(),
    }))
    .query(async ({ input }) => {
      try {
        const { profilePicturePath, studentId } = input;

        if (!profilePicturePath) {
          return {
            success: false,
            error: "No profile picture path provided"
          };
        }

        // If the stored value is already an absolute URL (DiceBear, etc.) — use it directly
        const isExternalUrl = profilePicturePath.startsWith('http://') || profilePicturePath.startsWith('https://');
        const isAvatar = isExternalUrl ? true : profilePicturePath.startsWith('default/');

        const { data: profileBackgroundData, error: profileBackgroundError } = await supabase
          .from("students")
          .select("profile_background")
          .eq("id", studentId);

        if (profileBackgroundError) {
          console.error('Error fetching profile background:', profileBackgroundError);
          return { success: false, error: profileBackgroundError.message };
        }

        const profileBackground = profileBackgroundData && profileBackgroundData.length > 0
          ? profileBackgroundData[0].profile_background
          : null;

        // Return external URL directly — no Supabase Storage call needed
        if (isExternalUrl) {
          return { success: true, imageUrl: profilePicturePath, isAvatar, profileBackground };
        }

        // Relative path — generate a signed URL from Supabase Storage
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from("avatars")
          .createSignedUrl(profilePicturePath, 3600); // 1 hour expiration

        if (signedUrlError) {
          console.error('Error creating signed URL:', signedUrlError);
          return { success: false, error: `Failed to create signed URL: ${signedUrlError.message}` };
        }

        const imageUrl = signedUrlData?.signedUrl || null;

        if (!imageUrl) {
          return { success: false, error: "Failed to generate signed URL for profile picture" };
        }

        return { success: true, imageUrl, isAvatar, profileBackground };

      } catch (error) {
        console.error('Error fetching profile picture:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error occurred"
        };
      }
    }),
});
