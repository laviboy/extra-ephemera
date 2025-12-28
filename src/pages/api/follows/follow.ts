import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { follows } from "../../../db/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY!;

export const POST: APIRoute = async ({ request }) => {
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

    const { followingId } = await request.json();

    if (!followingId) {
      return new Response(
        JSON.stringify({ error: "followingId is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Prevent users from following themselves
    if (user.id === followingId) {
      return new Response(JSON.stringify({ error: "Cannot follow yourself" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if already following
    const existing = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, user.id),
          eq(follows.followingId, followingId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return new Response(
        JSON.stringify({ error: "Already following this user" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const [follow] = await db
      .insert(follows)
      .values({
        followerId: user.id,
        followingId: followingId,
      })
      .returning();

    return new Response(JSON.stringify(follow), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error following user:", error);
    return new Response(JSON.stringify({ error: "Failed to follow user" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
