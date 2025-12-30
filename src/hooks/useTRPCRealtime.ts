'use client';

import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UseTRPCRealtimeOptions {
  category: string;
}

interface UseTRPCRealtimeReturn<T> {
  data: T[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Combines tRPC queries with Supabase real-time subscriptions
 * Provides type-safe queries with instant real-time updates
 */
export function useTRPCRealtime<T extends { id: string | number }>({
  category,
}: UseTRPCRealtimeOptions): UseTRPCRealtimeReturn<T> {
  const trpc = useTRPC();
  const [optimisticData, setOptimisticData] = useState<T[] | undefined>(undefined);

  // Use tRPC query for initial data and refetching
  const {
    data: queryData,
    isLoading,
    error,
    refetch,
  } = useQuery(trpc.resources.getByCategory.queryOptions({ category }));

  // Use queryData as base, but allow optimistic updates from real-time
  const data = optimisticData ?? queryData;

  useEffect(() => {
    // Set initial data from query
    if (queryData) {
      setOptimisticData(queryData as unknown as T[]);
    }

    // Set up Supabase real-time subscription
    const channel = supabase
      .channel(`resources:category=${category}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'resources',
          filter: `category=eq.${category}`,
        },
        (payload) => {
          setOptimisticData((current) => {
            if (!current) return current;

            if (payload.eventType === 'INSERT') {
              const newItem = payload.new as unknown as T;
              // Only add if status is active
              if (payload.new.status === 'active') {
                return [newItem, ...current];
              }
              return current;
            } else if (payload.eventType === 'UPDATE') {
              const updatedItem = payload.new as unknown as T;
              // If status changed to inactive, remove it
              if (payload.new.status === 'inactive') {
                return current.filter((item) => item.id !== updatedItem.id);
              }
              // Otherwise update the item
              return current.map((item) =>
                item.id === updatedItem.id ? updatedItem : item
              );
            } else if (payload.eventType === 'DELETE') {
              const deletedItem = payload.old as unknown as T;
              return current.filter((item) => item.id !== deletedItem.id);
            }
            return current;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [category, queryData]);

  return {
    data: data as T[] | undefined,
    isLoading,
    error: error as Error | null,
    refetch: () => {
      setOptimisticData(undefined); // Reset optimistic data to trigger refetch
      refetch();
    },
  };
}

