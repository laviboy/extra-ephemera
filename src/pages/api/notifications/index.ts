import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { notifications } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/notifications - Get all notifications for current user
export const GET: APIRoute = async ({ locals }) => {
  try {
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    const unreadCount = userNotifications.filter((n) => !n.read).length;

    return new Response(
      JSON.stringify({
        notifications: userNotifications,
        unreadCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch notifications" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

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
