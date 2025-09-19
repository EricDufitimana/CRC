"use server";
function getBaseUrl() {
  if (typeof window !== "undefined") {
    // client side
    return window.location.origin;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL; // full URL
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`; // Vercel auto-provides hostname
  }

  return "http://localhost:3000"; // fallback for local server
}


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
    
    const baseUrl = getBaseUrl();
    console.log('🔗 Base URL:', baseUrl);
    const response = await fetch(`${baseUrl}/api/avatars/get-signed-urls`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Ensure we get fresh signed URLs
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API response not ok:', errorData);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Successfully fetched ${data.avatars?.length || 0} avatars with signed URLs`);

    return {
      success: data.success,
      avatars: data.avatars || [],
      error: data.error
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
    
    const baseUrl = getBaseUrl();
    console.log('🔗 Base URL:', baseUrl);
    const response = await fetch(`${baseUrl}/api/avatars/get-signed-urls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expiresIn }),
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API response not ok:', errorData);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Successfully fetched ${data.avatars?.length || 0} avatars with signed URLs`);

    return {
      success: data.success,
      avatars: data.avatars || [],
      error: data.error
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
