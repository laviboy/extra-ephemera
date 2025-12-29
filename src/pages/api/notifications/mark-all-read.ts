import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { notifications } from "../../../db/schema";
import { eq } from "drizzle-orm";

// POST /api/notifications/mark-all-read - Mark all notifications as read
export const POST: APIRoute = async ({ locals }) => {
  try {
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, user.id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update notifications" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
