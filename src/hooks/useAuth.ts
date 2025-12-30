'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { useRouter } from 'next/navigation';

/**
 * Hook for authentication operations using tRPC
 */
export function useAuth() {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Sign out mutation
  const signOutMutation = useMutation({
    ...trpc.auth.signOut.mutationOptions(),
    onSuccess: () => {
      // Clear all queries on sign out
      queryClient.clear();
      // Redirect to home
      router.push('/');
      // Force a hard reload to clear any cached state
      window.location.href = '/';
    },
    onError: (error) => {
      console.error('Sign out error:', error);
    },
  });

  // Get current session
  const { data: sessionData, isLoading: isSessionLoading } = useQuery(
    trpc.auth.getSession.queryOptions()
  );

  // Get current user
  const { data: userData, isLoading: isUserLoading } = useQuery(
    trpc.auth.getUser.queryOptions()
  );

  return {
    signOut: () => signOutMutation.mutate(),
    isSigningOut: signOutMutation.isPending,
    session: sessionData?.session,
    user: userData?.user,
    isLoading: isSessionLoading || isUserLoading,
  };
}

