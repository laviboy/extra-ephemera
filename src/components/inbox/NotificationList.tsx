import {
  Bell,
  Calendar,
  MessageSquare,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface NotificationListProps {
  notifications: Notification[];
  onSelect: (notification: Notification) => void;
  selectedId?: string;
}

// Helper function to get gradient colors for notification type
const getNotificationGradient = (type: string) => {
  switch (type) {
    case "booking_status_update":
      return "from-orange-500 to-orange-600";
    case "new_message":
      return "from-blue-500 to-blue-600";
    case "payment_reminder":
      return "from-green-500 to-green-600";
    default:
      return "from-purple-500 to-purple-600";
  }
};

// Helper function to get icon component for notification type
const getNotificationIcon = (type: string) => {
  switch (type) {
    case "booking_status_update":
      return Calendar;
    case "new_message":
      return MessageSquare;
    case "payment_reminder":
      return CreditCard;
    default:
      return Bell;
  }
};

export function NotificationList({
  notifications,
  onSelect,
  selectedId,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="w-10 h-10 text-purple-500" />
        </div>
        <p className="text-slate-600 font-medium">No notifications yet</p>
        <p className="text-slate-400 text-sm mt-1">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
      {notifications.map((notification) => {
        const IconComponent = getNotificationIcon(notification.type);
        const gradient = getNotificationGradient(notification.type);
        const isSelected = selectedId === notification.id;

        return (
          <button
            key={notification.id}
            onClick={() => onSelect(notification)}
            className={`w-full text-left p-4 transition-all duration-200 hover:bg-slate-50 ${
              isSelected
                ? "bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500"
                : ""
            } ${!notification.read ? "bg-blue-50/30" : ""}`}
          >
            <div className="flex gap-3">
              {/* Icon with gradient background */}
              <div
                className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md`}
              >
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-slate-900 truncate">
                    {notification.title}
                  </h4>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notification.read && (
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                    )}
                    {(() => {
                      try {
                        const date = new Date(
                          notification.created_at.endsWith("Z")
                            ? notification.created_at
                            : notification.created_at + "Z"
                        );
                        if (isNaN(date.getTime())) return null;
                        return (
                          <span className="text-xs text-slate-400">
                            {formatDistanceToNow(date, { addSuffix: true })}
                          </span>
                        );
                      } catch {
                        return null;
                      }
                    })()}
                  </div>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {notification.message}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
