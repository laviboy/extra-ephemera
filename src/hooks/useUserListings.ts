"use client";

import { useQuery } from "@tanstack/react-query";
import type { Listing } from "../lib/api";
import { useEffect, useState } from "react";

export function useUserListings(userId: string | undefined) {
  const [mounted, setMounted] = useState(false);

  // This effect runs only on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  return useQuery<Listing[], Error>({
    queryKey: ["user-listings", userId],
    queryFn: async (): Promise<Listing[]> => {
      if (!userId) {
        return [];
      }
      const response = await fetch(`/api/listings?creatorId=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user listings");
      }
      const { listings } = await response.json();
      return listings;
    },
    enabled: mounted && !!userId, // Only enable the query after component mounts and userId exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
