import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
// import { db } from "../../db";
import { listings } from "../../db/schema";
import { db } from "../../lib/db";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY!;

export const POST: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = authHeader.split(" ")[1];

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const newId = crypto.randomUUID();

    await db.insert(listings).values({
      id: newId,
      creatorId: user.id,
      title: body.title,
      destination: body.destination,
      description: body.description ?? null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      instantBookable: body.instantBookable ?? false,
      priceMin: body.priceMin ?? null,
      priceMax: body.priceMax ?? null,
    });

    return Response.json({ success: true, id: newId });
  } catch (err) {
    console.error("Error in create-listing:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
};
