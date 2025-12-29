import {
  CheckCircle,
  Clock,
  Calendar,
  MessageSquare,
  CreditCard,
  Bell,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useRealtimeNotifications } from "../../hooks/useRealtimeNotifications";
import { useAuth } from "../../stores/useAuth";

interface NotificationDetailProps {
  notification: any;
}

// Helper function to get icon component and gradient
const getNotificationStyle = (type: string) => {
  switch (type) {
    case "booking_status_update":
      return {
        Icon: Calendar,
        gradient: "from-orange-500 to-orange-600",
        bgLight: "bg-orange-50",
        borderColor: "border-orange-200",
        textColor: "text-orange-900",
        textLight: "text-orange-700",
      };
    case "new_message":
      return {
        Icon: MessageSquare,
        gradient: "from-blue-500 to-blue-600",
        bgLight: "bg-blue-50",
        borderColor: "border-blue-200",
        textColor: "text-blue-900",
        textLight: "text-blue-700",
      };
    case "payment_reminder":
      return {
        Icon: CreditCard,
        gradient: "from-green-500 to-green-600",
        bgLight: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-900",
        textLight: "text-green-700",
      };
    default:
      return {
        Icon: Bell,
        gradient: "from-purple-500 to-purple-600",
        bgLight: "bg-purple-50",
        borderColor: "border-purple-200",
        textColor: "text-purple-900",
        textLight: "text-purple-700",
      };
  }
};

export function NotificationDetail({ notification }: NotificationDetailProps) {
  const user = useAuth((state) => state.user);
  const { markAsRead } = useRealtimeNotifications(user?.id || "");

  const handleMarkAsRead = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const style = getNotificationStyle(notification.type);
  const { Icon, gradient, bgLight, borderColor, textColor, textLight } = style;

  const getActionButton = () => {
    switch (notification.type) {
      case "booking_status_update":
        return (
          <Button
            asChild
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
          >
            <a
              href={`/travel-bookings/${notification.related_id}`}
              className="flex items-center gap-2"
            >
              View Booking
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        );
      case "payment_reminder":
        return (
          <Button
            asChild
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
          >
            <a
              href={`/travel-bookings/${notification.related_id}`}
              className="flex items-center gap-2"
            >
              Make Payment
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-[700px] overflow-y-auto">
      {/* Modern Header with gradient */}
      <div className={`bg-gradient-to-r ${gradient} p-6 text-white`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{notification.title}</h2>
              <p className="text-white/80 flex items-center gap-2 mt-2 text-sm">
                <Clock className="w-4 h-4" />
                {(() => {
                  try {
                    const date = new Date(
                      notification.created_at.endsWith("Z")
                        ? notification.created_at
                        : notification.created_at + "Z"
                    );
                    if (isNaN(date.getTime())) return "Recently";
                    return formatDistanceToNow(date, { addSuffix: true });
                  } catch {
                    return "Recently";
                  }
                })()}
              </p>
            </div>
          </div>
          {!notification.read && (
            <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 px-3 py-1.5">
              Unread
            </Badge>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Message Content */}
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-base">
            {notification.message}
          </p>
        </div>

        {/* Additional Details */}
        {notification.metadata && (
          <div
            className={`${bgLight} border ${borderColor} rounded-2xl p-6 shadow-sm`}
          >
            <h3
              className={`font-bold ${textColor} mb-4 flex items-center gap-2 text-lg`}
            >
              <CheckCircle className="w-5 h-5" />
              Additional Details
            </h3>
            <dl className="space-y-3">
              {Object.entries(notification.metadata).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-start gap-3 p-3 bg-white/60 rounded-lg"
                >
                  <dt
                    className={`font-semibold ${textLight} capitalize min-w-[120px]`}
                  >
                    {key.replace(/_/g, " ")}
                  </dt>
                  <dd className={`${textColor} font-medium flex-1`}>
                    {String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {!notification.read && (
            <Button
              variant="outline"
              onClick={handleMarkAsRead}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark as Read
            </Button>
          )}
          {getActionButton()}
        </div>
      </div>
    </div>
  );
}
