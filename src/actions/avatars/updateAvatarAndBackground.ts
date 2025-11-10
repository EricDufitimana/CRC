"use server";

import { createClient } from "@/utils/supabase/service-role";
import { randomUUID } from "crypto";

interface UpdateAvatarAndBackgroundParams {
  studentId: string;
  userId: string;
  avatarPath?: string;
  avatarFile?: File;
  profileBackground?: string;
}

interface UpdateAvatarAndBackgroundResult {
  success: boolean;
  data?: {
    avatarPath: string;
    profileBackground: string;
  };
  error?: string;
}

export async function updateAvatarAndBackground({
  studentId,
  userId,
  avatarPath,
  avatarFile,
  profileBackground,
}: UpdateAvatarAndBackgroundParams): Promise<UpdateAvatarAndBackgroundResult> {
  console.log('🚀 updateAvatarAndBackground: Starting update process', {
    studentId,
    userId,
    avatarPath,
    hasAvatarFile: !!avatarFile,
    profileBackground
  });

    try {
      const supabase = await createClient();
      
      // Use the passed studentId directly (already validated in layout)
    console.log('🔍 updateAvatarAndBackground: Using studentId:', {
      studentId,
      studentIdType: typeof studentId,
      parsedStudentId: parseInt(studentId)
    });

    let finalAvatarPath: string | null = null;

    // Handle avatar update (either file upload or path selection)
    if (avatarFile) {
      console.log('📤 updateAvatarAndBackground: Uploading new avatar file');
      
      try {
        // Create a safe filename
        const ext = avatarFile.name.split('.').pop() ?? 'jpg';
        const key = randomUUID();
        const currentDate = new Date().toISOString().split('T')[0];
        const path = `student-${studentId}/${currentDate}/${key}.${ext}`;

        console.log('🔍 updateAvatarAndBackground: File upload details:', {
          originalName: avatarFile.name,
          extension: ext,
          generatedKey: key,
          currentDate,
          uploadPath: path,
          fileSize: avatarFile.size,
          fileType: avatarFile.type
        });

        // Upload the file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: avatarFile.type || "image/jpeg",
          });

        if (uploadError) {
          console.error('❌ updateAvatarAndBackground: File upload failed:', uploadError);
          return { success: false, error: 'Failed to upload avatar file' };
        }

        console.log('✅ updateAvatarAndBackground: File uploaded successfully to path:', path);
        
        finalAvatarPath = path;
        console.log('✅ updateAvatarAndBackground: Avatar path stored:', finalAvatarPath);

      } catch (uploadError) {
        console.error('❌ updateAvatarAndBackground: File upload error:', uploadError);
        return { success: false, error: 'Failed to upload avatar file' };
      }

    } else if (avatarPath) {
      console.log('📁 updateAvatarAndBackground: Using existing avatar path:', avatarPath);
      finalAvatarPath = avatarPath;
      console.log('✅ updateAvatarAndBackground: Avatar path stored:', finalAvatarPath);
    }

    // Update student record with new avatar and background
    const updateData: any = {};

    if (finalAvatarPath) {
      updateData.profile_picture = finalAvatarPath;
    }

    // Only update profile_background if provided
    if (profileBackground) {
      updateData.profile_background = profileBackground;
    }

    console.log('💾 updateAvatarAndBackground: Updating student record:', updateData);

    const { data: updatedStudent, error: updateError } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', parseInt(studentId))
      .select('profile_picture, profile_background')
      .single();

    if (updateError || !updatedStudent) {
      console.error('❌ updateAvatarAndBackground: Database update failed:', updateError);
      return { success: false, error: 'Failed to update profile in database' };
    }

    console.log('✅ updateAvatarAndBackground: Student record updated successfully:', updatedStudent);

    return {
      success: true,
      data: {
        avatarPath: updatedStudent.profile_picture || '',
        profileBackground: updatedStudent.profile_background || profileBackground || ''
      }
    };

  } catch (error) {
    console.error('💥 updateAvatarAndBackground: Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}
