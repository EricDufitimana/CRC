import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    console.log('🔍 API: get-avatar-signed-urls called');
    
    // Check if Supabase client is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing Supabase environment variables');
      return NextResponse.json({ 
        error: 'Server configuration error: Missing Supabase credentials' 
      }, { status: 500 });
    }

    const avatarFolders = ['1', '2', '3', '4'];
    const allAvatars = [];
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

    return NextResponse.json({
      success: true,
      avatars: allAvatars,
      count: allAvatars.length,
      expiresIn: expiresIn
    });

  } catch (error) {
    console.error('❌ Error in get-avatar-signed-urls API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message,
      avatars: []
    }, { status: 500 });
  }
}

// Also support POST method for consistency with other APIs
export async function POST(request) {
  try {
    const { expiresIn = 3600 } = await request.json();
    
    // Use the same logic as GET but with custom expiration
    const avatarFolders = ['1', '2', '3', '4'];
    const allAvatars = [];

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

    return NextResponse.json({
      success: true,
      avatars: allAvatars,
      count: allAvatars.length,
      expiresIn: expiresIn
    });

  } catch (error) {
    console.error('❌ Error in get-avatar-signed-urls POST API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message,
      avatars: []
    }, { status: 500 });
  }
}
