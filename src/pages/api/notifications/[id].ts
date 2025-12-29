import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { notifications } from "../../../db/schema";
import { eq } from "drizzle-orm";

// PATCH /api/notifications/[id] - Mark notification as read
export const PATCH: APIRoute = async ({ params, locals }) => {
  try {
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const notificationId = parseInt(params.id!);
    if (isNaN(notificationId)) {
      return new Response(
        JSON.stringify({ error: "Invalid notification ID" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const [notification] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, notificationId))
      .returning();

    return new Response(JSON.stringify({ notification }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update notification" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
