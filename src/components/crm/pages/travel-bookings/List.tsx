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

export function TravelBookingsList() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

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
        alert(
          "Booking accepted! A conversation has been created with the traveler."
        );
        fetchBookings();
      }
    } catch (error) {
      console.error("Error accepting booking:", error);
      alert("Failed to accept booking");
    }
  };

  const handleReject = async (bookingId: number) => {
    if (!confirm("Are you sure you want to reject this booking?")) return;

    try {
      const accessToken = getAccessToken();
      const response = await fetch(`/api/travel-bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (response.ok) {
        alert("Booking rejected");
        fetchBookings();
      }
    } catch (error) {
      console.error("Error rejecting booking:", error);
      alert("Failed to reject booking");
    }
  };

  const handleConfirmDeposit = async (bookingId: number) => {
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
        alert("Deposit confirmed! Booking is now complete.");
        fetchBookings();
      }
    } catch (error) {
      console.error("Error confirming deposit:", error);
      alert("Failed to confirm deposit");
    }
  };

  const statusConfig: Record<string, { label: string; variant: any }> = {
    pending: { label: "Pending", variant: "secondary" },
    accepted: { label: "Accepted", variant: "default" },
    hold: { label: "On Hold", variant: "default" },
    deposit_pending: { label: "Deposit Pending", variant: "secondary" },
    confirmed: { label: "Confirmed", variant: "default" },
    cancelled: { label: "Cancelled", variant: "destructive" },
    rejected: { label: "Rejected", variant: "destructive" },
  };

  const filteredBookings =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const depositPendingCount = bookings.filter(
    (b) => b.status === "deposit_pending"
  ).length;
  const confirmedCount = bookings.filter(
    (b) => b.status === "confirmed"
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
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {pendingCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Awaiting Deposit</CardDescription>
            <CardTitle className="text-3xl text-purple-600">
              {depositPendingCount}
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
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="deposit_pending">
            Deposit Pending ({depositPendingCount})
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
                          >
                            {statusConfig[booking.status]?.label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-600">Traveler:</span>
                            <span className="ml-2 font-medium">
                              {booking.traveler?.email || "Unknown"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600">Requested:</span>
                            <span className="ml-2 font-medium">
                              {new Date(
                                booking.requestedAt
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
                        </div>

                        {booking.travelerNotes && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-600 font-medium mb-1">
                              Traveler's Message:
                            </p>
                            <p className="text-sm text-slate-700">
                              {booking.travelerNotes}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-4">
                          {booking.status === "pending" && (
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
                                (window.location.href = `/crm/conversations/${booking.conversationId}`)
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
    </div>
  );
}
