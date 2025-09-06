"use server";
import {client} from "@/sanity/lib/client";
import {writeClient} from "@/sanity/lib/writeClient";
import {uploadToCloudinary} from "@/lib/cloudinary";
import {revalidatePath} from "next/cache";

// New function to upload images directly to Sanity
export async function uploadImagesToSanity(formData: FormData, eventId: string) {
  try {
    const files = formData.getAll('images') as File[];
    if (files.length === 0) {
      return {
        success: false,
        message: "No images uploaded"
      }
    }

    console.log("📤 Uploading", files.length, "images to Sanity...");

    // Upload each file to Sanity
    const uploadPromises = files.map(async (file, index) => {
      try {
        // Convert file to base64 for Sanity
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        
        // Create image asset in Sanity
        const imageAsset = await writeClient.assets.upload('image', buffer, {
          filename: file.name,
          contentType: file.type,
        });

        console.log(`✅ Uploaded image ${index + 1}:`, imageAsset._id);
        
        return {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id
          },
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

    console.log("✅ Successfully uploaded", successfulUploads.length, "images to Sanity");

    // Wait for Sanity document to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update event gallery in sanity
    await writeClient
      .patch(eventId)
      .setIfMissing({gallery: []})
      .append('gallery', successfulUploads)
      .commit({autoGenerateArrayKeys: true});

    revalidatePath(`/dashboard/admin/events-management`);

    return {
      success: true,
      images: successfulUploads,
      message: `Successfully uploaded ${successfulUploads.length} image(s)${
        successfulUploads.length < files.length ? 
        `. ${files.length - successfulUploads.length} upload(s) failed.` : ''
      }`
    }
  } catch (error) {
    console.error("Error uploading images to Sanity:", error);
    return {
      success: false,
      message: "Failed to upload images to Sanity"
    }
  }
}

export async function uploadImages(formData: FormData, eventId: string){
  try{
    const files = formData.getAll('images') as File[];
    if (files.length === 0){
      return{
        success: false,
        message: "No images uploaded"
      }
    }

    // Use Promise.allSettled to handle partial successes
    const uploadPromises = files.map(async (file) => {
      try{
        const result = await uploadToCloudinary(file, `events/${eventId}`);
        return result;  
      }catch(error){
        console.error("Error uploading image:", error);
        return null;
      }
    });

    const results = await Promise.allSettled(uploadPromises);
    const successfulUploads = results
      .filter(r => r.status === 'fulfilled' && r.value !== null)
      .map(r => (r as PromiseFulfilledResult<any>).value);

    if(successfulUploads.length === 0){
      return{
        success: false,
        message: "All images failed to upload"
      }
    }

    // Creating image objects for sanity
    const imageObjects = successfulUploads.map((result: any) => ({
      url: result.secure_url,
      public_id: result.public_id,
      alt: result.original_filename || "Event Image",
      isHero: false 
    }));

    // Wait for Sanity document to be ready before updating
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update event gallery in sanity
    await writeClient
      .patch(eventId)
      .setIfMissing({gallery: []})
      .append('gallery', imageObjects)
      .commit({autoGenerateArrayKeys: true});

    revalidatePath(`/dashboard/admin/events-management`);

    return{
      success: true,
      images: imageObjects,  
      message: `Successfully uploaded ${successfulUploads.length} image(s)${
        successfulUploads.length < files.length ? 
        `. ${files.length - successfulUploads.length} upload(s) failed.` : ''
      }`
    }
  }catch(error){
    console.error("Error uploading images:", error);
    return{
      success: false,
      message: "Failed to upload images"
    }
  }
}

export async function deleteImage(eventId:string, publicId:string){
  try{
    //remove from cloudinary
    await import('cloudinary').then(({v2: cloudinary}) => {
      return cloudinary.uploader.destroy(publicId);
    })
    //remove from sanity
    const event = await client.fetch(`*[_type=="events" && _id==$eventId[0]]`, {eventId})
    if(event?.gallery){
      const updatedGallery = event.gallery.filter((img:any) => img.public_id !== publicId);
      await writeClient
        .patch(eventId)
        .set({gallery:updatedGallery})
        .commit();
    } 
    revalidatePath(`/dashboard/admin/events-management`);
    return{
      success:true,
      message:"Image deleted successfully"
    }
  }catch(error){
    console.error("Error deleting image:", error);
  }
}