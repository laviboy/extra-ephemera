import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { db } from "../../../lib/db";
import {
  travelGroupBookings,
  listings,
  notifications,
  conversations,
} from "../../../db/schema";
import { eq, and, desc } from "drizzle-orm";

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

    let query;
    if (role === "traveler") {
      query = db
        .select()
        .from(travelGroupBookings)
        .where(eq(travelGroupBookings.travelerId, user.id));
    } else if (role === "agent") {
      query = db
        .select()
        .from(travelGroupBookings)
        .where(eq(travelGroupBookings.agentId, user.id));
    } else {
      // Return both
      query = db
        .select()
        .from(travelGroupBookings)
        .where(
          and(
            eq(travelGroupBookings.travelerId, user.id),
            eq(travelGroupBookings.agentId, user.id)
          )
        );
    }

    if (status) {
      query = query.where(eq(travelGroupBookings.status, status));
    }

    const bookings = await query.orderBy(desc(travelGroupBookings.createdAt));

    // Fetch related listings
    const bookingsWithListings = await Promise.all(
      bookings.map(async (booking) => {
        const [listing] = await db
          .select()
          .from(listings)
          .where(eq(listings.id, booking.listingId))
          .limit(1);

        return {
          ...booking,
          listing,
        };
      })
    );

    return new Response(JSON.stringify({ bookings: bookingsWithListings }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
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
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (!listing) {
      return new Response(JSON.stringify({ error: "Listing not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if user already has a booking for this listing
    const existingBooking = await db
      .select()
      .from(travelGroupBookings)
      .where(
        and(
          eq(travelGroupBookings.listingId, listingId),
          eq(travelGroupBookings.travelerId, user.id)
        )
      )
      .limit(1);

    if (existingBooking.length > 0) {
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
    const [booking] = await db
      .insert(travelGroupBookings)
      .values({
        listingId,
        travelerId: user.id,
        agentId: listing.creatorId,
        status: "pending",
        travelerNotes,
        requestedAt: new Date(),
      })
      .returning();

    // Create a notification for the agent
    await db.insert(notifications).values({
      userId: listing.creatorId,
      type: "booking_request",
      title: "New Booking Request",
      message: `${user.email} wants to join your travel group: ${listing.title}`,
      relatedId: booking.id,
      relatedType: "booking",
      actionUrl: `/crm/bookings/${booking.id}`,
      read: false,
    });

    return new Response(JSON.stringify({ booking }), {
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
