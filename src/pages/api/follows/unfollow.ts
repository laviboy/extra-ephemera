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

    const deleted = await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, user.id),
          eq(follows.followingId, followingId)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return new Response(
        JSON.stringify({ error: "Not following this user" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Unfollowed successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return new Response(JSON.stringify({ error: "Failed to unfollow user" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
