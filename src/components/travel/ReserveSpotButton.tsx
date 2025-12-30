import { useState, useEffect } from "react";
import { useAuth } from "../../stores/useAuth";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface ReserveSpotButtonProps {
  listingId: string;
  listingTitle: string;
  availableSpots: number;
  creatorId?: string | null;
}

export function ReserveSpotButton({
  listingId,
  listingTitle,
  availableSpots,
  creatorId,
}: ReserveSpotButtonProps) {
  const user = useAuth((s) => s.user);

  // Don't show button if user is the creator
  if (user && creatorId && user.id === creatorId) {
    return null;
  }
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [travelerNotes, setTravelerNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingBooking, setExistingBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getAccessToken = () => {
    const rawSession = localStorage.getItem(
      "sb-tomxahjmbfkcrfszuhpo-auth-token"
    );
    const session = rawSession ? JSON.parse(rawSession) : null;
    return session?.access_token;
  };

  useEffect(() => {
    if (user) {
      checkExistingBooking();
    } else {
      setIsLoading(false);
    }
  }, [user, listingId]);

  const checkExistingBooking = async () => {
    try {
      const accessToken = getAccessToken();
      const response = await fetch("/api/travel-bookings?role=traveler", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        const { bookings } = await response.json();
        // Use correct field name from API: listing_id
        const booking = bookings.find((b: any) => b.listing_id === listingId);
        setExistingBooking(booking);
      }
    } catch (error) {
      console.error("Error checking existing booking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReserveClick = () => {
    if (!user) {
      window.location.href = `/become-agent?redirect=/travel/${listingId}`;
      return;
    }

    if (existingBooking) {
      window.location.href = `/travel-bookings/${existingBooking.id}`;
      return;
    }

    setIsDialogOpen(true);
  };

  const handleSubmitBooking = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const accessToken = getAccessToken();
      const response = await fetch("/api/travel-bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          listingId,
          travelerNotes,
        }),
      });

      if (response.ok) {
        const { booking } = await response.json();
        // Redirect to booking detail page
        window.location.href = `/travel-bookings/${booking.id}`;
      } else {
        const { error } = await response.json();
        alert(error || "Failed to create booking");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Button disabled className="w-full py-4">
        Loading...
      </Button>
    );
  }

  if (existingBooking) {
    // Check if deposit has been paid (payment succeeded)
    const depositPaid =
      existingBooking.payment_status === "succeeded" ||
      existingBooking.deposit_paid === true;

    // If deposit is paid, show a confirmation message instead of button
    if (depositPaid) {
      return (
        <div className="w-full p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
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
              <div className="font-bold text-green-900">You're on board!</div>
              <div className="text-sm text-green-700">
                Your deposit has been paid. See you on the trip!
              </div>
            </div>
          </div>
          <a
            href={`/travel-bookings/${existingBooking.id}`}
            className="mt-3 block text-center text-sm text-green-700 hover:text-green-800 underline"
          >
            View booking details →
          </a>
        </div>
      );
    }

    const statusColors: Record<string, string> = {
      pending: "bg-yellow-500 hover:bg-yellow-600",
      pending_payment: "bg-purple-500 hover:bg-purple-600",
      payment_processing: "bg-blue-500 hover:bg-blue-600",
      payment_failed: "bg-red-500 hover:bg-red-600",
      accepted: "bg-blue-500 hover:bg-blue-600",
      hold: "bg-blue-500 hover:bg-blue-600",
      deposit_pending: "bg-purple-500 hover:bg-purple-600",
      pending_review: "bg-yellow-500 hover:bg-yellow-600",
      joined: "bg-green-500 hover:bg-green-600",
      confirmed: "bg-green-500 hover:bg-green-600",
      cancelled: "bg-gray-500 hover:bg-gray-600",
      rejected: "bg-red-500 hover:bg-red-600",
    };

    const statusLabels: Record<string, string> = {
      pending: "Booking Pending",
      pending_payment: "Pay Deposit to Continue",
      payment_processing: "Processing Payment...",
      payment_failed: "Payment Failed - Retry",
      accepted: "Accepted - Action Required",
      hold: "On Hold",
      deposit_pending: "Deposit Pending",
      pending_review: "Awaiting Host Review",
      joined: "You're In! View Details",
      confirmed: "Booking Confirmed!",
      cancelled: "Booking Cancelled",
      rejected: "Booking Not Accepted",
    };

    return (
      <Button
        onClick={handleReserveClick}
        className={`w-full py-4 text-white font-bold transition-colors flex items-center justify-center gap-2 ${
          statusColors[existingBooking.status] ||
          "bg-rose-500 hover:bg-rose-600"
        }`}
      >
        {statusLabels[existingBooking.status] || "View Booking"}
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={handleReserveClick}
        disabled={availableSpots <= 0}
        className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {availableSpots <= 0 ? "Fully Booked" : "Reserve Your Spot"}
        {availableSpots > 0 && (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reserve Your Spot</DialogTitle>
            <DialogDescription>
              You're about to request to join "{listingTitle}". The host will
              review your request and get back to you.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tell the host why you'd like to join (optional)
            </label>
            <Textarea
              placeholder="Share a bit about yourself and why you're interested in this trip..."
              value={travelerNotes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setTravelerNotes(e.target.value)
              }
              rows={4}
              className="w-full"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitBooking}
              disabled={isSubmitting}
              className="bg-rose-500 hover:bg-rose-600"
            >
              {isSubmitting ? "Submitting..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
