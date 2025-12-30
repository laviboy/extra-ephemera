import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY!;

// POST /api/payments/cancel-intent - Cancel a payment intent
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
    const { bookingId } = body;

    if (!bookingId) {
      return new Response(JSON.stringify({ error: "Booking ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the booking
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

    // Verify user is the traveler
    if (booking.traveler_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Only the traveler can cancel payment" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if booking is in a valid state for cancellation
    if (
      !["pending", "pending_payment", "payment_failed"].includes(booking.status)
    ) {
      return new Response(
        JSON.stringify({
          error: "Cannot cancel payment at this stage",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Cancel any pending transactions
    if (booking.payment_transaction_id) {
      await supabase
        .from("payment_transactions")
        .update({
          status: "failed",
          failure_reason: "Cancelled by user",
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.payment_transaction_id)
        .eq("status", "pending");
    }

    // Update booking status to cancelled
    await supabase
      .from("travel_group_bookings")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    // Notify the agent
    await supabase.from("notifications").insert({
      user_id: booking.agent_id,
      type: "booking_cancelled",
      title: "Booking Cancelled",
      message: "A traveler cancelled their booking before completing payment.",
      related_id: bookingId.toString(),
      related_type: "booking",
      action_url: `/crm/bookings/${bookingId}`,
      read: false,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Booking cancelled successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error cancelling payment:", error);
    return new Response(JSON.stringify({ error: "Failed to cancel payment" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
