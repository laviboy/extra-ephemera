import { useState, useEffect } from "react";
import { useAuth } from "../../../../stores/useAuth";
import { useRealtimeConversations } from "../../../../hooks/useRealtimeConversations";
import { useRealtimeMessages } from "../../../../hooks/useRealtimeMessages";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Textarea } from "../../../ui/textarea";
import { Badge } from "../../../ui/badge";
import {
  Send,
  MessageCircle,
  Loader2,
  User,
  MapPin,
  Calendar,
  Users,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

// Helper function to get initials from name or email
const getInitials = (name?: string, email?: string) => {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "U";
};

// Helper function to get a consistent color for a user
const getAvatarColor = (id: string) => {
  const colors = [
    "from-blue-500 to-blue-600",
    "from-purple-500 to-purple-600",
    "from-pink-500 to-pink-600",
    "from-green-500 to-green-600",
    "from-orange-500 to-orange-600",
    "from-teal-500 to-teal-600",
    "from-indigo-500 to-indigo-600",
    "from-rose-500 to-rose-600",
  ];
  const index = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

export function ConversationsPage() {
  const user = useAuth((state) => state.user);
  const { conversations, loading: loadingConversations } =
    useRealtimeConversations(user?.id || "");
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const {
    messages,
    loading: loadingMessages,
    messagesEndRef,
  } = useRealtimeMessages(selectedConversation?.id || "");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);

  // Auto-select conversation from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get("conversation");

    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
      }
    }
  }, [conversations]);

  // Fetch participants when conversation changes
  useEffect(() => {
    if (!selectedConversation?.id) {
      setParticipants([]);
      return;
    }

    const fetchParticipants = async () => {
      // Fetch unique participants from messages
      const { data: messagesData, error: msgError } = await supabase
        .from("messages")
        .select("sender_id")
        .eq("conversation_id", selectedConversation.id);

      if (messagesData && !msgError) {
        // Get unique sender IDs
        const uniqueSenderIds = [
          ...new Set(messagesData.map((m) => m.sender_id)),
        ];

        // Fetch user details for all unique senders
        const { data: usersData } = await supabase
          .from("users")
          .select("id, email, name")
          .in("id", uniqueSenderIds);

        if (usersData) {
          setParticipants(usersData);
        }
      }
    };

    fetchParticipants();
  }, [selectedConversation?.id, messages]);

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const messageId = `msg_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const { error } = await supabase.from("messages").insert({
        id: messageId,
        conversation_id: selectedConversation.id,
        sender_id: user?.id,
        content: newMessage.trim(),
      });

      if (!error) {
        setNewMessage("");

        // Update conversation's last message
        await supabase
          .from("conversations")
          .update({
            last_message: newMessage.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedConversation.id);

        // Send notification to the other party
        const recipientId =
          selectedConversation.agent_id === user?.id
            ? selectedConversation.customer_id
            : selectedConversation.agent_id;

        if (recipientId) {
          const { error: notifError } = await supabase
            .from("notifications")
            .insert({
              user_id: recipientId,
              type: "new_message",
              title: "New Message",
              message: `You have a new message about: ${
                selectedConversation.listing?.title || "your booking"
              }`,
              related_id: selectedConversation.id,
              related_type: "conversation",
              action_url: `/inbox?conversation=${selectedConversation.id}`,
              read: false,
            });

          if (notifError) {
            console.error("Failed to create notification:", notifError);
          }
        }
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  if (loadingConversations) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Messages</h1>
            <p className="text-blue-100 text-sm">
              {conversations.length} active conversation
              {conversations.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List - Modern sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-200 pb-4">
              <CardTitle className="flex items-center justify-between text-slate-800">
                <span className="text-lg">Conversations</span>
                <Badge variant="secondary" className="font-semibold">
                  {conversations.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 overflow-y-auto max-h-[600px]">
                {conversations.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-10 h-10 text-blue-500" />
                    </div>
                    <p className="text-slate-600 font-medium">
                      No conversations yet
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      Start chatting with travelers
                    </p>
                  </div>
                ) : (
                  conversations.map((conversation) => {
                    const otherUserId =
                      conversation.agent_id === user?.id
                        ? conversation.customer_id
                        : conversation.agent_id;
                    const avatarColor = getAvatarColor(otherUserId);
                    const initials = getInitials(
                      undefined,
                      conversation.listing?.title
                    );
                    const isSelected =
                      selectedConversation?.id === conversation.id;

                    return (
                      <button
                        key={conversation.id}
                        onClick={() => handleSelectConversation(conversation)}
                        className={`w-full text-left p-4 transition-all duration-200 hover:bg-slate-50 ${
                          isSelected
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500"
                            : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Avatar with initials */}
                          <div
                            className={`relative w-12 h-12 bg-gradient-to-br ${avatarColor} rounded-xl flex items-center justify-center text-white font-semibold text-base flex-shrink-0 shadow-md`}
                          >
                            {initials}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-semibold text-sm text-slate-900 truncate">
                                {conversation.listing?.title ||
                                  conversation.subject ||
                                  "Conversation"}
                              </h4>
                              {conversation.updated_at && (
                                <span className="text-xs text-slate-400 ml-2 flex-shrink-0">
                                  {formatDistanceToNow(
                                    new Date(
                                      conversation.updated_at.endsWith("Z")
                                        ? conversation.updated_at
                                        : conversation.updated_at + "Z"
                                    ),
                                    { addSuffix: true }
                                  )}
                                </span>
                              )}
                            </div>
                            {conversation.last_message && (
                              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                {conversation.last_message}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area - Modern glass-morphism style */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
            {selectedConversation ? (
              <div className="flex flex-col h-[700px]">
                {/* Chat Header with gradient and profile info */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(
                          selectedConversation.agent_id === user?.id
                            ? selectedConversation.customer_id
                            : selectedConversation.agent_id
                        )} rounded-xl flex items-center justify-center text-white font-semibold shadow-lg`}
                      >
                        {getInitials(
                          undefined,
                          selectedConversation.listing?.title
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">
                          {selectedConversation.listing?.title ||
                            selectedConversation.subject}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-slate-300 text-xs">
                            <User className="w-3 h-3" />
                            Travel Booking
                          </span>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-400 text-xs font-medium">
                              Online
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowParticipants(!showParticipants)}
                        className="text-white hover:bg-white/20 hover:text-white"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Participants
                      </Button>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Participants Panel with Animation */}
                {showParticipants && participants.length > 0 && (
                  <div className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200 p-4 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-2 mb-3 animate-in fade-in duration-500">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-semibold text-slate-800">
                        Chat Participants ({participants.length})
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {participants.map((participant: any, index: number) => (
                        <div
                          key={participant.id}
                          className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-2"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                              {participant.name?.charAt(0)?.toUpperCase() ||
                                participant.email.charAt(0).toUpperCase()}
                            </div>
                            {participant.id === user?.id && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-blue-50 border-blue-200 text-blue-700 animate-pulse"
                              >
                                You
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {participant.name || "No name"}
                          </p>
                          <p className="text-xs text-slate-600 truncate">
                            {participant.email}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages - Modern bubble design */}
                <CardContent className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-50 to-white">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">
                          Loading messages...
                        </p>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-12 h-12 text-blue-500" />
                      </div>
                      <p className="text-slate-600 font-semibold text-lg">
                        Start the conversation!
                      </p>
                      <p className="text-slate-400 text-sm mt-2">
                        Send a message to get started
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, index) => {
                        const isOwn = msg.sender_id === user?.id;
                        const showAvatar =
                          index === 0 ||
                          messages[index - 1]?.sender_id !== msg.sender_id;

                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-3 ${
                              isOwn ? "justify-end" : "justify-start"
                            } ${!showAvatar && !isOwn ? "ml-12" : ""}`}
                          >
                            {/* Avatar for received messages */}
                            {!isOwn && showAvatar && (
                              <div
                                className={`w-8 h-8 bg-gradient-to-br ${getAvatarColor(
                                  msg.sender_id
                                )} rounded-lg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-md`}
                              >
                                {getInitials(undefined, "T")}
                              </div>
                            )}
                            {!isOwn && !showAvatar && (
                              <div className="w-8"></div>
                            )}

                            <div
                              className={`group max-w-[70%] ${
                                isOwn ? "order-1" : ""
                              }`}
                            >
                              <div
                                className={`rounded-2xl px-4 py-3 shadow-sm ${
                                  isOwn
                                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm"
                                    : "bg-white text-slate-900 border border-slate-200 rounded-bl-sm"
                                }`}
                              >
                                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                  {msg.content}
                                </p>
                              </div>
                              <div
                                className={`flex items-center gap-1 mt-1 px-2 ${
                                  isOwn ? "justify-end" : "justify-start"
                                }`}
                              >
                                <span
                                  className={`text-xs ${
                                    isOwn ? "text-slate-400" : "text-slate-400"
                                  }`}
                                >
                                  {formatDistanceToNow(
                                    new Date(
                                      msg.created_at.endsWith("Z")
                                        ? msg.created_at
                                        : msg.created_at + "Z"
                                    ),
                                    {
                                      addSuffix: true,
                                    }
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Avatar for sent messages */}
                            {isOwn && showAvatar && (
                              <div
                                className={`w-8 h-8 bg-gradient-to-br ${getAvatarColor(
                                  user?.id || ""
                                )} rounded-lg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-md`}
                              >
                                {getInitials(
                                  user?.user_metadata?.full_name,
                                  user?.email
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </CardContent>

                {/* Message Input - Modern floating design */}
                <div className="border-t border-slate-200 p-4 bg-white">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1 relative">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="resize-none rounded-xl border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all pr-12 min-h-[56px] max-h-32"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <p className="absolute bottom-2 left-3 text-xs text-slate-400">
                        Press{" "}
                        <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">
                          Enter
                        </kbd>{" "}
                        to send
                      </p>
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim()}
                      size="lg"
                      className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <CardContent className="flex flex-col items-center justify-center h-[700px] bg-gradient-to-b from-slate-50 to-white">
                <div className="text-center max-w-md">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-16 h-16 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-slate-500">
                    Choose a conversation from the list to start chatting with
                    travelers
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
