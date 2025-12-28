import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "../lib/supabaseClient";

export interface FollowUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  followedAt: Date;
}

async function getAuthHeaders() {
  const supabase = getSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
}

export const useFollowStatus = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["followStatus", userId],
    queryFn: async () => {
      if (!userId) return { isFollowing: false };
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/follows/${userId}/status`, { headers });
      if (!res.ok) throw new Error("Failed to fetch follow status");
      return res.json();
    },
    enabled: !!userId,
  });
};

export const useFollowers = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["followers", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/follows/${userId}/followers`);
      if (!res.ok) throw new Error("Failed to fetch followers");
      return res.json() as Promise<FollowUser[]>;
    },
    enabled: !!userId,
  });
};

export const useFollowing = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["following", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/follows/${userId}/following`);
      if (!res.ok) throw new Error("Failed to fetch following");
      return res.json() as Promise<FollowUser[]>;
    },
    enabled: !!userId,
  });
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (followingId: string) => {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/follows/follow", {
        method: "POST",
        headers,
        body: JSON.stringify({ followingId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to follow user");
      }
      return res.json();
    },
    onSuccess: (_, followingId) => {
      queryClient.invalidateQueries({
        queryKey: ["followStatus", followingId],
      });
      queryClient.invalidateQueries({ queryKey: ["followers", followingId] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (followingId: string) => {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/follows/unfollow", {
        method: "POST",
        headers,
        body: JSON.stringify({ followingId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to unfollow user");
      }
      return res.json();
    },
    onSuccess: (_, followingId) => {
      queryClient.invalidateQueries({
        queryKey: ["followStatus", followingId],
      });
      queryClient.invalidateQueries({ queryKey: ["followers", followingId] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });
};
