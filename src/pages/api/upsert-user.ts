import type { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { users } from "../../db/schema/users";
import { db } from "../../lib/db";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { id, email, name, emailVerified } = await request.json();

    if (!id || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const existingUser = (
      await db.select().from(users).where(eq(users.id, id))
    )[0];

    const now = new Date();

    const userData = {
      id,
      email,
      name: name ?? existingUser?.name ?? null,
      role: existingUser?.role ?? "traveler",
      phone: existingUser?.phone ?? null,
      locale: existingUser?.locale ?? "en",
      email_verified: emailVerified ?? existingUser?.email_verified ?? null,
      last_seen: now,
    };

    let result;

    if (existingUser) {
      // UPDATE
      [result] = await db
        .update(users)
        .set({
          ...userData,
          updated_at: now,
        })
        .where(eq(users.id, id))
        .returning();
    } else {
      // INSERT
      [result] = await db
        .insert(users)
        .values({
          ...userData,
          created_at: now,
          updated_at: now,
        })
        .returning();
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in upsert-user:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
