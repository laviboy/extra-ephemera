import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY!;

// POST /api/payments/create-intent - Create a payment intent for a booking
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
      .select(
        `
        *,
        listing:listing_id (
          id,
          title,
          price_min
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

    // Verify user is the traveler
    if (booking.traveler_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Only the traveler can create a payment" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if booking is in a valid state for payment
    if (!["pending_payment", "payment_failed"].includes(booking.status)) {
      return new Response(
        JSON.stringify({
          error: "Booking is not in a state that requires payment",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if there's already a pending/processing transaction
    const { data: existingTransaction } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("booking_id", bookingId)
      .in("status", ["pending", "processing"])
      .single();

    if (existingTransaction) {
      return new Response(
        JSON.stringify({
          error: "A payment is already in progress",
          transaction: existingTransaction,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Calculate deposit amount (use payment_required_amount or 20% of listing price)
    const depositAmount =
      booking.payment_required_amount ||
      Math.round((booking.listing?.price_min || 1000) * 0.2);

    // Create a mock payment intent ID
    const mockPaymentIntentId = `pi_mock_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create the payment transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from("payment_transactions")
      .insert({
        booking_id: bookingId,
        stripe_payment_intent_id: mockPaymentIntentId,
        amount: depositAmount,
        currency: "usd",
        type: "deposit",
        status: "pending",
        payment_method: "card",
        metadata: {
          booking_id: bookingId,
          listing_id: booking.listing_id,
          traveler_id: user.id,
        },
      })
      .select()
      .single();

    if (transactionError || !transaction) {
      console.error("Error creating transaction:", transactionError);
      return new Response(
        JSON.stringify({ error: "Failed to create payment intent" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update booking with transaction reference
    await supabase
      .from("travel_group_bookings")
      .update({
        payment_transaction_id: transaction.id,
        payment_required_amount: depositAmount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    return new Response(
      JSON.stringify({
        clientSecret: `${mockPaymentIntentId}_secret_mock`,
        paymentIntentId: mockPaymentIntentId,
        transactionId: transaction.id,
        amount: depositAmount,
        currency: "usd",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create payment intent" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
