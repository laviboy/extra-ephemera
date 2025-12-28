import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY!;

export const GET: APIRoute = async ({ params }) => {
  try {
    const userId = params.userId;

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Get following (users that this user follows)
    const { data: following, error } = await supabase
      .from("follows")
      .select(
        `
        created_at,
        following:users!following_id (
          id,
          email,
          name,
          role
        )
      `
      )
      .eq("follower_id", userId);

    if (error) {
      console.error("Error fetching following:", error);
      throw error;
    }

    // Transform the response
    const transformedFollowing =
      following?.map((f: any) => ({
        id: f.following.id,
        email: f.following.email,
        name: f.following.name,
        role: f.following.role,
        followedAt: f.created_at,
      })) || [];

    return new Response(JSON.stringify(transformedFollowing), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching following:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch following" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
