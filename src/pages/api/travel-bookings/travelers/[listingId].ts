import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/travel-bookings/travelers/[listingId] - Get confirmed travelers for a listing
// Confirmed travelers are those who have paid their deposit
export const GET: APIRoute = async ({ params }) => {
  try {
    const { listingId } = params;

    if (!listingId) {
      return new Response(JSON.stringify({ error: "Listing ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Get travelers who have paid their deposit (payment_status = 'succeeded' or deposit_paid = true)
    // Also include bookings with status 'joined' or 'confirmed' as fallback
    const { data: bookings, error: bookingsError } = await supabase
      .from("travel_group_bookings")
      .select(
        `
        id,
        status,
        deposit_paid,
        payment_status,
        confirmed_at,
        traveler:traveler_id (
          id,
          email,
          name
        )
      `
      )
      .eq("listing_id", listingId)
      .or(
        "payment_status.eq.succeeded,deposit_paid.eq.true,status.eq.joined,status.eq.confirmed"
      )
      .order("confirmed_at", { ascending: true, nullsFirst: false });

    if (bookingsError) {
      console.error("Error fetching confirmed travelers:", bookingsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch travelers" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Extract unique travelers (in case of duplicate bookings)
    const travelersMap = new Map();
    for (const booking of bookings || []) {
      if (booking.traveler && !travelersMap.has(booking.traveler.id)) {
        travelersMap.set(booking.traveler.id, {
          id: booking.traveler.id,
          name: booking.traveler.name || booking.traveler.email?.split("@")[0],
          email: booking.traveler.email,
          confirmedAt: booking.confirmed_at,
        });
      }
    }

    const confirmedTravelers = Array.from(travelersMap.values());

    // Get the listing to calculate available spots
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("max_group_size, available_spots")
      .eq("id", listingId)
      .single();

    if (listingError) {
      console.error("Error fetching listing:", listingError);
    }

    // Calculate actual available spots
    const maxGroupSize = listing?.max_group_size || 12;
    const confirmedCount = confirmedTravelers.length;
    const actualAvailableSpots = Math.max(0, maxGroupSize - confirmedCount);

    return new Response(
      JSON.stringify({
        travelers: confirmedTravelers,
        confirmedCount,
        maxGroupSize,
        availableSpots: actualAvailableSpots,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching confirmed travelers:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch travelers" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
