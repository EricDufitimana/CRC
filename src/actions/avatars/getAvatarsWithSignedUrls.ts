"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role key required for listing
);

export interface AvatarData {
  id: string;
  src: string;
  name: string;
  folder: string;
  fileName: string;
  filePath: string;
}

export async function getAvatarsWithSignedUrls(): Promise<{
  success: boolean;
  avatars: AvatarData[];
  error?: string;
}> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase environment variables");
    }

    const allAvatars: AvatarData[] = [];
    const expiresIn = 3600; // 1 hour

    console.log("📁 Fetching images directly from default/ folder...");
    
    // 1. List all files directly in the default/ folder
    const { data: files, error: listError } = await supabase.storage
      .from("avatars")
      .list("default", { limit: 100, offset: 0 });

    console.log("📁 Files in default/ folder:", { files, listError });

    if (listError) {
      console.error("❌ Error listing files in default/ folder:", listError);
      throw listError;
    }

    if (!files) {
      console.log("⚠️ No files found in default/ folder");
      return { success: true, avatars: [] };
    }

    console.log(`📁 Found ${files.length} files in default/ folder`);

    // 2. Filter for image files and create signed URLs
    const imageFiles = files.filter((f) => f.name.match(/\.(jpg|jpeg|png|gif|webp)$/i));
    console.log(`🖼️ Filtered to ${imageFiles.length} image files`);
    console.log(`🖼️ Image files:`, imageFiles.map(f => f.name));

    let avatarCounter = 1; // Start counter at 1

    for (const file of imageFiles) {
      const filePath = `default/${file.name}`;
      console.log(`🔗 Creating signed URL for: ${filePath}`);
      
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("avatars")
        .createSignedUrl(filePath, expiresIn);

      if (signedUrlError) {
        console.error(`❌ Error creating signed URL for ${filePath}:`, signedUrlError);
        continue;
      }

      console.log(`✅ Created signed URL for ${filePath}`);

      allAvatars.push({
        id: `avatar-${avatarCounter}`,
        src: signedUrlData.signedUrl,
        name: `Avatar ${avatarCounter}`,
        folder: "default",
        fileName: file.name,
        filePath,
      });
      
      avatarCounter++; // Increment counter for next avatar
    }

    console.log(`✅ Fetched ${allAvatars.length} avatars`);
    return { success: true, avatars: allAvatars };
  } catch (error) {
    console.error("❌ Error fetching avatars:", error);
    return {
      success: false,
      avatars: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
