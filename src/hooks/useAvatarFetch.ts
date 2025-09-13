import { useState, useCallback } from 'react';
import { getAvatars, AvatarData as BaseAvatarData } from '@/actions/avatars/getAvatars';
import { getAvatarsWithSignedUrls, AvatarData } from '@/actions/avatars/getAvatarsWithSignedUrls';

interface UseAvatarFetchResult {
  avatars: (AvatarData | BaseAvatarData)[];
  isLoading: boolean;
  error: string | null;
  fetchAvatars: () => Promise<void>;
}

export const useAvatarFetch = (): UseAvatarFetchResult => {
  const [avatars, setAvatars] = useState<(AvatarData | BaseAvatarData)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvatars = useCallback(async () => {
    console.log('🚀 useAvatarFetch: Starting avatar fetch...');
    setIsLoading(true);
    setError(null);

    try {
      // Try signed URLs first
      console.log('📡 useAvatarFetch: Attempting to fetch avatars with signed URLs...');
      const signedResult = await getAvatarsWithSignedUrls();
      
      if (signedResult.success && signedResult.avatars.length > 0) {
        console.log(`✅ useAvatarFetch: Fetched ${signedResult.avatars.length} avatars with signed URLs`);
        setAvatars(signedResult.avatars);
        return;
      }

      console.log('⚠️ useAvatarFetch: Signed URLs failed, trying public URLs...');
      
      // Fallback to public URLs
      const publicResult = await getAvatars();
      
      if (publicResult.success) {
        console.log(`✅ useAvatarFetch: Fetched ${publicResult.avatars.length} avatars with public URLs`);
        setAvatars(publicResult.avatars);
      } else {
        throw new Error(publicResult.error || 'Failed to fetch avatars');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('💥 useAvatarFetch: Avatar fetch failed:', errorMessage);
      setError(errorMessage);
      setAvatars([]);
    } finally {
      console.log('🏁 useAvatarFetch: Avatar fetch process completed');
      setIsLoading(false);
    }
  }, []);

  return { avatars, isLoading, error, fetchAvatars };
};
