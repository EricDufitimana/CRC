/**
 * Custom React hook for real-time admin data management
 * Works with server actions and provides real-time updates
 */

import { useState, useEffect, useCallback } from 'react';

interface UseAdminRealtimeOptions<T> {
  fetchFunction: (category: string) => Promise<{ status: string; data?: T[]; error?: string }>;
  subscribeFunction: (callback: any) => () => void;
  category: string;
  filterFunction?: (data: T[]) => T[];
}

interface UseAdminRealtimeReturn<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAdminRealtimeData<T extends { id: string | number }>({
  fetchFunction,
  subscribeFunction,
  category,
  filterFunction,
}: UseAdminRealtimeOptions<T>): UseAdminRealtimeReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchFunction(category);
      
      if (result.status === 'SUCCESS') {
        const fetchedData = result.data || [];
        const filteredData = filterFunction ? filterFunction(fetchedData) : fetchedData;
        setData(filteredData);
        setError(null);
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, category, filterFunction]);

  useEffect(() => {
    fetchData();

    // Set up real-time subscription
    const unsubscribe = subscribeFunction((payload: any) => {
      if (payload.eventType === 'INSERT') {
        setData((current) => {
          const filtered = filterFunction 
            ? filterFunction([payload.new]) 
            : [payload.new];
          return filtered.length > 0 ? [filtered[0], ...current] : current;
        });
      } else if (payload.eventType === 'UPDATE') {
        setData((current) => {
          const updated = current.map((item) =>
            item.id === payload.new.id ? payload.new : item
          );
          return filterFunction ? filterFunction(updated) : updated;
        });
      } else if (payload.eventType === 'DELETE') {
        setData((current) =>
          current.filter((item) => item.id !== payload.old.id)
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [fetchData, subscribeFunction, filterFunction]);

  return { data, loading, error, refetch: fetchData };
}
