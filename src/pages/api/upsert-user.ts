import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY!;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { id, email, name, emailVerified } = await request.json();

    if (!id || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const now = new Date().toISOString();

    // Check if user exists first
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", id)
      .single();

    // Prepare user data, preserving existing role if user already exists
    const userData: any = {
      id,
      email,
      name: name ?? null,
      locale: "en",
      email_verified: emailVerified ?? null,
      last_seen: now,
      updated_at: now,
    };

    // Only set role for new users
    if (!existingUser) {
      userData.role = "traveler";
    }

    // Upsert user data
    const { data: result, error } = await supabase
      .from("users")
      .upsert(userData, {
        onConflict: "id",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase upsert error:", error);
      throw error;
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in upsert-user:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
