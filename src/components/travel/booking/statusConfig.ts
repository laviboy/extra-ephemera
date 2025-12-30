export const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; description: string }
> = {
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
  pending: {
    label: "Payment Required",
    color: "bg-amber-100 text-amber-800 border-amber-300",
    description:
      "Pay your deposit to secure your spot. The agent will review your booking once payment is confirmed.",
  },
  accepted: {
    label: "Booking Accepted",
    color: "bg-green-100 text-green-800 border-green-300",
    description: "Great news! Your booking spot has been accepted.",
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

export function getStatusDescription(
  status: string,
  isTraveler: boolean,
  travelerName?: string,
  defaultDescription?: string
): string {
  const name = travelerName || "A traveler";

  if (status === "accepted") {
    return isTraveler
      ? "Great news! Your booking spot has been accepted. The agent will keep in touch with you for more details. You can connect with them anytime using the chat!"
      : `Congrats! ${name} is now on board for this trip. Keep in touch with them through your chat to share trip details and updates.`;
  }

  if (status === "pending" || status === "pending_payment") {
    return isTraveler
      ? "Pay your deposit to secure your spot. The agent will review your booking once payment is confirmed. You can also start a chat with the agent to introduce yourself or ask any questions."
      : `${name} is interested in joining this trip! Please wait while they complete their deposit payment. Stay alert — they might reach out via chat with questions!`;
  }

  if (status === "pending_review") {
    return isTraveler
      ? "Payment received! The agent is reviewing your booking request."
      : `${name} has paid the deposit and is waiting for your review. Accept or decline their booking request.`;
  }

  return defaultDescription || STATUS_CONFIG[status]?.description || "";
}
