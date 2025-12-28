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

    // Get followers (users who follow this user)
    const { data: followers, error } = await supabase
      .from("follows")
      .select(
        `
        created_at,
        follower:users!follower_id (
          id,
          email,
          name,
          role
        )
      `
      )
      .eq("following_id", userId);

    if (error) {
      console.error("Error fetching followers:", error);
      throw error;
    }

    // Transform the response
    const transformedFollowers =
      followers?.map((f: any) => ({
        id: f.follower.id,
        email: f.follower.email,
        name: f.follower.name,
        role: f.follower.role,
        followedAt: f.created_at,
      })) || [];

    return new Response(JSON.stringify(transformedFollowers), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching followers:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch followers" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
