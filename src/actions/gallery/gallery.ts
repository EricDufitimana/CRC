"use server";
import { createClient } from '@supabase/supabase-js';
import {uploadToCloudinary} from "@/lib/cloudinary";
import {revalidatePath} from "next/cache";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// New function to upload images to Supabase Storage
export async function uploadImagesToSupabase(formData: FormData, eventId: string, eventTitle?: string, eventDate?: string) {
  try {
    const files = formData.getAll('images') as File[];
    if (files.length === 0) {
      return {
        success: false,
        message: "No images uploaded"
      }
    }

    console.log("📤 Uploading", files.length, "images to Supabase Storage...");

    // Create event folder for images with event title and date
    let eventFolderName;
    if (eventTitle && eventDate) {
      // Clean the title for folder name (remove special characters, limit length)
      const cleanTitle = eventTitle
        .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .toLowerCase()
        .substring(0, 50); // Limit to 50 characters
      
      // Format date for folder name (YYYY-MM-DD)
      const formattedDate = new Date(eventDate).toISOString().split('T')[0];
      
      eventFolderName = `${cleanTitle}-${formattedDate}-${eventId}`;
    } else {
      // Fallback to timestamp-based naming
      eventFolderName = `event-${eventId}-${Date.now()}`;
    }
    
    // Upload each file to Supabase Storage
    const uploadPromises = files.map(async (file, index) => {
      try {
        const fileName = `image-${index + 1}-${file.name}`;
        const filePath = `${eventFolderName}/${fileName}`;
        
        const { data, error } = await supabase.storage
          .from('events-gallery')
          .upload(filePath, file);

        if (error) {
          console.error(`❌ Error uploading image ${index + 1}:`, error);
          return null;
        }

        console.log(`✅ Uploaded image ${index + 1}:`, data.path);
        
        return {
          path: data.path,
          name: file.name,
          isHero: index === 0, // First image is hero
          alt: file.name
        };
      } catch (error) {
        console.error(`❌ Error uploading image ${index + 1}:`, error);
        return null;
      }
    });

    const results = await Promise.allSettled(uploadPromises);
    const successfulUploads = results
      .filter(r => r.status === 'fulfilled' && r.value !== null)
      .map(r => (r as PromiseFulfilledResult<any>).value);

    if (successfulUploads.length === 0) {
      return {
        success: false,
        message: "All images failed to upload"
      }
    }

    console.log("✅ Successfully uploaded", successfulUploads.length, "images to Supabase Storage");

    // Update event's gallery folder in Supabase
    const { error: updateError } = await supabase
      .from('events')
      .update({ gallery_folder: eventFolderName })
      .eq('id', parseInt(eventId));

    if (updateError) {
      console.error("❌ Error updating event gallery folder:", updateError);
      return {
        success: false,
        message: "Images uploaded but failed to update event gallery folder"
      };
    }

    revalidatePath(`/dashboard/admin/events-management`);

    return {
      success: true,
      images: successfulUploads,
      folderPath: eventFolderName,
      message: `Successfully uploaded ${successfulUploads.length} image(s)${
        successfulUploads.length < files.length ? 
        `. ${files.length - successfulUploads.length} upload(s) failed.` : ''
      }`
    }
  } catch (error) {
    console.error("Error uploading images to Supabase:", error);
    return {
      success: false,
      message: "Failed to upload images to Supabase"
    }
  }
}

// Legacy function - use uploadImagesToSupabase instead
export async function uploadImages(formData: FormData, eventId: string){
  console.warn("uploadImages is deprecated. Use uploadImagesToSupabase instead.");
  return uploadImagesToSupabase(formData, eventId);
}

export async function deleteImage(eventId:string, imagePath:string){
  try{
    // Remove from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from('events-gallery')
      .remove([imagePath]);

    if (deleteError) {
      console.error("Error deleting image from Supabase Storage:", deleteError);
      return {
        success: false,
        message: "Failed to delete image from storage"
      };
    }

    // Note: Since we're using folder-based storage, we don't need to update the events table
    // The gallery_folder column stores the folder path, not individual image paths
    
    revalidatePath(`/dashboard/admin/events-management`);
    return{
      success: true,
      message: "Image deleted successfully"
    }
  }catch(error){
    console.error("Error deleting image:", error);
    return {
      success: false,
      message: "Failed to delete image"
    };
  }
}