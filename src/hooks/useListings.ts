'use client';

import { useQuery } from '@tanstack/react-query';
import type { Listing } from '../lib/api';
import { useEffect, useState } from 'react';

export function useListings(initialData?: Listing[]) {
  const [mounted, setMounted] = useState(false);
  
  // This effect runs only on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  return useQuery<Listing[], Error>({
    queryKey: ['listings'],
    queryFn: async (): Promise<Listing[]> => {
      const response = await fetch('/api/listings?limit=12');
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      const { listings } = await response.json();
      return listings;
    },
    initialData: mounted ? undefined : initialData, // Only use initialData on first render
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: mounted, // Only enable the query after component mounts on the client
  });
}
