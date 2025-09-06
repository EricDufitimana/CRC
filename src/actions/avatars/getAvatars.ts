"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export interface AvatarData {
  id: string;
  src: string;
  name: string;
  folder: string;
}

export async function getAvatars(): Promise<{
  success: boolean;
  avatars: AvatarData[];
  error?: string;
}> {
  try {
    const avatarFolders = ['1', '2', '3', '4'];
    const allAvatars: AvatarData[] = [];

    for (const folder of avatarFolders) {
      const { data, error } = await supabaseAdmin.storage
        .from('avatars')
        .list(`default/${folder}`, {
          limit: 100,
          offset: 0,
        });

      if (error) {
        console.error(`Error fetching avatars from folder ${folder}:`, error);
        continue;
      }

      if (data) {
        const folderAvatars = data
          .filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
          .map(file => ({
            id: `${folder}-${file.name}`,
            src: supabaseAdmin.storage.from('avatars').getPublicUrl(`default/${folder}/${file.name}`).data.publicUrl,
            name: `Avatar ${folder}-${file.name.split('.')[0]}`,
            folder: folder
          }));
        
        allAvatars.push(...folderAvatars);
      }
    }

    return {
      success: true,
      avatars: allAvatars
    };
  } catch (error) {
    console.error('Error fetching avatars:', error);
    return {
      success: false,
      avatars: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
