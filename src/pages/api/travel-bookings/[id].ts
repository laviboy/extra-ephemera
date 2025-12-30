import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

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

    const { data: booking, error: bookingError } = await supabase
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
        )
      `
      )
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if user is authorized to view this booking
    if (booking.traveler_id !== user.id && booking.agent_id !== user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch conversation and messages if exists
    let conversation = null;
    let conversationMessages = [];
    if (booking.conversation_id) {
      const { data: convData } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", booking.conversation_id)
        .single();

      conversation = convData;

      const { data: msgsData } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", booking.conversation_id)
        .order("created_at", { ascending: true });

      conversationMessages = msgsData || [];
    }

    return new Response(
      JSON.stringify({
        booking: {
          ...booking,
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

    const { data: booking, error: bookingError } = await supabase
      .from("travel_group_bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Only agent can update most statuses
    const isAgent = booking.agent_id === user.id;
    const isTraveler = booking.traveler_id === user.id;

    if (!isAgent && !isTraveler) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (newStatus) {
      // Only agent can change status to accepted, rejected, confirmed, joined
      if (
        ["accepted", "rejected", "confirmed", "joined"].includes(newStatus) &&
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

      // Validate status transitions based on payment status
      if (newStatus === "joined" && booking.payment_status !== "paid") {
        return new Response(
          JSON.stringify({ error: "Cannot accept booking without payment" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      updateData.status = newStatus;

      if (newStatus === "joined") {
        updateData.accepted_at = new Date().toISOString();
        updateData.reviewed_at = new Date().toISOString();

        // Notify traveler
        await supabase.from("notifications").insert({
          user_id: booking.traveler_id,
          type: "booking_accepted",
          title: "You're In! 🎉",
          message: "Your booking has been accepted. Welcome to the group!",
          related_id: bookingId.toString(),
          related_type: "booking",
          action_url: `/travel-bookings/${bookingId}`,
          read: false,
        });
      } else if (newStatus === "accepted") {
        updateData.accepted_at = new Date().toISOString();

        // Notify traveler
        await supabase.from("notifications").insert({
          user_id: booking.traveler_id,
          type: "booking_accepted",
          title: "Booking Accepted! 🎉",
          message:
            "Great news! Your travel group booking has been accepted. The agent will be in touch with more details soon.",
          related_id: bookingId.toString(),
          related_type: "booking",
          action_url: `/travel-bookings/${bookingId}`,
          read: false,
        });
      } else if (newStatus === "rejected") {
        updateData.cancelled_at = new Date().toISOString();
        updateData.reviewed_at = new Date().toISOString();

        // If payment was made, initiate refund
        if (
          booking.payment_status === "paid" &&
          booking.payment_transaction_id
        ) {
          // Create a refund transaction record
          await supabase.from("payment_transactions").insert({
            booking_id: bookingId,
            amount: booking.payment_required_amount || 0,
            currency: "usd",
            type: "refund",
            status: "processing",
            metadata: {
              original_transaction_id: booking.payment_transaction_id,
              reason: "Booking rejected by agent",
            },
          });

          // Update booking payment status
          updateData.payment_status = "refunded";
        }

        // Notify traveler
        await supabase.from("notifications").insert({
          user_id: booking.traveler_id,
          type: "booking_rejected",
          title: "Booking Not Accepted",
          message:
            booking.payment_status === "paid"
              ? "Unfortunately, your booking was not accepted. A refund has been initiated."
              : "Unfortunately, your travel group booking was not accepted.",
          related_id: bookingId.toString(),
          related_type: "booking",
          action_url: `/travel-bookings/${bookingId}`,
          read: false,
        });
      } else if (newStatus === "confirmed") {
        updateData.confirmed_at = new Date().toISOString();
        // Notify traveler
        await supabase.from("notifications").insert({
          user_id: booking.traveler_id,
          type: "booking_confirmed",
          title: "Booking Confirmed!",
          message:
            "Your travel group booking is now confirmed. Get ready for your adventure!",
          related_id: bookingId.toString(),
          related_type: "booking",
          action_url: `/travel-bookings/${bookingId}`,
          read: false,
        });
      } else if (newStatus === "deposit_pending") {
        // Notify agent
        await supabase.from("notifications").insert({
          user_id: booking.agent_id,
          type: "deposit_submitted",
          title: "Deposit Submitted",
          message: "A traveler has submitted their deposit payment.",
          related_id: bookingId.toString(),
          related_type: "booking",
          action_url: `/crm/bookings/${bookingId}`,
          read: false,
        });
      }
    }

    if (agentNotes !== undefined && isAgent) {
      updateData.agent_notes = agentNotes;
    }

    if (depositPaid !== undefined && isAgent) {
      updateData.deposit_paid = depositPaid;
    }

    const { data: updatedBooking, error: updateError } = await supabase
      .from("travel_group_bookings")
      .update(updateData)
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating booking:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update booking" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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
