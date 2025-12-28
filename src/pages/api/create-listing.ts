import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

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

    const { data, error } = await supabase
      .from("listings")
      .insert({
        id: newId,
        creator_id: user.id,
        title: body.title,
        destination: body.destination,
        description: body.description ?? null,
        tags: Array.isArray(body.tags) ? body.tags : [],
        instant_bookable: body.instantBookable ?? false,
        price_min: body.priceMin ?? null,
        price_max: body.priceMax ?? null,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    return Response.json({ success: true, id: newId, listing: data });
  } catch (err: any) {
    console.error("Error in create-listing:", err);
    return Response.json(
      { error: "Server error", details: err.message },
      { status: 500 }
    );
  }
};
