import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/travel-bookings - Get bookings for current user (either as traveler or agent)
export const GET: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const accessToken = authHeader.split(" ")[1];
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = new URL(request.url);
    const role = url.searchParams.get("role"); // 'traveler' or 'agent'
    const status = url.searchParams.get("status"); // Filter by status

    // Build Supabase query
    let query = supabase
      .from("travel_group_bookings")
      .select(
        `
        *,
        listing:listing_id (
          id,
          title,
          creator_id,
          destination,
          price_min,
          price_max
        ),
        traveler:traveler_id (
          id,
          email,
          name
        )
      `
      )
      .order("created_at", { ascending: false });

    if (role === "traveler") {
      query = query.eq("traveler_id", user.id);
    } else if (role === "agent") {
      query = query.eq("agent_id", user.id);
    } else {
      // Return both (bookings where user is either traveler or agent)
      query = query.or(`traveler_id.eq.${user.id},agent_id.eq.${user.id}`);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: bookings, error: bookingsError } = await query;

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch bookings" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch conversations for each booking
    const bookingsWithConversations = await Promise.all(
      (bookings || []).map(async (booking) => {
        const { data: conversation } = await supabase
          .from("conversations")
          .select("id")
          .eq("listing_id", booking.listing_id)
          .eq("customer_id", booking.traveler_id)
          .eq("agent_id", booking.agent_id)
          .single();

        return {
          ...booking,
          conversationId: conversation?.id,
        };
      })
    );

    return new Response(
      JSON.stringify({ bookings: bookingsWithConversations }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch bookings" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// POST /api/travel-bookings - Create a new booking request
export const POST: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const accessToken = authHeader.split(" ")[1];
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const { listingId, travelerNotes } = body;

    if (!listingId) {
      return new Response(JSON.stringify({ error: "Listing ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the listing to find the agent
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, title, creator_id")
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      return new Response(JSON.stringify({ error: "Listing not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if user already has a booking for this listing
    const { data: existingBooking } = await supabase
      .from("travel_group_bookings")
      .select("id")
      .eq("listing_id", listingId)
      .eq("traveler_id", user.id)
      .single();

    if (existingBooking) {
      return new Response(
        JSON.stringify({
          error: "You already have a booking for this travel group",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from("travel_group_bookings")
      .insert({
        listing_id: listingId,
        traveler_id: user.id,
        agent_id: listing.creator_id,
        status: "pending",
        traveler_notes: travelerNotes,
        requested_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (bookingError || !booking) {
      console.error("Error creating booking:", bookingError);
      return new Response(
        JSON.stringify({ error: "Failed to create booking" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create a conversation between traveler and agent
    const conversationId = `conv_${booking.id}_${Date.now()}`;
    const { error: convError } = await supabase.from("conversations").insert({
      id: conversationId,
      customer_id: user.id,
      agent_id: listing.creator_id,
      listing_id: listing.id,
      type: "booking",
      subject: `Travel Group: ${listing.title}`,
      last_message: travelerNotes || "Booking request",
      last_message_at: new Date().toISOString(),
    });

    if (convError) {
      console.error("Error creating conversation:", convError);
    }

    // Create a notification for the agent
    const { error: notifError } = await supabase.from("notifications").insert({
      user_id: listing.creator_id,
      type: "booking_request",
      title: "New Booking Request",
      message: `${user.email} wants to join your travel group: ${listing.title}`,
      related_id: booking.id,
      related_type: "booking",
      action_url: `/crm/bookings/${booking.id}`,
      read: false,
    });

    if (notifError) {
      console.error("Error creating notification:", notifError);
    }

    return new Response(JSON.stringify({ booking, conversationId }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return new Response(JSON.stringify({ error: "Failed to create booking" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
