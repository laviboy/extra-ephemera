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
        alert(
          "Payment submitted! The agent will confirm your deposit shortly."
        );
        fetchBookingDetails();
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("An error occurred. Please try again.");
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
    pending: {
      label: "Pending Review",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      description: "Your booking request is pending review by the agent.",
    },
    accepted: {
      label: "Accepted",
      color: "bg-blue-100 text-blue-800 border-blue-300",
      description:
        "Your booking has been accepted! Please proceed with the deposit payment.",
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
  const isTraveler = user?.id === booking.travelerId;
  const showPaymentButton =
    isTraveler && (booking.status === "accepted" || booking.status === "hold");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Booking Details
            </h1>
            <p className="text-slate-600">Booking ID: #{booking.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/inbox")}
              className="flex items-center gap-2"
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
              {isTraveler ? "Chat with Agent" : "Chat with Traveler"}
            </Button>
            <Badge
              className={`${config.color} px-4 py-2 text-sm font-semibold`}
            >
              {config.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg border ${config.color}`}>
                <p className="font-medium">{config.description}</p>
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
                      {new Date(booking.requestedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {booking.acceptedAt && (
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
                      {booking.confirmedAt && (
                        <div className="w-0.5 h-12 bg-slate-200"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <h3 className="font-semibold text-slate-900">
                        Accepted by Agent
                      </h3>
                      <p className="text-sm text-slate-600">
                        {new Date(booking.acceptedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {booking.confirmedAt && (
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
                        {new Date(booking.confirmedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {showPaymentButton && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Action Required: Pay Deposit
                  </h3>
                  <p className="text-sm text-blue-700 mb-4">
                    To secure your spot, please complete the deposit payment.
                  </p>
                  <Button
                    onClick={handlePayDeposit}
                    disabled={isPayingDeposit}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isPayingDeposit
                      ? "Processing..."
                      : "Pay Deposit (Mock Payment)"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Your Notes */}
          {booking.travelerNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Your Message</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">{booking.travelerNotes}</p>
              </CardContent>
            </Card>
          )}

          {/* Conversation */}
          {booking.conversation && (
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>
                  Chat with the {isTraveler ? "agent" : "traveler"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4">
                  {booking.messages && booking.messages.length > 0 ? (
                    booking.messages.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.senderId === user?.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.senderId === user?.id
                              ? "bg-rose-500 text-white"
                              : "bg-slate-100 text-slate-900"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-500 py-4">
                      No messages yet
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setNewMessage(e.target.value)
                    }
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      // TODO: Implement send message
                      alert("Message feature coming soon");
                    }}
                    disabled={!newMessage.trim() || isSendingMessage}
                    className="bg-rose-500 hover:bg-rose-600"
                  >
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Travel Group Info */}
          {booking.listing && (
            <Card>
              <CardHeader>
                <CardTitle>Travel Group</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={
                    booking.listing.first_image_url ||
                    `https://picsum.photos/seed/${booking.listing.id}/400/300`
                  }
                  alt={booking.listing.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="font-bold text-lg mb-2">
                  {booking.listing.title}
                </h3>
                <p className="text-sm text-slate-600 mb-2">
                  {booking.listing.destination}
                </p>
                {booking.listing.start_date && (
                  <p className="text-sm text-slate-600">
                    <strong>Date:</strong>{" "}
                    {new Date(booking.listing.start_date).toLocaleDateString()}
                  </p>
                )}
                {booking.listing.price_min && (
                  <p className="text-sm text-slate-600">
                    <strong>Price:</strong> ${booking.listing.price_min} per
                    person
                  </p>
                )}
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() =>
                    (window.location.href = `/travel/${booking.listing.id}`)
                  }
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => (window.location.href = "/explore")}
              >
                Browse More Trips
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => (window.location.href = "/profile")}
              >
                My Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
