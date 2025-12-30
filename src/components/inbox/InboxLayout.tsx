import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { NotificationList } from "./NotificationList";
import { ConversationList } from "./ConversationList";
import { NotificationDetail } from "./NotificationDetail";
import { ChatView } from "./ChatView";
import { useAuth } from "../../stores/useAuth";
import { useRealtimeNotifications } from "../../hooks/useRealtimeNotifications";
import { useRealtimeConversations } from "../../hooks/useRealtimeConversations";
import { Inbox, Loader2, Bell, MessageCircle, Calendar } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

export function InboxLayout() {
  const user = useAuth((state) => state.user);
  const { notifications, loading } = useRealtimeNotifications(user?.id || "");
  const { conversations, loading: loadingConversations } =
    useRealtimeConversations(user?.id || "");

  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const bookingNotifications = notifications.filter(
    (n) => n.type === "booking_status_update"
  );

  // Auto-select conversation from URL parameter (like CRM does)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get("conversation");

    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (conversation) {
        setSelectedTab("messages");
        setSelectedConversation(conversation);
        // Clean up URL without refreshing the page
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [conversations]);

  // Reset selected items when tab changes manually
  const handleTabChange = (newTab: string) => {
    setSelectedTab(newTab);
    setSelectedNotification(null);
    setSelectedConversation(null);
  };

  if (loading || loadingConversations) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Modern Header with gradient */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Inbox className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Inbox</h1>
              <p className="text-blue-100 text-sm">
                Your notifications and messages in one place
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 px-4 py-2 text-base font-semibold">
              {unreadCount} unread
            </Badge>
          )}
        </div>
      </div>

      <Tabs
        value={selectedTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        {/* Modern Tabs */}
        <div className="bg-white rounded-xl shadow-md p-2 mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-lg">
            <TabsTrigger
              value="all"
              className="relative data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <Bell className="w-4 h-4 mr-2" />
              All
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-blue-500 text-white text-xs h-5 min-w-5 rounded-full px-1.5">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="relative data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Bookings
              {bookingNotifications.filter((n) => !n.read).length > 0 && (
                <Badge className="ml-2 bg-orange-500 text-white text-xs h-5 min-w-5 rounded-full px-1.5">
                  {bookingNotifications.filter((n) => !n.read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="relative data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT PANEL */}
          <div className="lg:col-span-1">
            <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
              <TabsContent value="all" className="m-0">
                <NotificationList
                  notifications={notifications}
                  onSelect={(notif) => {
                    setSelectedNotification(notif);
                    setSelectedConversation(null);
                  }}
                  selectedId={selectedNotification?.id}
                />
              </TabsContent>

              <TabsContent value="bookings" className="m-0">
                <NotificationList
                  notifications={bookingNotifications}
                  onSelect={(notif) => {
                    setSelectedNotification(notif);
                    setSelectedConversation(null);
                  }}
                  selectedId={selectedNotification?.id}
                />
              </TabsContent>

              <TabsContent value="messages" className="m-0">
                <ConversationList
                  userId={user?.id || ""}
                  onSelect={(conv) => {
                    setSelectedConversation(conv);
                    setSelectedNotification(null);
                  }}
                  selectedId={selectedConversation?.id}
                />
              </TabsContent>
            </Card>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
              {selectedTab === "messages" && selectedConversation ? (
                <ChatView conversationId={selectedConversation.id} />
              ) : selectedNotification ? (
                <NotificationDetail notification={selectedNotification} />
              ) : (
                <div className="flex flex-col items-center justify-center h-[700px] bg-gradient-to-b from-slate-50 to-white">
                  <div className="text-center max-w-md">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Inbox className="w-16 h-16 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                      Select an item
                    </h3>
                    <p className="text-slate-500">
                      Choose a notification or conversation from the list to
                      view details
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
