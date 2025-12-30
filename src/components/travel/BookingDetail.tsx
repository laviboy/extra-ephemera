import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../stores/useAuth";
import { Button } from "../ui/button";
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
import {
  MessageCircle,
  Check,
  X,
  Info,
  Loader2,
  DollarSign,
  ClipboardList,
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  Search,
  User,
  UserPlus,
  ShieldAlert,
} from "lucide-react";

import {
  PaymentTimeline,
  calculatePaymentMilestones,
  TripCountdown,
  TripInfoCard,
  PreTripChecklist,
  STATUS_CONFIG,
  getStatusDescription,
} from "./booking";

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
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>({
    type: null,
    title: "",
    message: "",
  });
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const tripStartDate = useMemo(() => {
    if (!booking?.listing?.start_date) return null;
    const date = new Date(booking.listing.start_date);
    return isNaN(date.getTime()) ? null : date;
  }, [booking?.listing?.start_date]);

  const totalPrice = booking?.listing?.price_min || 1000;

  const paymentMilestones = useMemo(
    () =>
      calculatePaymentMilestones(
        totalPrice,
        tripStartDate,
        booking?.status || "pending",
        booking?.payment_status
      ),
    [totalPrice, tripStartDate, booking?.status, booking?.payment_status]
  );

  const tripDuration = useMemo(() => {
    if (booking?.listing?.start_date && booking?.listing?.end_date) {
      const start = new Date(booking.listing.start_date);
      const end = new Date(booking.listing.end_date);
      const diff = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      return `${diff} days ${diff - 1} nights`;
    }
    return null;
  }, [booking?.listing?.start_date, booking?.listing?.end_date]);

  const getAccessToken = () => {
    const rawSession = localStorage.getItem(
      "sb-tomxahjmbfkcrfszuhpo-auth-token"
    );
    const session = rawSession ? JSON.parse(rawSession) : null;
    return session?.access_token;
  };

  const fetchBookingDetails = async () => {
    try {
      const accessToken = getAccessToken();
      const response = await fetch(`/api/travel-bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
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

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  // NOW SAFE TO DO CONDITIONAL RETURNS
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-rose-500 mx-auto" />
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

  const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const isTraveler = user?.id === booking.traveler_id;
  const statusDescription = getStatusDescription(
    booking.status,
    isTraveler,
    booking.traveler?.full_name,
    config.description
  );

  const showPaymentButton =
    isTraveler &&
    ["pending", "pending_payment", "payment_failed"].includes(booking.status);

  const depositAmount =
    booking.payment_required_amount ||
    booking.depositAmount ||
    Math.round((booking.listing?.price_min || 1000) * 0.2);

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    fetchBookingDetails();
  };

  const handleCancelBooking = () => setShowCancelConfirm(true);

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

  const closeDialog = () =>
    setDialogState({ type: null, title: "", message: "" });

  const goToChat = () => {
    window.location.href = booking.conversation_id
      ? `/inbox?conversation=${booking.conversation_id}`
      : "/inbox";
  };

  const StatusIcon = () => {
    if (["accepted", "confirmed", "joined"].includes(booking.status)) {
      return <Check className="w-5 h-5" />;
    }
    if (["rejected", "cancelled"].includes(booking.status)) {
      return <X className="w-5 h-5" />;
    }
    return <Info className="w-5 h-5" />;
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                className={`${config.color} px-3 py-1 text-xs font-semibold`}
              >
                {config.label}
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-1">
              {booking.listing?.title || "Trip Booking"}
            </h1>
            <p className="text-sm text-slate-500">
              Booking #{String(booking.id).slice(0, 8)}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={goToChat}
            className="flex items-center gap-2 w-full sm:w-auto justify-center"
            size="sm"
          >
            <MessageCircle className="w-4 h-4" />
            {isTraveler ? "Chat with Agent" : "Chat with Traveler"}
          </Button>
        </div>
      </div>

      {/* Status Alert Banner */}
      <div className={`rounded-xl border p-4 ${config.color}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <StatusIcon />
          </div>
          <p className="font-medium text-sm sm:text-base flex-1">
            {statusDescription}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Trip Countdown - Mobile */}
          {tripStartDate && (
            <div className="lg:hidden">
              <TripCountdown startDate={tripStartDate} />
            </div>
          )}

          {/* Payment Timeline Card */}
          <Card className="border-slate-200">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Payment Schedule
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Your payment is split into 3 easy installments
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-2 sm:pt-3">
              <PaymentTimeline
                milestones={paymentMilestones}
                onPayNow={
                  showPaymentButton ? () => setShowPaymentForm(true) : undefined
                }
              />

              {showPaymentForm && (
                <div className="mt-6 pt-6 border-t">
                  <PaymentForm
                    bookingId={booking.id}
                    amount={depositAmount}
                    onSuccess={handlePaymentSuccess}
                    onCancel={() => setShowPaymentForm(false)}
                  />
                </div>
              )}

              {showPaymentButton && !showPaymentForm && (
                <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCancelBooking}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto"
                    size="sm"
                  >
                    Cancel Booking
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Timeline Card */}
          <Card className="border-slate-200">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                Booking Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-2 sm:pt-3">
              <div className="space-y-4">
                {/* Request Submitted */}
                <TimelineItem
                  completed
                  title="Request Submitted"
                  date={new Date(booking.requested_at).toLocaleString()}
                  showLine={true}
                />

                {/* Accepted */}
                {booking.accepted_at ? (
                  <TimelineItem
                    completed
                    title="Accepted by Agent"
                    date={new Date(booking.accepted_at).toLocaleString()}
                    showLine={!!booking.confirmed_at}
                  />
                ) : (
                  <TimelineItem
                    title="Agent Review"
                    date="Pending"
                    pending
                    showLine={true}
                  />
                )}

                {/* Confirmed */}
                {booking.confirmed_at ? (
                  <TimelineItem
                    completed
                    title="Booking Confirmed"
                    date={new Date(booking.confirmed_at).toLocaleString()}
                    showLine={false}
                  />
                ) : (
                  <TimelineItem
                    title="Trip Confirmed"
                    date="Pending"
                    pending
                    showLine={false}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status-specific Cards */}
          <StatusCard
            booking={booking}
            isTraveler={isTraveler}
            goToChat={goToChat}
          />

          {/* Traveler Notes */}
          {booking.traveler_notes && (
            <Card className="border-slate-200">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-slate-600" />
                  Your Message to Agent
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2 sm:pt-3">
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                  {booking.traveler_notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Trip Countdown - Desktop */}
          {tripStartDate && (
            <div className="hidden lg:block">
              <TripCountdown startDate={tripStartDate} />
            </div>
          )}

          {/* Trip Details */}
          {booking.listing && (
            <Card className="border-slate-200 overflow-hidden">
              <div className="relative">
                <img
                  src={
                    booking.listing.first_image_url ||
                    `https://picsum.photos/seed/${booking.listing.id}/400/200`
                  }
                  alt={booking.listing.title}
                  className="w-full h-32 sm:h-40 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-bold text-white text-sm sm:text-base line-clamp-1">
                    {booking.listing.title}
                  </h3>
                  <p className="text-white/90 text-xs sm:text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {booking.listing.destination}
                  </p>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <TripInfoCard
                    icon={<Calendar className="w-4 h-4" />}
                    label="Departure"
                    value={
                      tripStartDate
                        ? tripStartDate.toLocaleDateString("en-MY", {
                            day: "numeric",
                            month: "short",
                          })
                        : "TBA"
                    }
                  />
                  <TripInfoCard
                    icon={<Clock className="w-4 h-4" />}
                    label="Duration"
                    value={tripDuration || "TBA"}
                  />
                </div>
                <TripInfoCard
                  icon={<Users className="w-4 h-4" />}
                  label="Group Size"
                  value={`${
                    booking.listing.max_group_size || 10
                  } travelers max`}
                />
                <Button
                  variant="outline"
                  className="w-full text-sm"
                  size="sm"
                  onClick={() =>
                    (window.location.href = `/travel/${booking.listing.id}`)
                  }
                >
                  View Full Trip Details
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Pre-Trip Checklist */}
          {isTraveler &&
            ["accepted", "confirmed", "joined", "pending_review"].includes(
              booking.status
            ) &&
            tripStartDate && (
              <Card className="border-slate-200">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <span>✅</span>
                    Pre-Trip Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <PreTripChecklist tripDate={tripStartDate} />
                </CardContent>
              </Card>
            )}

          {/* Cancellation Policy */}
          {booking.listing?.cancellation_policy && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-amber-800">
                  <ShieldAlert className="w-5 h-5" />
                  Cancellation Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <p className="text-sm text-amber-900 leading-relaxed">
                  {booking.listing.cancellation_policy}
                </p>
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <p className="text-xs text-amber-700">
                    💡 Please review this policy before making any changes to
                    your booking.
                  </p>
                </div>
                {isTraveler &&
                  !["cancelled", "rejected"].includes(booking.status) && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        onClick={handleCancelBooking}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel My Booking
                      </Button>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}

          {/* Need Help */}
          <Card className="border-slate-200">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Phone className="w-5 h-5 text-slate-600" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start text-sm"
                size="sm"
                onClick={goToChat}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Message {isTraveler ? "Agent" : "Traveler"}
              </Button>
              <p className="text-xs text-slate-500 text-center">
                For urgent matters, use the chat feature
              </p>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="border-slate-200">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base sm:text-lg">
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-9"
                onClick={() => (window.location.href = "/explore")}
              >
                <Search className="w-4 h-4 mr-2 text-slate-500" />
                Browse More Trips
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-9"
                onClick={() => (window.location.href = "/travel-bookings")}
              >
                <ClipboardList className="w-4 h-4 mr-2 text-slate-500" />
                My Bookings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-9"
                onClick={() => (window.location.href = "/profile")}
              >
                <User className="w-4 h-4 mr-2 text-slate-500" />
                My Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
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

      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              Cancel Your Booking?
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-slate-600 pt-2 space-y-3">
                <p>Are you sure you want to cancel this booking? This means:</p>
                <ul className="text-sm space-y-2 list-none">
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>
                      You will <strong>give up your spot</strong> in this travel
                      group
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Your spot may be taken by another traveler</span>
                  </li>
                  {booking?.payment_status === "paid" && (
                    <li className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>
                        Refund will be processed according to the cancellation
                        policy
                      </span>
                    </li>
                  )}
                </ul>
                {booking?.listing?.cancellation_policy && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                    <p className="text-xs font-medium text-amber-800 mb-1">
                      Cancellation Policy:
                    </p>
                    <p className="text-xs text-amber-700">
                      {booking.listing.cancellation_policy}
                    </p>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirm(false)}
              disabled={isProcessing}
            >
              Keep My Booking
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancelBooking}
              disabled={isProcessing}
            >
              {isProcessing ? "Cancelling..." : "Yes, Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Timeline Item Component
function TimelineItem({
  completed,
  pending,
  title,
  date,
  showLine,
}: {
  completed?: boolean;
  pending?: boolean;
  title: string;
  date: string;
  showLine: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            completed
              ? "bg-green-500 text-white"
              : "bg-slate-200 text-slate-400"
          }`}
        >
          {completed ? (
            <Check className="w-5 h-5" />
          ) : (
            <span className="text-sm">•</span>
          )}
        </div>
        {showLine && <div className="w-0.5 h-12 bg-slate-200" />}
      </div>
      <div className="flex-1 pb-2">
        <h3
          className={`font-semibold text-sm sm:text-base ${
            pending ? "text-slate-400" : "text-slate-900"
          }`}
        >
          {title}
        </h3>
        <p
          className={`text-xs sm:text-sm ${
            pending ? "text-slate-400" : "text-slate-600"
          }`}
        >
          {date}
        </p>
      </div>
    </div>
  );
}

// Status-specific Card Component
function StatusCard({
  booking,
  isTraveler,
  goToChat,
}: {
  booking: any;
  isTraveler: boolean;
  goToChat: () => void;
}) {
  if (booking.status === "accepted" && isTraveler) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-1">
                🎉 Your Spot is Confirmed!
              </h3>
              <p className="text-sm text-green-700 mb-3">
                The agent has accepted your booking. They will share more
                details about the trip soon.
              </p>
              <Button
                variant="outline"
                onClick={goToChat}
                className="border-green-300 text-green-700 hover:bg-green-100"
                size="sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat with Agent
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (booking.status === "accepted" && !isTraveler) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-1">
                🎉 New Traveler Joined!
              </h3>
              <p className="text-sm text-green-700 mb-3">
                {booking.traveler?.full_name || "A traveler"} is now on board.
                Keep in touch through chat.
              </p>
              <Button
                variant="outline"
                onClick={goToChat}
                className="border-green-300 text-green-700 hover:bg-green-100"
                size="sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat with Traveler
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (booking.status === "payment_processing") {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <div>
              <h3 className="font-semibold text-blue-900">
                Processing Payment
              </h3>
              <p className="text-sm text-blue-700">
                Please wait while we process your payment...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (booking.status === "pending_review") {
    return (
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <Check className="h-6 w-6 text-purple-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900">
                Payment Received!
              </h3>
              <p className="text-sm text-purple-700">
                The agent will review your booking request shortly.
              </p>
            </div>
            {booking.payment_status && (
              <PaymentStatusBadge status={booking.payment_status} />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (booking.status === "joined") {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <Check className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">🎉 You're In!</h3>
              <p className="text-sm text-green-700">
                Welcome to the group! Get ready for your adventure.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
