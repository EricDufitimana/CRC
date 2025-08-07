import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export {cloudinary};

export async function uploadToCloudinary(file: File, folder?: string) {
  // Add file size check
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB
  if (file.size > MAX_SIZE) {
    console.warn(`File ${file.name} is too large (${file.size} bytes)`);
    throw new Error(`File ${file.name} is too large. Maximum size is 2MB.`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async () => {
      try {
        const result = await cloudinary.uploader.upload(reader.result as string, {
          folder: folder || 'event-images',
          resource_type: 'auto',
          transformation: [
            {width: 1024, height: 1024, crop: 'limit'},
            {quality: 'auto'},
            {format: 'auto'}
          ]
        });
        resolve(result);
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        reject(error);
      }
    };
    
    reader.onerror = error => {
      console.error('FileReader error:', error);
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
}