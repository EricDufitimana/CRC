'use client';

import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';

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

  const { data, isLoading, error, refetch } = useQuery(
    trpc.auth.getUser.queryOptions()
  );

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