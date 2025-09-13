"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getProfilePicture(profilePicturePath: string, studentId: number): Promise<{
  success: boolean;
  imageUrl?: string;
  isAvatar?: boolean;
  error?: string;
  profileBackground?: string;
  }> {
  try {
    if (!profilePicturePath) {
      return {
        success: false,
        error: "No profile picture path provided"
      };
    }

    // Determine if it's an avatar (stored in default/ folder) or personal image (stored in personal/ folder)
    const isAvatar = profilePicturePath.startsWith('default/');
    
    // Generate signed URL for private bucket access
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("avatars")
      .createSignedUrl(profilePicturePath, 3600); // 1 hour expiration

    const {data:profileBackgroundData, error:profileBackgroundError} = await supabase
      .from("students")
      .select("profile_background")
      .eq("id", studentId);

    if (profileBackgroundError) {
      console.error('Error fetching profile background:', profileBackgroundError);
      return {
        success: false,
        error: profileBackgroundError.message
      };
    }

    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError);
      return {
        success: false,
        error: `Failed to create signed URL: ${signedUrlError.message}`
      };
    }
    
    const imageUrl = signedUrlData?.signedUrl || null;
    
    if (!imageUrl) {
      return {
        success: false,
        error: "Failed to generate signed URL for profile picture"
      };
    }

    const profileBackground = profileBackgroundData && profileBackgroundData.length > 0 
      ? profileBackgroundData[0].profile_background 
      : null;

    return {
      success: true,
      imageUrl,
      isAvatar,
      profileBackground
    };

  } catch (error) {
    console.error('Error fetching profile picture:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

