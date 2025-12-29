import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { db } from "../../../lib/db";
import {
  travelGroupBookings,
  listings,
  notifications,
  conversations,
  messages,
} from "../../../db/schema";
import { eq, and } from "drizzle-orm";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/travel-bookings/[id] - Get a specific booking with details
export const GET: APIRoute = async ({ params, request }) => {
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

    const bookingId = parseInt(params.id!);
    if (isNaN(bookingId)) {
      return new Response(JSON.stringify({ error: "Invalid booking ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const [booking] = await db
      .select()
      .from(travelGroupBookings)
      .where(eq(travelGroupBookings.id, bookingId))
      .limit(1);

    if (!booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if user is authorized to view this booking
    if (booking.travelerId !== user.id && booking.agentId !== user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch related listing
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, booking.listingId))
      .limit(1);

    // Fetch conversation if exists
    let conversation = null;
    let conversationMessages = [];
    if (booking.conversationId) {
      [conversation] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, booking.conversationId))
        .limit(1);

      conversationMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, booking.conversationId))
        .orderBy(messages.createdAt);
    }

    return new Response(
      JSON.stringify({
        booking: {
          ...booking,
          listing,
          conversation,
          messages: conversationMessages,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching booking:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch booking" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// PATCH /api/travel-bookings/[id] - Update booking status
export const PATCH: APIRoute = async ({ params, request }) => {
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

    const bookingId = parseInt(params.id!);
    if (isNaN(bookingId)) {
      return new Response(JSON.stringify({ error: "Invalid booking ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const { status: newStatus, agentNotes, depositPaid } = body;

    const [booking] = await db
      .select()
      .from(travelGroupBookings)
      .where(eq(travelGroupBookings.id, bookingId))
      .limit(1);

    if (!booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Only agent can update most statuses
    const isAgent = booking.agentId === user.id;
    const isTraveler = booking.travelerId === user.id;

    if (!isAgent && !isTraveler) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (newStatus) {
      // Only agent can change status to accepted, rejected, confirmed
      if (
        ["accepted", "rejected", "confirmed"].includes(newStatus) &&
        !isAgent
      ) {
        return new Response(
          JSON.stringify({ error: "Only agent can perform this action" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      updateData.status = newStatus;

      if (newStatus === "accepted") {
        updateData.acceptedAt = new Date();
        // Create conversation between agent and traveler
        const [conversation] = await db
          .insert(conversations)
          .values({
            id: `conv_${bookingId}_${Date.now()}`,
            customerId: booking.travelerId,
            agentId: booking.agentId,
            type: "booking",
            subject: `Travel Group Booking #${bookingId}`,
            lastMessageAt: new Date(),
          })
          .returning();

        updateData.conversationId = conversation.id;

        // Notify traveler
        await db.insert(notifications).values({
          userId: booking.travelerId,
          type: "booking_accepted",
          title: "Booking Accepted!",
          message:
            "Your travel group booking has been accepted. Please proceed with the deposit.",
          relatedId: bookingId,
          relatedType: "booking",
          actionUrl: `/travel-bookings/${bookingId}`,
        });
      } else if (newStatus === "rejected") {
        updateData.cancelledAt = new Date();
        // Notify traveler
        await db.insert(notifications).values({
          userId: booking.travelerId,
          type: "booking_rejected",
          title: "Booking Not Accepted",
          message: "Unfortunately, your travel group booking was not accepted.",
          relatedId: bookingId,
          relatedType: "booking",
          actionUrl: `/travel-bookings/${bookingId}`,
        });
      } else if (newStatus === "confirmed") {
        updateData.confirmedAt = new Date();
        // Notify traveler
        await db.insert(notifications).values({
          userId: booking.travelerId,
          type: "booking_confirmed",
          title: "Booking Confirmed!",
          message:
            "Your travel group booking is now confirmed. Get ready for your adventure!",
          relatedId: bookingId,
          relatedType: "booking",
          actionUrl: `/travel-bookings/${bookingId}`,
        });
      } else if (newStatus === "deposit_pending") {
        // Notify agent
        await db.insert(notifications).values({
          userId: booking.agentId,
          type: "deposit_submitted",
          title: "Deposit Submitted",
          message: "A traveler has submitted their deposit payment.",
          relatedId: bookingId,
          relatedType: "booking",
          actionUrl: `/crm/bookings/${bookingId}`,
        });
      }
    }

    if (agentNotes !== undefined && isAgent) {
      updateData.agentNotes = agentNotes;
    }

    if (depositPaid !== undefined && isAgent) {
      updateData.depositPaid = depositPaid;
    }

    const [updatedBooking] = await db
      .update(travelGroupBookings)
      .set(updateData)
      .where(eq(travelGroupBookings.id, bookingId))
      .returning();

    return new Response(JSON.stringify({ booking: updatedBooking }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return new Response(JSON.stringify({ error: "Failed to update booking" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
