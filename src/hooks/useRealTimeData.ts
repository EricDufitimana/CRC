/**
 * Custom React hook for real-time Supabase data
 * Provides a cleaner API for components
 */

import { useState, useEffect } from 'react';

interface UseRealtimeOptions<T> {
  fetchFunction: () => Promise<T[]>;
  subscribeFunction: (callback: any) => () => void;
  filterFunction?: (data: T[]) => T[];
}

interface UseRealtimeReturn<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useRealtimeData<T extends { id: string | number }>({
  fetchFunction,
  subscribeFunction,
  filterFunction,
}: UseRealtimeOptions<T>): UseRealtimeReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await fetchFunction();
      const filteredResult = filterFunction ? filterFunction(result) : result;
      setData(filteredResult);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

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
  }, []);

  return { data, loading, error, refetch: fetchData };
}