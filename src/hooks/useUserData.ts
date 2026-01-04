'use client';

import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { createClient } from '@/utils/supabase/client';

interface UserData {
  userId: string | null;
  adminId: string | null;
  studentId: number | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for fetching user data using tRPC
 * Returns userId, adminId, studentId, role, and user details
 */
export function useUserData() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const getUserQueryOptions = trpc.auth.getUser.queryOptions();

  const { data, isLoading, error, refetch } = useQuery(getUserQueryOptions);

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'SIGNED_OUT' ||
        event === 'USER_UPDATED'
      ) {
        queryClient.invalidateQueries({ queryKey: getUserQueryOptions.queryKey });
      }
    });

    return () => {
      subscription?.subscription?.unsubscribe();
    };
  }, [getUserQueryOptions.queryKey, queryClient, supabase.auth]);

  const refreshUserData = () => {
    refetch();
  };

  return {
    userId: data?.userId ?? null,
    adminId: data?.adminId ?? null,
    studentId: data?.studentId ?? null,
    role: data?.role ?? null,
    user: data?.user ?? null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error occurred') : null,
    refreshUserData,
  };
} 