"use server";

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for server actions
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
    console.log('🔄 Fetching avatars with signed URLs...');
    
    // Check if Supabase client is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing Supabase environment variables');
      throw new Error('Server configuration error: Missing Supabase credentials');
    }

    const avatarFolders = ['1', '2', '3', '4'];
    const allAvatars: AvatarData[] = [];
    const expiresIn = 3600; // 1 hour

    console.log('📁 Fetching avatars from folders:', avatarFolders);

    for (const folder of avatarFolders) {
      try {
        // List files in the folder
        const { data: files, error: listError } = await supabase.storage
          .from('avatars')
          .list(`default/${folder}`, {
            limit: 100,
            offset: 0,
          });

        if (listError) {
          console.error(`❌ Error listing files in folder ${folder}:`, listError);
          continue;
        }

        if (files && files.length > 0) {
          // Filter for image files
          const imageFiles = files.filter(file => 
            file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
          );

          console.log(`📸 Found ${imageFiles.length} images in folder ${folder}`);

          // Create signed URLs for each image
          for (const file of imageFiles) {
            const filePath = `default/${folder}/${file.name}`;
            
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
              .from('avatars')
              .createSignedUrl(filePath, expiresIn);

            if (signedUrlError) {
              console.error(`❌ Error creating signed URL for ${filePath}:`, signedUrlError);
              continue;
            }

            allAvatars.push({
              id: `${folder}-${file.name}`,
              src: signedUrlData.signedUrl,
              name: `Avatar ${folder}-${file.name.split('.')[0]}`,
              folder: folder,
              fileName: file.name,
              filePath: filePath
            });
          }
        }
      } catch (folderError) {
        console.error(`❌ Error processing folder ${folder}:`, folderError);
        continue;
      }
    }

    console.log(`✅ Successfully fetched ${allAvatars.length} avatar signed URLs`);

    return {
      success: true,
      avatars: allAvatars,
    };
  } catch (error) {
    console.error('❌ Error fetching avatars with signed URLs:', error);
    return {
      success: false,
      avatars: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Alternative function that accepts custom expiration time
export async function getAvatarsWithSignedUrlsCustom(expiresIn: number = 3600): Promise<{
  success: boolean;
  avatars: AvatarData[];
  error?: string;
}> {
  try {
    console.log(`🔄 Fetching avatars with signed URLs (expires in ${expiresIn}s)...`);
    
    // Check if Supabase client is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing Supabase environment variables');
      throw new Error('Server configuration error: Missing Supabase credentials');
    }

    const avatarFolders = ['1', '2', '3', '4'];
    const allAvatars: AvatarData[] = [];

    console.log('📁 Fetching avatars with custom expiration:', expiresIn);

    for (const folder of avatarFolders) {
      try {
        const { data: files, error: listError } = await supabase.storage
          .from('avatars')
          .list(`default/${folder}`, {
            limit: 100,
            offset: 0,
          });

        if (listError) {
          console.error(`❌ Error listing files in folder ${folder}:`, listError);
          continue;
        }

        if (files && files.length > 0) {
          const imageFiles = files.filter(file => 
            file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
          );

          for (const file of imageFiles) {
            const filePath = `default/${folder}/${file.name}`;
            
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
              .from('avatars')
              .createSignedUrl(filePath, expiresIn);

            if (signedUrlError) {
              console.error(`❌ Error creating signed URL for ${filePath}:`, signedUrlError);
              continue;
            }

            allAvatars.push({
              id: `${folder}-${file.name}`,
              src: signedUrlData.signedUrl,
              name: `Avatar ${folder}-${file.name.split('.')[0]}`,
              folder: folder,
              fileName: file.name,
              filePath: filePath
            });
          }
        }
      } catch (folderError) {
        console.error(`❌ Error processing folder ${folder}:`, folderError);
        continue;
      }
    }

    console.log(`✅ Successfully fetched ${allAvatars.length} avatar signed URLs`);

    return {
      success: true,
      avatars: allAvatars,
    };
  } catch (error) {
    console.error('❌ Error fetching avatars with signed URLs:', error);
    return {
      success: false,
      avatars: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
