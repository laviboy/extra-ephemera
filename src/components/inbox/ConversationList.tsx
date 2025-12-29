import { MessageCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRealtimeConversations } from "../../hooks/useRealtimeConversations";
import { Badge } from "../ui/badge";

interface ConversationListProps {
  userId: string;
  onSelect: (conversation: any) => void;
  selectedId?: string;
}

// Helper function to get initials from name or title
const getInitials = (title?: string) => {
  if (title) {
    return title
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return "T";
};

// Helper function to get a consistent color for a conversation
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

export function ConversationList({
  userId,
  onSelect,
  selectedId,
}: ConversationListProps) {
  const { conversations, loading } = useRealtimeConversations(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-10 h-10 text-blue-500" />
        </div>
        <p className="text-slate-600 font-medium">No conversations yet</p>
        <p className="text-slate-400 text-sm mt-1">
          Start chatting with travelers
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
      {conversations.map((conversation) => {
        const avatarColor = getAvatarColor(conversation.id);
        const initials = getInitials(
          conversation.listing?.title || conversation.subject
        );
        const isSelected = selectedId === conversation.id;

        return (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation)}
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
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {conversation.unread_count > 0 && (
                      <Badge className="bg-blue-500 text-white text-xs h-5 min-w-5 rounded-full px-1.5">
                        {conversation.unread_count}
                      </Badge>
                    )}
                    {conversation.updated_at && (
                      <span className="text-xs text-slate-400">
                        {formatDistanceToNow(
                          new Date(
                            conversation.updated_at.endsWith("Z")
                              ? conversation.updated_at
                              : conversation.updated_at + "Z"
                          ),
                          {
                            addSuffix: true,
                          }
                        )}
                      </span>
                    )}
                  </div>
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
      })}
    </div>
  );
}
