import type { APIRoute } from "astro";
import { db } from "../../../../lib/db";
import { follows, users } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export const GET: APIRoute = async ({ params }) => {
  try {
    const userId = params.userId;

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get followers (users who follow this user)
    const followers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        followedAt: follows.createdAt,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId));

    return new Response(JSON.stringify(followers), {
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
