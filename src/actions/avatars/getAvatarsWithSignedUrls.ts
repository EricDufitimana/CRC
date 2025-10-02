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

    console.log("📁 Fetching root folders in default/...");
    // 1. List all folders under default/
    const { data: folders, error: folderError } = await supabase.storage
      .from("avatars")
      .list("default", { limit: 100, offset: 0 });

    if (folderError) throw folderError;
    if (!folders) return { success: true, avatars: [] };

    // 2. Loop through each folder
    for (const folder of folders) {
      if (!folder.name || !folder.metadata?.isDirectory) continue;

      console.log(`📂 Checking folder: ${folder.name}`);

      // 3. List files inside each folder
      const { data: files, error: listError } = await supabase.storage
        .from("avatars")
        .list(`default/${folder.name}`, { limit: 100, offset: 0 });

      if (listError) {
        console.error(`❌ Error listing files in ${folder.name}:`, listError);
        continue;
      }

      if (files && files.length > 0) {
        const imageFiles = files.filter((f) => f.name.match(/\.(jpg|jpeg|png|gif|webp)$/i));

        for (const file of imageFiles) {
          const filePath = `default/${folder.name}/${file.name}`;
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from("avatars")
            .createSignedUrl(filePath, expiresIn);

          if (signedUrlError) {
            console.error(`❌ Error creating signed URL for ${filePath}:`, signedUrlError);
            continue;
          }

          allAvatars.push({
            id: `${folder.name}-${file.name}`,
            src: signedUrlData.signedUrl,
            name: `Avatar ${folder.name}-${file.name.split(".")[0]}`,
            folder: folder.name,
            fileName: file.name,
            filePath,
          });
        }
      }
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
