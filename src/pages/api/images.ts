import type { APIRoute } from "astro";
import { db } from "../../lib/db";
import { images } from "../../db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get auth token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Create Supabase client with user's auth token for RLS
    const supabase = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL!,
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Verify token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("❌ Auth error:", authError);
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
      });
    }

    console.log("✅ User authenticated:", user.id);

    const body = await request.json();
    const { id, listingId, url, storagePath, caption, displayOrder } = body;

    console.log("💾 Saving image metadata:", {
      id,
      listingId,
      storagePath,
      caption,
      displayOrder,
      userId: user.id,
    });

    // First verify the listing exists and belongs to this user
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, creator_id")
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      console.error("❌ Listing not found:", listingError);
      return new Response(JSON.stringify({ error: "Listing not found" }), {
        status: 404,
      });
    }

    console.log("✅ Listing found:", listing);
    console.log(
      "🔍 User ID:",
      user.id,
      "Listing creator_id:",
      listing.creator_id
    );

    if (listing.creator_id !== user.id) {
      console.error("❌ User does not own this listing");
      return new Response(
        JSON.stringify({ error: "Unauthorized: You don't own this listing" }),
        { status: 403 }
      );
    }

    // Insert image record using Supabase client (respects RLS)
    const { data: insertedImage, error: insertError } = await supabase
      .from("images")
      .insert({
        id,
        listing_id: listingId,
        url,
        storage_path: storagePath,
        caption: caption || null,
        display_order: displayOrder || 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error("❌ Database insert error:", insertError);
      throw insertError;
    }

    console.log("✅ Image metadata saved successfully:", insertedImage);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Image saved successfully",
        image: insertedImage,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error saving image:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to save image" }),
      { status: 500 }
    );
  }
};

export const GET: APIRoute = async ({ url }) => {
  try {
    const listingId = url.searchParams.get("listingId");

    if (!listingId) {
      return new Response(JSON.stringify({ error: "listingId is required" }), {
        status: 400,
      });
    }

    // Fetch images for listing
    const listingImages = await db.query.images.findMany({
      where: (images, { eq }) => eq(images.listingId, listingId),
      orderBy: (images, { asc }) => [asc(images.displayOrder)],
    });

    return new Response(JSON.stringify({ images: listingImages }), {
      status: 200,
    });
  } catch (error: any) {
    console.error("Error fetching images:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch images" }),
      { status: 500 }
    );
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    // Get auth token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Create Supabase client with user's auth token for RLS
    const supabase = createClient(
      import.meta.env.PUBLIC_SUPABASE_URL!,
      import.meta.env.PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Verify token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
      });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: "id is required" }), {
        status: 400,
      });
    }

    // Delete image record (cascade will handle storage cleanup if needed)
    await db.delete(images).where(eq(images.id, id));

    return new Response(
      JSON.stringify({ success: true, message: "Image deleted successfully" }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting image:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to delete image" }),
      { status: 500 }
    );
  }
};
