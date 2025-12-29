import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export function useRealtimeConversations(userId: string) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Initial fetch with joined data
    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          *,
          listing:listing_id (
            id,
            title
          )
        `
        )
        .or(`agent_id.eq.${userId},customer_id.eq.${userId}`)
        .order("updated_at", { ascending: false });

      if (!error && data) {
        setConversations(data);
      }
      setLoading(false);
    };

    fetchConversations();

    // Subscribe to conversation updates
    const channel = supabase
      .channel("conversations-channel")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
        },
        (payload) => {
          // Check if this conversation belongs to the user
          const conv = payload.new as any;
          if (conv.agent_id === userId || conv.customer_id === userId) {
            setConversations((prev) => {
              const filtered = prev.filter((c) => c.id !== conv.id);
              return [conv, ...filtered];
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversations",
        },
        (payload) => {
          const conv = payload.new as any;
          if (conv.agent_id === userId || conv.customer_id === userId) {
            fetchConversations(); // Refetch to get joined data
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { conversations, loading };
}
