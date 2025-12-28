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

    // Get following (users that this user follows)
    const following = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        followedAt: follows.createdAt,
      })
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId));

    return new Response(JSON.stringify(following), {
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
