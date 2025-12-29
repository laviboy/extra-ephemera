# Traveler Inbox Implementation - Real-time Notifications & Messages

## 🎨 UX/UI Design Concept

### Page: `/inbox`
A unified communication center with **two-column layout**:

```
┌─────────────────────────────────────────────────────────────┐
│  Header: "Inbox" | Tabs: [All] [Bookings] [Messages]       │
├──────────────────────┬──────────────────────────────────────┤
│  LEFT SIDEBAR        │  RIGHT PANEL                         │
│  (List View)         │  (Detail View)                       │
│                      │                                      │
│  ┌────────────────┐  │  ┌────────────────────────────────┐ │
│  │ 🔴 Unread (3)  │  │  │  [Selected Item Details]       │ │
│  │ Item 1         │  │  │                                │ │
│  │ Item 2 ◀────────────┼─►│  • Notification details      │ │
│  │ Item 3         │  │  │  • Or chat interface           │ │
│  └────────────────┘  │  │  • Action buttons              │ │
│                      │  └────────────────────────────────┘ │
│  Filters:            │                                      │
│  ☑ Show unread only  │                                      │
│  📅 Date filter      │                                      │
└──────────────────────┴──────────────────────────────────────┘
```

### Features:
- **Tab 1 - All**: Mixed view of notifications + messages (chronological)
- **Tab 2 - Bookings**: Booking-related notifications only
- **Tab 3 - Messages**: Conversations with agents

### Real-time Indicators:
- 🔴 Red dot for unread items
- Badge count on notification bell (updates instantly)
- Toast notification when new message/notification arrives
- Auto-scroll to new messages in open chat

---

## 🏗️ Architecture

### Real-time Strategy:
**Use Supabase Realtime subscriptions** (no Zustand needed for real-time)
- Subscribe to `notifications` table: `INSERT` events
- Subscribe to `messages` table: `INSERT` events  
- Subscribe to `conversations` table: `UPDATE` events (last_message updates)

### Why Supabase Direct Queries?
✅ Real-time subscriptions work directly with Supabase client
✅ Faster - no API middleware
✅ Row-level security (RLS) on database tables
✅ Built-in auth integration

---

## 📁 File Structure

```
src/
├── pages/
│   └── inbox.astro                    # Main inbox page
├── components/
│   └── inbox/
│       ├── InboxLayout.tsx            # Main container with tabs
│       ├── NotificationList.tsx       # Left panel: notifications
│       ├── ConversationList.tsx       # Left panel: conversations
│       ├── NotificationDetail.tsx     # Right panel: notification view
│       ├── ChatView.tsx               # Right panel: chat interface
│       └── InboxFilters.tsx           # Filter controls
└── hooks/
    ├── useRealtimeNotifications.ts    # Supabase subscription hook
    ├── useRealtimeMessages.ts         # Supabase subscription hook
    └── useUnreadCount.ts              # Real-time unread badge count
```

---

## 🔧 Implementation Steps

### 1. Database RLS Policies (Supabase Dashboard)

```sql
-- Notifications: Users can only see their own
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Messages: Users can see messages in their conversations
CREATE POLICY "Users can view conversation messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND (agent_id = auth.uid() OR traveler_id = auth.uid())
    )
  );

-- Conversations: Users can see their own conversations
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (agent_id = auth.uid() OR traveler_id = auth.uid());
```

### 2. Supabase Realtime Hook - Notifications

```typescript
// src/hooks/useRealtimeNotifications.ts
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export function useRealtimeNotifications(userId: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setNotifications(data);
      }
      setLoading(false);
    };

    fetchNotifications();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("notifications-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
          // Optional: Show toast notification
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === payload.new.id ? payload.new : n))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { notifications, loading };
}
```

### 3. Supabase Realtime Hook - Messages

```typescript
// src/hooks/useRealtimeMessages.ts
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export function useRealtimeMessages(conversationId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) return;

    // Initial fetch
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          // Auto-scroll to bottom
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return { messages, loading };
}
```

### 4. Unread Count Hook (Real-time Badge)

