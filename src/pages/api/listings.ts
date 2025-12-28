import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY!;

interface Listing {
  id: string;
  title: string;
  destination: string;
  description: string | null;
  price_min: number | null;
  price_max: number | null;
  instant_bookable: boolean;
  created_at: string;
  first_image_url?: string | null;
}

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit")) || 12;
    const creatorId = url.searchParams.get("creatorId");

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    let query = supabase
      .from("listings")
      .select(
        `
        *,
        images!listing_id (
          url,
          display_order
        )
      `
      )
      .order("created_at", { ascending: false });

    // Filter by creator_id if provided
    if (creatorId) {
      query = query.eq("creator_id", creatorId);
    } else {
      // Only apply limit when not filtering by creator
      query = query.limit(limit);
    }

    const { data: listings, error } = await query;

    if (error) {
      throw error;
    }

    // Transform listings to include first_image_url
    const listingsWithImages = listings?.map((listing: any) => {
      // Sort images by display_order and get first one
      const sortedImages = (listing.images || []).sort(
        (a: any, b: any) => a.display_order - b.display_order
      );
      const firstImage = sortedImages[0];

      return {
        ...listing,
        first_image_url: firstImage?.url || null,
        images: undefined, // Remove nested images array from response
      };
    });

    return Response.json({ listings: listingsWithImages });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return Response.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
};
