import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";

// Dialog state type
type DialogState = {
  type: "success" | "confirm" | "error" | null;
  title: string;
  message: string;
  bookingId?: number;
  action?: "accept" | "reject" | "confirm-deposit";
};

export function TravelBookingsList() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [dialogState, setDialogState] = useState<DialogState>({
    type: null,
    title: "",
    message: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const getAccessToken = () => {
    const rawSession = localStorage.getItem(
      "sb-tomxahjmbfkcrfszuhpo-auth-token"
    );
    const session = rawSession ? JSON.parse(rawSession) : null;
    return session?.access_token;
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const accessToken = getAccessToken();
      const response = await fetch("/api/travel-bookings?role=agent", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        const { bookings } = await response.json();
        setBookings(bookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (bookingId: number) => {
    setIsProcessing(true);
    try {
      const accessToken = getAccessToken();
      const response = await fetch(`/api/travel-bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: "accepted" }),
      });

      if (response.ok) {
        setDialogState({
          type: "success",
          title: "Booking Accepted! 🎉",
          message:
            "The traveler has been notified and a conversation has been created. You can now chat with them to share trip details.",
        });
        fetchBookings();
      } else {
        setDialogState({
          type: "error",
          title: "Failed to Accept",
          message: "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error accepting booking:", error);
      setDialogState({
        type: "error",
        title: "Error",
        message: "Failed to accept booking. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (bookingId: number) => {
    setDialogState({
      type: "confirm",
      title: "Reject Booking?",
      message:
        "Are you sure you want to reject this booking? The traveler will be notified and if they have paid, a refund will be initiated.",
      bookingId,
      action: "reject",
    });
  };

  const confirmReject = async () => {
    if (!dialogState.bookingId) return;
    setIsProcessing(true);

    try {
      const accessToken = getAccessToken();
      const response = await fetch(
        `/api/travel-bookings/${dialogState.bookingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ status: "rejected" }),
        }
      );

      if (response.ok) {
        setDialogState({
          type: "success",
          title: "Booking Rejected",
          message: "The traveler has been notified.",
        });
        fetchBookings();
      } else {
        setDialogState({
          type: "error",
          title: "Failed to Reject",
          message: "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error rejecting booking:", error);
      setDialogState({
        type: "error",
        title: "Error",
        message: "Failed to reject booking. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDeposit = async (bookingId: number) => {
    setIsProcessing(true);
    try {
      const accessToken = getAccessToken();
      const response = await fetch(`/api/travel-bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: "confirmed", depositPaid: true }),
      });

      if (response.ok) {
        setDialogState({
          type: "success",
          title: "Deposit Confirmed! ✓",
          message:
            "The booking is now complete. The traveler has been notified.",
        });
        fetchBookings();
      } else {
        setDialogState({
          type: "error",
          title: "Failed to Confirm",
          message: "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error confirming deposit:", error);
      setDialogState({
        type: "error",
        title: "Error",
        message: "Failed to confirm deposit. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const closeDialog = () => {
    setDialogState({ type: null, title: "", message: "" });
  };

  const statusConfig: Record<
    string,
    { label: string; variant: any; className?: string }
  > = {
    pending: { label: "Awaiting Payment", variant: "secondary" },
    pending_payment: { label: "Awaiting Payment", variant: "secondary" },
    payment_processing: {
      label: "Payment Processing",
      variant: "secondary",
      className: "bg-blue-100 text-blue-800",
    },
    payment_failed: { label: "Payment Failed", variant: "destructive" },
    pending_review: {
      label: "Deposit Paid - Review",
      variant: "default",
      className: "bg-purple-600 hover:bg-purple-700 text-white",
    },
    joined: {
      label: "Joined",
      variant: "default",
      className: "bg-green-600 hover:bg-green-700 text-white",
    },
    accepted: {
      label: "Accepted",
      variant: "default",
      className: "bg-green-600 hover:bg-green-700 text-white",
    },
    hold: { label: "On Hold", variant: "default" },
    deposit_pending: { label: "Deposit Pending", variant: "secondary" },
    confirmed: {
      label: "Confirmed",
      variant: "default",
      className: "bg-green-600 hover:bg-green-700 text-white",
    },
    cancelled: { label: "Cancelled", variant: "destructive" },
    rejected: { label: "Rejected", variant: "destructive" },
  };

  const filteredBookings =
    filter === "all"
      ? bookings
      : filter === "pending"
      ? bookings.filter((b) =>
          ["pending", "pending_payment"].includes(b.status)
        )
      : filter === "pending_review"
      ? bookings.filter(
          (b) =>
            b.status === "pending_review" ||
            (b.status === "pending" && b.deposit_paid)
        )
      : filter === "confirmed"
      ? bookings.filter((b) =>
          ["confirmed", "joined", "accepted"].includes(b.status)
        )
      : bookings.filter((b) => b.status === filter);

  const pendingCount = bookings.filter(
    (b) => ["pending", "pending_payment"].includes(b.status) && !b.deposit_paid
  ).length;
  const pendingReviewCount = bookings.filter(
    (b) =>
      b.status === "pending_review" ||
      (b.status === "pending" && b.deposit_paid)
  ).length;
  const confirmedCount = bookings.filter((b) =>
    ["confirmed", "joined", "accepted"].includes(b.status)
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Travel Group Bookings
          </h1>
          <p className="text-slate-600 mt-1">
            Manage booking requests for your travel groups
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Bookings</CardDescription>
            <CardTitle className="text-3xl">{bookings.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Awaiting Deposit</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {pendingCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Needs Review</CardDescription>
            <CardTitle className="text-3xl text-purple-600">
              {pendingReviewCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Confirmed</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {confirmedCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Awaiting Deposit ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="pending_review">
            Needs Review ({pendingReviewCount})
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmed ({confirmedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-slate-600">No bookings found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {booking.listing?.title || "Travel Group"}
                          </h3>
                          <Badge
                            variant={statusConfig[booking.status]?.variant}
                            className={statusConfig[booking.status]?.className}
                          >
                            {statusConfig[booking.status]?.label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-600">Traveler:</span>
                            <span className="ml-2 font-medium">
                              {booking.traveler?.full_name ||
                                booking.traveler?.email ||
                                "Unknown"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600">Requested:</span>
                            <span className="ml-2 font-medium">
                              {new Date(
                                booking.requested_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600">Destination:</span>
                            <span className="ml-2 font-medium">
                              {booking.listing?.destination}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600">Travel Date:</span>
                            <span className="ml-2 font-medium">
                              {booking.listing?.start_date
                                ? new Date(
                                    booking.listing.start_date
                                  ).toLocaleDateString()
                                : "TBD"}
                            </span>
                          </div>
                          {booking.status === "pending_review" && (
                            <div className="col-span-2">
                              <span className="text-slate-600">
                                Payment Status:
                              </span>
                              <Badge className="ml-2 bg-green-100 text-green-800">
                                ✓ Deposit Paid
                              </Badge>
                            </div>
                          )}
                          {booking.deposit_paid &&
                            booking.status === "pending" && (
                              <div className="col-span-2">
                                <span className="text-slate-600">
                                  Payment Status:
                                </span>
                                <Badge className="ml-2 bg-green-100 text-green-800">
                                  ✓ Deposit Paid - Ready for Review
                                </Badge>
                              </div>
                            )}
                        </div>

                        {booking.traveler_notes && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-600 font-medium mb-1">
                              Traveler's Message:
                            </p>
                            <p className="text-sm text-slate-700">
                              {booking.traveler_notes}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-4">
                          {booking.conversationId && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                (window.location.href = `/crm/messages?conversation=${booking.conversationId}`)
                              }
                              className="flex items-center gap-1"
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
                              Chat
                            </Button>
                          )}
                          {booking.status === "pending" && (
                            <>
                              {booking.deposit_paid ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAccept(booking.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Accept Booking
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject(booking.id)}
                                  >
                                    Reject
                                  </Button>
                                </>
                              ) : (
                                <p className="text-sm text-amber-600 italic">
                                  Waiting for traveler to pay deposit...
                                </p>
                              )}
                            </>
                          )}

                          {booking.status === "pending_review" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAccept(booking.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(booking.id)}
                              >
                                Reject
                              </Button>
                            </>
                          )}

                          {booking.status === "deposit_pending" && (
                            <Button
                              size="sm"
                              onClick={() => handleConfirmDeposit(booking.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Confirm Deposit Received
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              (window.location.href = `/travel-bookings/${booking.id}`)
                            }
                          >
                            View Details
                          </Button>

                          {booking.conversationId && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                (window.location.href = `/crm/messages?conversation=${booking.conversationId}`)
                              }
                            >
                              Open Chat
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogState.type === "confirm"}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-amber-600">
              {dialogState.title}
            </DialogTitle>
            <DialogDescription className="text-slate-600 pt-2">
              {dialogState.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Yes, Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