```typescript
// src/hooks/useUnreadCount.ts
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export function useUnreadCount(userId: string) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Fetch initial count
    const fetchCount = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      setUnreadCount(count || 0);
    };

    fetchCount();

    // Subscribe to changes
    const channel = supabase
      .channel("unread-count")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Refetch count on any change
          fetchCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return unreadCount;
}
```

### 5. Updated NotificationBell Component

```typescript
// src/components/layout/NotificationBell.tsx
import { Bell } from "lucide-react";
import { useUnreadCount } from "../../hooks/useUnreadCount";
import { useAuth } from "../../stores/useAuth";

export function NotificationBell() {
  const user = useAuth((state) => state.user);
  const unreadCount = useUnreadCount(user?.id || "");

  return (
    <a
      href="/inbox"
      className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
    >
      <Bell className="w-5 h-5 text-slate-700" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </a>
  );
}
```

### 6. Main Inbox Layout Component

```typescript
// src/components/inbox/InboxLayout.tsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { NotificationList } from "./NotificationList";
import { ConversationList } from "./ConversationList";
import { NotificationDetail } from "./NotificationDetail";
import { ChatView } from "./ChatView";
import { useAuth } from "../../stores/useAuth";
import { useRealtimeNotifications } from "../../hooks/useRealtimeNotifications";

export function InboxLayout() {
  const user = useAuth((state) => state.user);
  const { notifications, loading } = useRealtimeNotifications(user?.id || "");
  
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Inbox</h1>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* LEFT PANEL */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border">
            <TabsContent value="all">
              <NotificationList
                notifications={notifications}
                onSelect={setSelectedNotification}
                selectedId={selectedNotification?.id}
              />
            </TabsContent>
            
            <TabsContent value="bookings">
              <NotificationList
                notifications={notifications.filter(
                  (n) => n.type === "booking_status_update"
                )}
                onSelect={setSelectedNotification}
                selectedId={selectedNotification?.id}
              />
            </TabsContent>

            <TabsContent value="messages">
              <ConversationList
                userId={user?.id || ""}
                onSelect={setSelectedConversation}
                selectedId={selectedConversation?.id}
              />
            </TabsContent>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border min-h-[600px]">
            {selectedTab === "messages" && selectedConversation ? (
              <ChatView conversationId={selectedConversation.id} />
            ) : selectedNotification ? (
              <NotificationDetail notification={selectedNotification} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                Select an item to view details
              </div>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
```

### 7. Chat View Component with Real-time

```typescript
// src/components/inbox/ChatView.tsx
import { useState } from "react";
import { Send } from "lucide-react";
import { useRealtimeMessages } from "../../hooks/useRealtimeMessages";
import { useAuth } from "../../stores/useAuth";
import { createClient } from "@supabase/supabase-js";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export function ChatView({ conversationId }: { conversationId: string }) {
  const user = useAuth((state) => state.user);
  const { messages, loading } = useRealtimeMessages(conversationId);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user?.id,
        content: newMessage,
      });

      if (!error) {
        setNewMessage("");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender_id === user?.id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                msg.sender_id === user?.id
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 text-slate-900"
              }`}
            >
              <p>{msg.content}</p>
              <span className="text-xs opacity-70">
                {new Date(msg.created_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t p-4 flex gap-2">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button onClick={handleSend} disabled={sending || !newMessage.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
```

---

## 🎯 Key Benefits

1. **Real-time Everything**: Badge count, notifications, and messages update instantly
2. **No Polling**: Supabase Realtime pushes updates (more efficient than polling)
3. **No Zustand Needed**: Supabase subscriptions handle state internally
4. **Unified UX**: Single page for all communications
5. **Security**: RLS policies ensure users only see their data
6. **Scalable**: Direct Supabase queries are faster than API middleware

---

## 📋 Next Steps

1. Create Supabase RLS policies
2. Implement hooks (useRealtimeNotifications, useRealtimeMessages, useUnreadCount)
3. Build UI components (InboxLayout, ChatView, etc.)
4. Update NotificationBell to use real-time count
5. Create `/inbox.astro` page
6. Test real-time updates with multiple browser tabs

Ready to implement? 🚀
