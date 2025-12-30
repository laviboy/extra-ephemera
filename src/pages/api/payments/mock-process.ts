import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY!;

// Mock test card numbers
const TEST_CARDS = {
  SUCCESS: "4242424242424242", // Always succeeds
  FAILURE: "4000000000000002", // Always fails
};

// POST /api/payments/mock-process - Process a mock payment
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
    const { bookingId, cardNumber, expiryDate, cvv, cardholderName } = body;

    if (!bookingId) {
      return new Response(JSON.stringify({ error: "Booking ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate card inputs (basic validation for mock)
    if (!cardNumber || cardNumber.replace(/\s/g, "").length !== 16) {
      return new Response(
        JSON.stringify({ error: "Invalid card number. Must be 16 digits." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
      return new Response(
        JSON.stringify({ error: "Invalid expiry date. Use MM/YY format." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!cvv || !/^\d{3,4}$/.test(cvv)) {
      return new Response(
        JSON.stringify({ error: "Invalid CVV. Must be 3-4 digits." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get the booking with transaction
    const { data: booking, error: bookingError } = await supabase
      .from("travel_group_bookings")
      .select(
        `
        *,
        listing:listing_id (
          id,
          title,
          creator_id
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
        JSON.stringify({ error: "Only the traveler can process payment" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if booking is in a valid state for payment
    if (
      ![
        "pending",
        "pending_payment",
        "payment_failed",
        "accepted",
        "hold",
      ].includes(booking.status)
    ) {
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

    // Get or create the payment transaction
    let transaction = null;

    if (booking.payment_transaction_id) {
      const { data } = await supabase
        .from("payment_transactions")
        .select("*")
        .eq("id", booking.payment_transaction_id)
        .single();
      transaction = data;
    }

    // Calculate amount if no transaction exists
    const amount =
      transaction?.amount ||
      booking.payment_required_amount ||
      Math.round((booking.listing?.price_min || 1000) * 0.2);

    if (!transaction) {
      // Create a new transaction
      const mockPaymentIntentId = `pi_mock_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const { data: newTransaction, error: createError } = await supabase
        .from("payment_transactions")
        .insert({
          booking_id: bookingId,
          stripe_payment_intent_id: mockPaymentIntentId,
          amount: amount,
          currency: "usd",
          type: "deposit",
          status: "processing",
          payment_method: "card",
          metadata: {
            booking_id: bookingId,
            listing_id: booking.listing_id,
            traveler_id: user.id,
            cardholder_name: cardholderName,
            card_last_four: cardNumber.slice(-4),
          },
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating transaction:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create transaction" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      transaction = newTransaction;
    } else {
      // Update existing transaction to processing
      await supabase
        .from("payment_transactions")
        .update({
          status: "processing",
          updated_at: new Date().toISOString(),
          metadata: {
            ...transaction.metadata,
            cardholder_name: cardholderName,
            card_last_four: cardNumber.replace(/\s/g, "").slice(-4),
          },
        })
        .eq("id", transaction.id);
    }

    // Update booking status to payment_processing
    await supabase
      .from("travel_group_bookings")
      .update({
        status: "payment_processing",
        payment_transaction_id: transaction.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    // Simulate payment processing delay (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Determine payment outcome based on card number
    const cleanCardNumber = cardNumber.replace(/\s/g, "");
    let paymentSuccess = true;
    let failureReason = null;

    if (cleanCardNumber === TEST_CARDS.FAILURE) {
      paymentSuccess = false;
      failureReason = "Card declined. Please try a different card.";
    } else if (cleanCardNumber !== TEST_CARDS.SUCCESS) {
      // Random 10% failure rate for other cards
      paymentSuccess = Math.random() > 0.1;
      if (!paymentSuccess) {
        failureReason = "Payment could not be processed. Please try again.";
      }
    }

    if (paymentSuccess) {
      // Update transaction to succeeded
      const mockChargeId = `ch_mock_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      await supabase
        .from("payment_transactions")
        .update({
          status: "succeeded",
          stripe_charge_id: mockChargeId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transaction.id);

      // Update booking status to pending_review
      await supabase
        .from("travel_group_bookings")
        .update({
          status: "pending_review",
          payment_status: "paid",
          deposit_paid: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      // Notify the agent about the payment
      await supabase.from("notifications").insert({
        user_id: booking.agent_id,
        type: "deposit_paid",
        title: "New Booking with Deposit Paid",
        message: `A traveler has paid the deposit for ${
          booking.listing?.title || "your travel group"
        }. Please review their booking request.`,
        related_id: bookingId.toString(),
        related_type: "booking",
        action_url: `/crm/bookings/${bookingId}`,
        read: false,
      });

      // Notify the traveler about successful payment
      await supabase.from("notifications").insert({
        user_id: booking.traveler_id,
        type: "payment_succeeded",
        title: "Payment Successful!",
        message: `Your deposit payment has been processed. The agent will review your booking request shortly.`,
        related_id: bookingId.toString(),
        related_type: "booking",
        action_url: `/travel-bookings/${bookingId}`,
        read: false,
      });

      return new Response(
        JSON.stringify({
          success: true,
          status: "succeeded",
          message: "Payment successful! Your booking is now pending review.",
          transaction: {
            id: transaction.id,
            amount: amount,
            status: "succeeded",
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      // Update transaction to failed
      await supabase
        .from("payment_transactions")
        .update({
          status: "failed",
          failure_reason: failureReason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transaction.id);

      // Update booking status to payment_failed
      await supabase
        .from("travel_group_bookings")
        .update({
          status: "payment_failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      // Notify the traveler about failed payment
      await supabase.from("notifications").insert({
        user_id: booking.traveler_id,
        type: "payment_failed",
        title: "Payment Failed",
        message: failureReason || "Your payment could not be processed.",
        related_id: bookingId.toString(),
        related_type: "booking",
        action_url: `/travel-bookings/${bookingId}`,
        read: false,
      });

      return new Response(
        JSON.stringify({
          success: false,
          status: "failed",
          message: failureReason,
          transaction: {
            id: transaction.id,
            amount: amount,
            status: "failed",
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process payment" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
