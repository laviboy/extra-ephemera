import { useState, useEffect } from "react";
import { useAuth } from "../../stores/useAuth";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { PaymentForm } from "../payments/PaymentForm";
import { PaymentStatusBadge } from "../payments/PaymentStatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

// Dialog state type
type DialogState = {
  type: "success" | "confirm" | "error" | null;
  title: string;
  message: string;
};

interface BookingDetailProps {
  bookingId: string;
}

export function BookingDetail({ bookingId }: BookingDetailProps) {
  const user = useAuth((s) => s.user);
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isPayingDeposit, setIsPayingDeposit] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>({
    type: null,
    title: "",
    message: "",
  });
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const getAccessToken = () => {
    const rawSession = localStorage.getItem(
      "sb-tomxahjmbfkcrfszuhpo-auth-token"
    );
    const session = rawSession ? JSON.parse(rawSession) : null;
    return session?.access_token;
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const accessToken = getAccessToken();
      const response = await fetch(`/api/travel-bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        const { booking } = await response.json();
        setBooking(booking);
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayDeposit = async () => {
    setIsPayingDeposit(true);
    try {
      const accessToken = getAccessToken();
      // Mock payment - just update status to deposit_pending
      const response = await fetch(`/api/travel-bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          status: "deposit_pending",
        }),
      });

      if (response.ok) {
        setDialogState({
          type: "success",
          title: "Payment Submitted! ✓",
          message:
            "The agent will confirm your deposit shortly. You'll be notified once it's verified.",
        });
        fetchBookingDetails();
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      setDialogState({
        type: "error",
        title: "Error",
        message: "An error occurred. Please try again.",
      });
    } finally {
      setIsPayingDeposit(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-slate-600">Booking not found</p>
        </CardContent>
      </Card>
    );
  }

  const statusConfig: Record<
    string,
    { label: string; color: string; description: string }
  > = {
    // New payment-first flow statuses
    pending_payment: {
      label: "Payment Required",
      color: "bg-amber-100 text-amber-800 border-amber-300",
      description:
        "Complete your deposit payment to submit your booking request.",
    },
    payment_processing: {
      label: "Processing Payment",
      color: "bg-blue-100 text-blue-800 border-blue-300",
      description: "Your payment is being processed. Please wait...",
    },
    payment_failed: {
      label: "Payment Failed",
      color: "bg-red-100 text-red-800 border-red-300",
      description: "Your payment could not be processed. Please try again.",
    },
    pending_review: {
      label: "Pending Review",
      color: "bg-purple-100 text-purple-800 border-purple-300",
      description:
        "Payment received! The agent is reviewing your booking request.",
    },
    joined: {
      label: "Joined",
      color: "bg-green-100 text-green-800 border-green-300",
      description: "Welcome to the group! You're all set for the adventure.",
    },
    // Legacy statuses (backward compatibility)
    pending: {
      label: "Payment Required",
      color: "bg-amber-100 text-amber-800 border-amber-300",
      description:
        "Pay your deposit to secure your spot. The agent will review your booking once payment is confirmed. You also may start a chat with the agent to introduce yourself, or ask any questions you may have.",
    },
    accepted: {
      label: "Booking Accepted",
      color: "bg-green-100 text-green-800 border-green-300",
      description:
        "Great news! Your booking spot has been accepted. The agent will keep in touch with you for more details. You can connect with them anytime using the chat!",
    },
    hold: {
      label: "On Hold",
      color: "bg-blue-100 text-blue-800 border-blue-300",
      description: "Your spot is on hold. Please complete the deposit payment.",
    },
    deposit_pending: {
      label: "Deposit Pending",
      color: "bg-purple-100 text-purple-800 border-purple-300",
      description: "Your deposit payment is being verified by the agent.",
    },
    confirmed: {
      label: "Confirmed",
      color: "bg-green-100 text-green-800 border-green-300",
      description: "Your booking is confirmed! Get ready for your adventure.",
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-gray-100 text-gray-800 border-gray-300",
      description: "This booking has been cancelled.",
    },
    rejected: {
      label: "Not Accepted",
      color: "bg-red-100 text-red-800 border-red-300",
      description: "Unfortunately, your booking request was not accepted.",
    },
  };

  const config = statusConfig[booking.status] || statusConfig.pending;
  const isTraveler = user?.id === booking.traveler_id;

  // Override description based on viewer (traveler vs agent)
  const getStatusDescription = () => {
    if (booking.status === "accepted") {
      return isTraveler
        ? "Great news! Your booking spot has been accepted. The agent will keep in touch with you for more details. You can connect with them anytime using the chat!"
        : `Congrats! ${
            booking.traveler?.full_name || "A traveler"
          } is now on board for this trip. Keep in touch with them through your chat to share trip details and updates.`;
    }
    if (booking.status === "pending" || booking.status === "pending_payment") {
      return isTraveler
        ? "Pay your deposit to secure your spot. The agent will review your booking once payment is confirmed. You can also start a chat with the agent to introduce yourself or ask any questions."
        : `${
            booking.traveler?.full_name || "A traveler"
          } is interested in joining this trip! Please wait while they complete their deposit payment. Stay alert — they might reach out via chat with questions!`;
    }
    if (booking.status === "pending_review") {
      return isTraveler
        ? "Payment received! The agent is reviewing your booking request."
        : `${
            booking.traveler?.full_name || "A traveler"
          } has paid the deposit and is waiting for your review. Accept or decline their booking request.`;
    }
    return config.description;
  };

  const statusDescription = getStatusDescription();

  // Show payment button for pending status (pay to secure spot)
  const showPaymentButton =
    isTraveler &&
    ["pending", "pending_payment", "payment_failed"].includes(booking.status);

  // Calculate deposit amount
  const depositAmount =
    booking.payment_required_amount ||
    booking.depositAmount ||
    Math.round((booking.listing?.price_min || 1000) * 0.2);

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    fetchBookingDetails();
  };

  const handleCancelBooking = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancelBooking = async () => {
    setIsProcessing(true);
    try {
      const accessToken = getAccessToken();
      const response = await fetch("/api/payments/cancel-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ bookingId: booking.id }),
      });

      setShowCancelConfirm(false);

      if (response.ok) {
        setDialogState({
          type: "success",
          title: "Booking Cancelled",
          message: "Your booking has been cancelled successfully.",
        });
        fetchBookingDetails();
      } else {
        const { error } = await response.json();
        setDialogState({
          type: "error",
          title: "Failed to Cancel",
          message: error || "Failed to cancel booking. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      setShowCancelConfirm(false);
      setDialogState({
        type: "error",
        title: "Error",
        message: "An error occurred. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const closeDialog = () => {
    setDialogState({ type: null, title: "", message: "" });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">
              Booking Details
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Booking ID: #{booking.id}
            </p>
          </div>
          <div className="flex flex-col-reverse sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() =>
                (window.location.href = booking.conversation_id
                  ? `/inbox?conversation=${booking.conversation_id}`
                  : "/inbox")
              }
              className="flex items-center gap-2 w-full sm:w-auto justify-center"
              size="sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="sm:inline">
                {isTraveler ? "Chat with Agent" : "Chat with Traveler"}
              </span>
            </Button>
            <Badge
              className={`${config.color} px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold`}
            >
              {config.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-1">
          {/* Status Card */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">
                Booking Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className={`p-3 sm:p-4 rounded-lg border ${config.color}`}>
                <p className="font-medium text-sm sm:text-base">
                  {statusDescription}
                </p>
              </div>

              {/* Timeline */}
              <div className="mt-6 space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="w-0.5 h-12 bg-slate-200"></div>
                  </div>
                  <div className="flex-1 pb-8">
                    <h3 className="font-semibold text-slate-900">
                      Request Submitted
                    </h3>
                    <p className="text-sm text-slate-600">
                      {new Date(booking.requested_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {booking.accepted_at && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      {booking.confirmed_at && (
                        <div className="w-0.5 h-12 bg-slate-200"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <h3 className="font-semibold text-slate-900">
                        Accepted by Agent
                      </h3>
                      <p className="text-sm text-slate-600">
                        {new Date(booking.accepted_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {booking.confirmed_at && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        Booking Confirmed
                      </h3>
                      <p className="text-sm text-slate-600">
                        {new Date(booking.confirmed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {showPaymentButton && !showPaymentForm && (
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h3 className="font-semibold text-amber-900 mb-2 text-sm sm:text-base">
                    {booking.status === "payment_failed"
                      ? "Retry Payment"
                      : "Action Required: Pay Deposit"}
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-700 mb-2">
                    {booking.status === "payment_failed"
                      ? "Your previous payment failed. Please try again to secure your spot."
                      : booking.status === "pending"
                      ? "Pay your deposit to secure your spot. The agent will review your booking once payment is confirmed."
                      : "To submit your booking request, please complete the deposit payment."}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-amber-900 mb-3 sm:mb-4">
                    Deposit: RM{depositAmount}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                      onClick={() => setShowPaymentForm(true)}
                      className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto"
                    >
                      {booking.status === "payment_failed"
                        ? "Retry Payment"
                        : "Pay Deposit Now"}
                    </Button>
                    {["pending", "pending_payment", "payment_failed"].includes(
                      booking.status
                    ) && (
                      <Button
                        variant="outline"
                        onClick={handleCancelBooking}
                        className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                      >
                        Cancel Booking
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {showPaymentForm && (
                <div className="mt-6">
                  <PaymentForm
                    bookingId={booking.id}
                    amount={depositAmount}
                    onSuccess={handlePaymentSuccess}
                    onCancel={() => setShowPaymentForm(false)}
                  />
                </div>
              )}

              {booking.status === "accepted" && isTraveler && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900 mb-1">
                        🎉 Your Spot is Confirmed!
                      </h3>
                      <p className="text-sm text-green-700 mb-3">
                        Great news! The agent has accepted your booking request.
                        They will be in touch with you soon with more details
                        about the trip.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() =>
                          (window.location.href = booking.conversation_id
                            ? `/inbox?conversation=${booking.conversation_id}`
                            : "/inbox")
                        }
                        className="border-green-300 text-green-700 hover:bg-green-100"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        Chat with Agent
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {booking.status === "accepted" && !isTraveler && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900 mb-1">
                        🎉 Congrats! You Have a New Traveler!
                      </h3>
                      <p className="text-sm text-green-700 mb-3">
                        Great news!{" "}
                        {booking.traveler?.full_name || "A traveler"} is now on
                        board for this trip. Keep in touch with them through
                        your existing chat to share trip details, itinerary
                        updates, and answer any questions they may have.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() =>
                          (window.location.href = booking.conversation_id
                            ? `/inbox?conversation=${booking.conversation_id}`
                            : "/inbox")
                        }
                        className="border-green-300 text-green-700 hover:bg-green-100"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        Chat with Traveler
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {booking.status === "payment_processing" && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <svg
                      className="animate-spin h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-blue-900">
                        Processing Payment
                      </h3>
                      <p className="text-sm text-blue-700">
                        Please wait while we process your payment...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {booking.status === "pending_review" && (
                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-purple-900">
                        Payment Received!
                      </h3>
                      <p className="text-sm text-purple-700">
                        The agent will review your booking request shortly.
                      </p>
                    </div>
                  </div>
                  {booking.payment_status && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm text-purple-700">
                        Payment Status:
                      </span>
                      <PaymentStatusBadge status={booking.payment_status} />
                    </div>
                  )}
                </div>
              )}

              {booking.status === "joined" && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-green-900">
                        You're In!
                      </h3>
                      <p className="text-sm text-green-700">
                        Welcome to the group! Get ready for your adventure.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Your Notes */}
          {booking.traveler_notes && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">
                  Your Message
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <p className="text-sm sm:text-base text-slate-700">
                  {booking.traveler_notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
          {/* Travel Group Info */}
          {booking.listing && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">
                  Travel Group
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <img
                  src={
                    booking.listing.first_image_url ||
                    `https://picsum.photos/seed/${booking.listing.id}/400/300`
                  }
                  alt={booking.listing.title}
                  className="w-full h-36 sm:h-48 object-cover rounded-lg mb-3 sm:mb-4"
                />
                <h3 className="font-bold text-base sm:text-lg mb-2">
                  {booking.listing.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-2">
                  {booking.listing.destination}
                </p>
                {booking.listing.start_date && (
                  <p className="text-xs sm:text-sm text-slate-600">
                    <strong>Date:</strong>{" "}
                    {new Date(booking.listing.start_date).toLocaleDateString()}
                  </p>
                )}
                {booking.listing.price_min && (
                  <p className="text-xs sm:text-sm text-slate-600">
                    <strong>Price:</strong> RM{booking.listing.price_min} per
                    person
                  </p>
                )}
                <Button
                  variant="outline"
                  className="w-full mt-3 sm:mt-4 text-sm"
                  size="sm"
                  onClick={() =>
                    (window.location.href = `/travel/${booking.listing.id}`)
                  }
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Deposit Calculation */}
          {isTraveler &&
            [
              "pending",
              "pending_payment",
              "payment_failed",
              "accepted",
              "hold",
            ].includes(booking.status) && (
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-slate-600">
                        Trip Price (per person)
                      </span>
                      <span className="font-medium">
                        RM{booking.listing?.price_min || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-slate-600">Deposit Rate</span>
                      <span className="font-medium">20%</span>
                    </div>
                    <div className="border-t pt-2 sm:pt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-900 text-sm sm:text-base">
                          Deposit Required
                        </span>
                        <span className="font-bold text-base sm:text-lg text-amber-600">
                          RM{depositAmount}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-2">
                      The deposit secures your spot. The remaining balance will
                      be due before the trip.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Quick Actions */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-2">
              <Button
                variant="outline"
                className="w-full text-sm"
                size="sm"
                onClick={() => (window.location.href = "/explore")}
              >
                Browse More Trips
              </Button>
              <Button
                variant="outline"
                className="w-full text-sm"
                size="sm"
                onClick={() => (window.location.href = "/profile")}
              >
                My Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success/Error Dialog */}
      <Dialog
        open={dialogState.type === "success" || dialogState.type === "error"}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle
              className={
                dialogState.type === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {dialogState.title}
            </DialogTitle>
            <DialogDescription className="text-slate-600 pt-2">
              {dialogState.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={closeDialog} className="w-full sm:w-auto">
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-amber-600">
              Cancel Booking?
            </DialogTitle>
            <DialogDescription className="text-slate-600 pt-2">
              Are you sure you want to cancel this booking? If you have made a
              payment, a refund will be initiated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirm(false)}
              disabled={isProcessing}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancelBooking}
              disabled={isProcessing}
            >
              {isProcessing ? "Cancelling..." : "Yes, Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
