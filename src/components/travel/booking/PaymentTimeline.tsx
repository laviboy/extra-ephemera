import { Check, AlertTriangle } from "lucide-react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";

// Payment milestone type
export interface PaymentMilestone {
  id: number;
  name: string;
  amount: number;
  percentage: number;
  dueDate: Date;
  status: "paid" | "current" | "upcoming" | "overdue";
  description: string;
}

// Helper function to calculate payment milestones
export function calculatePaymentMilestones(
  totalPrice: number,
  tripStartDate: Date | null,
  bookingStatus: string,
  paymentStatus?: string
): PaymentMilestone[] {
  const depositAmount = Math.round(totalPrice * 0.2);
  const remainingAmount = totalPrice - depositAmount;
  const secondPayment = Math.round(remainingAmount / 2);
  const finalPayment = remainingAmount - secondPayment;

  const now = new Date();
  const tripDate =
    tripStartDate || new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  const depositDueDate = new Date();
  const secondPaymentDueDate = new Date(
    tripDate.getTime() - 30 * 24 * 60 * 60 * 1000
  );
  const finalPaymentDueDate = new Date(
    tripDate.getTime() - 14 * 24 * 60 * 60 * 1000
  );

  const isDepositPaid =
    ["pending_review", "accepted", "confirmed", "joined"].includes(
      bookingStatus
    ) ||
    (paymentStatus !== undefined &&
      ["succeeded", "processing"].includes(paymentStatus));

  const isSecondPaid = ["confirmed", "joined"].includes(bookingStatus);
  const isFinalPaid = bookingStatus === "joined";

  const getStatus = (
    isPaid: boolean,
    dueDate: Date,
    isNext: boolean
  ): PaymentMilestone["status"] => {
    if (isPaid) return "paid";
    if (isNext) return now > dueDate ? "overdue" : "current";
    return "upcoming";
  };

  return [
    {
      id: 1,
      name: "Deposit",
      amount: depositAmount,
      percentage: 20,
      dueDate: depositDueDate,
      status: getStatus(isDepositPaid, depositDueDate, !isDepositPaid),
      description: "Secure your spot in this trip",
    },
    {
      id: 2,
      name: "Second Payment",
      amount: secondPayment,
      percentage: 40,
      dueDate: secondPaymentDueDate,
      status: getStatus(
        isSecondPaid,
        secondPaymentDueDate,
        isDepositPaid && !isSecondPaid
      ),
      description: "Due 30 days before trip",
    },
    {
      id: 3,
      name: "Final Payment",
      amount: finalPayment,
      percentage: 40,
      dueDate: finalPaymentDueDate,
      status: getStatus(
        isFinalPaid,
        finalPaymentDueDate,
        isSecondPaid && !isFinalPaid
      ),
      description: "Due 14 days before trip",
    },
  ];
}

interface PaymentTimelineProps {
  milestones: PaymentMilestone[];
  onPayNow?: () => void;
}

export function PaymentTimeline({
  milestones,
  onPayNow,
}: PaymentTimelineProps) {
  const totalPaid = milestones
    .filter((m) => m.status === "paid")
    .reduce((sum, m) => sum + m.amount, 0);
  const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
  const progressPercentage =
    totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

  const statusColors: Record<PaymentMilestone["status"], string> = {
    paid: "bg-emerald-500 border-emerald-500",
    current: "bg-amber-500 border-amber-500 animate-pulse",
    upcoming: "bg-slate-200 border-slate-300",
    overdue: "bg-red-500 border-red-500",
  };

  const statusBgColors: Record<PaymentMilestone["status"], string> = {
    paid: "bg-emerald-50 border-emerald-200",
    current: "bg-amber-50 border-amber-200",
    upcoming: "bg-slate-50 border-slate-200",
    overdue: "bg-red-50 border-red-200",
  };

  const statusTextColors: Record<PaymentMilestone["status"], string> = {
    paid: "text-emerald-700",
    current: "text-amber-700",
    upcoming: "text-slate-500",
    overdue: "text-red-700",
  };

  const statusLabels: Record<PaymentMilestone["status"], string> = {
    paid: "Paid",
    current: "Due Now",
    upcoming: "Upcoming",
    overdue: "Overdue",
  };

  return (
    <div className="space-y-4">
      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 sm:p-5 border border-emerald-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <h4 className="font-semibold text-slate-900 text-sm sm:text-base">
              Payment Progress
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
              RM{totalPaid.toLocaleString()} of RM{totalAmount.toLocaleString()}{" "}
              paid
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {milestones.map((milestone, index) => {
          const isLast = index === milestones.length - 1;

          return (
            <div key={milestone.id} className="flex gap-3 sm:gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center ${
                    statusColors[milestone.status]
                  } text-white flex-shrink-0`}
                >
                  {milestone.status === "paid" ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : milestone.status === "overdue" ? (
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <span className="text-xs sm:text-sm font-bold text-slate-400">
                      {milestone.id}
                    </span>
                  )}
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 h-full min-h-[60px] ${
                      milestone.status === "paid"
                        ? "bg-emerald-300"
                        : "bg-slate-200"
                    }`}
                  />
                )}
              </div>

              <div className="flex-1 pb-4 sm:pb-6">
                <div
                  className={`rounded-xl border p-3 sm:p-4 ${
                    statusBgColors[milestone.status]
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-slate-900 text-sm sm:text-base">
                          {milestone.name}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`text-[10px] sm:text-xs ${
                            statusTextColors[milestone.status]
                          }`}
                        >
                          {statusLabels[milestone.status]}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        {milestone.description}
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
                        Due:{" "}
                        {milestone.dueDate.toLocaleDateString("en-MY", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-lg sm:text-xl font-bold text-slate-900">
                        RM{milestone.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-500">
                        {milestone.percentage}% of total
                      </p>
                    </div>
                  </div>
                  {(milestone.status === "current" ||
                    milestone.status === "overdue") &&
                    onPayNow && (
                      <Button
                        onClick={onPayNow}
                        className={`w-full mt-3 ${
                          milestone.status === "overdue"
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-amber-600 hover:bg-amber-700"
                        }`}
                        size="sm"
                      >
                        {milestone.status === "overdue"
                          ? "Pay Now (Overdue)"
                          : "Pay Now"}
                      </Button>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
