
import { useState, useCallback } from 'react';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
interface UseAvatarFetchResult {
  avatars: any[];
  isLoading: boolean;
  error: string | null;
  fetchAvatars: () => Promise<void>;
}

export const useAvatarFetch = (): UseAvatarFetchResult => {
  const [avatars, setAvatars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trpc = useTRPC();
  
  const { data: avatarData, isLoading: queryLoading, error: queryError, refetch } = useQuery(
    trpc.studentSidebar.getAvatarsWithSignedUrls.queryOptions()
  );

  const fetchAvatars = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await refetch();
      if (avatarData) {
        if (!avatarData.success) {
          throw new Error(avatarData.error || 'Failed to fetch avatars');
        }
        setAvatars(avatarData.avatars);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [avatarData, refetch]);

  return { avatars, isLoading, error, fetchAvatars };
};
