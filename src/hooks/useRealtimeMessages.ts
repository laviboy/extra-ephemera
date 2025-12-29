import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export function useRealtimeMessages(conversationId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const MESSAGE_LIMIT = 50; // Load 50 messages at a time

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  };

  const loadMoreMessages = async () => {
    if (!conversationId || !hasMore || loading) return;

    setLoading(true);
    const oldestMessage = messages[0];
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .lt("created_at", oldestMessage?.created_at)
      .order("created_at", { ascending: false })
      .limit(MESSAGE_LIMIT);

    if (!error && data) {
      if (data.length < MESSAGE_LIMIT) {
        setHasMore(false);
      }
      setMessages((prev) => [...data.reverse(), ...prev]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    // Initial fetch - get latest 50 messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(MESSAGE_LIMIT);

      if (!error && data) {
        const reversedData = data.reverse(); // Show oldest to newest
        setMessages(reversedData);
        setHasMore(data.length === MESSAGE_LIMIT);
        setTimeout(scrollToBottom, 100);
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
          setTimeout(scrollToBottom, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return { messages, loading, messagesEndRef, hasMore, loadMoreMessages };
}
