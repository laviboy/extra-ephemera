import type { ReactNode } from "react";
import { Badge } from "../ui/badge";

type PaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "refunded"
  | "paid";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<
  PaymentStatus,
  { label: string; className: string; icon: ReactNode }
> = {
  pending: {
    label: "Payment Pending",
    className: "bg-gray-100 text-gray-800 border-gray-300",
    icon: (
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  processing: {
    label: "Processing",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: (
      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
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
    ),
  },
  succeeded: {
    label: "Paid",
    className: "bg-green-100 text-green-800 border-green-300",
    icon: (
      <svg
        className="w-3.5 h-3.5"
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
    ),
  },
  paid: {
    label: "Paid",
    className: "bg-green-100 text-green-800 border-green-300",
    icon: (
      <svg
        className="w-3.5 h-3.5"
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
    ),
  },
  failed: {
    label: "Failed",
    className: "bg-red-100 text-red-800 border-red-300",
    icon: (
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
  },
  refunded: {
    label: "Refunded",
    className: "bg-orange-100 text-orange-800 border-orange-300",
    icon: (
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
        />
      </svg>
    ),
  },
};

export function PaymentStatusBadge({
  status,
  showIcon = true,
  className = "",
}: PaymentStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge
      className={`${config.className} ${className} flex items-center gap-1.5 font-medium`}
      variant="outline"
    >
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );
}

// Also export a simpler inline version for tables
export function PaymentStatusDot({ status }: { status: PaymentStatus }) {
  const colorMap: Record<PaymentStatus, string> = {
    pending: "bg-gray-400",
    processing: "bg-yellow-400",
    succeeded: "bg-green-400",
    paid: "bg-green-400",
    failed: "bg-red-400",
    refunded: "bg-orange-400",
  };

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${
        colorMap[status] || "bg-gray-400"
      }`}
      title={statusConfig[status]?.label || status}
    />
  );
}
