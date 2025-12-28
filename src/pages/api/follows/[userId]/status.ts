import type { APIRoute } from "astro";
import { db } from "../../../../lib/db";
import { follows } from "../../../../db/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY!;

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const accessToken = authHeader.split(" ")[1];
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const targetUserId = params.userId;

    if (!targetUserId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const [follow] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, user.id),
          eq(follows.followingId, targetUserId)
        )
      )
      .limit(1);

    return new Response(JSON.stringify({ isFollowing: !!follow }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error checking follow status:", error);
    return new Response(
      JSON.stringify({ error: "Failed to check follow status" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
