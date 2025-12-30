import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/payments/status/[bookingId] - Get payment status for a booking
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

    const bookingId = parseInt(params.bookingId!);
    if (isNaN(bookingId)) {
      return new Response(JSON.stringify({ error: "Invalid booking ID" }), {
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

    // Verify user is authorized to view this booking
    if (booking.traveler_id !== user.id && booking.agent_id !== user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get all transactions for this booking
    const { data: transactions, error: transactionsError } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: false });

    if (transactionsError) {
      console.error("Error fetching transactions:", transactionsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch payment status" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const latestTransaction = transactions?.[0] || null;

    return new Response(
      JSON.stringify({
        bookingId,
        bookingStatus: booking.status,
        paymentStatus: booking.payment_status || "pending",
        requiredAmount: booking.payment_required_amount,
        paymentDeadline: booking.payment_deadline,
        latestTransaction,
        transactions: transactions || [],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching payment status:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch payment status" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
