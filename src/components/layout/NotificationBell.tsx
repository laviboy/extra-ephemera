import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../stores/useAuth";
import { useUnreadCount } from "../../hooks/useUnreadCount";
import { useRealtimeNotifications } from "../../hooks/useRealtimeNotifications";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export default function NotificationBell() {
  const user = useAuth((state) => state.user);
  const unreadCount = useUnreadCount(user?.id || "");
  const { notifications, loading } = useRealtimeNotifications(user?.id || "");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: any) => {
    // Mark as read if unread
    if (!notification.read) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notification.id);
    }

    setIsOpen(false);

    // Check if user is agent
    const { data: agent } = await supabase
      .from("agents")
      .select("id")
      .eq("user_id", user?.id)
      .single();

    const isAgent = !!agent;

    // Navigate based on role and action URL
    if (notification.action_url) {
      window.location.href = notification.action_url;
    } else if (notification.type === "new_message") {
      // For messages, route based on role
      window.location.href = isAgent ? "/crm/messages" : "/inbox";
    } else {
      // Default to inbox for travelers, CRM for agents
      window.location.href = isAgent ? "/crm" : "/inbox";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking_status_update":
        return "📅";
      case "new_message":
        return "💬";
      case "payment_reminder":
        return "💳";
      default:
        return "🔔";
    }
  };

  // Limit to 10 notifications
  const recentNotifications = notifications.slice(0, 10);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-rose-600 hover:bg-slate-50 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />

        {/* Unread Count Badge - Real-time */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-md bg-white rounded-lg shadow-xl border border-slate-200 z-[9999] overflow-hidden"
          style={{ position: "absolute" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-slate-500">
                {unreadCount} unread
              </span>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0 ${
                    !notification.read ? "bg-rose-50/30" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="flex-shrink-0 w-2 h-2 bg-rose-500 rounded-full mt-1.5"></div>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {(() => {
                          try {
                            const date = new Date(notification.created_at);
                            if (isNaN(date.getTime())) return "Recently";
                            return formatDistanceToNow(date, {
                              addSuffix: true,
                            });
                          } catch {
                            return "Recently";
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
            <button
              onClick={() => {
                setIsOpen(false);
                window.location.href = "/inbox";
              }}
              className="w-full text-center text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
