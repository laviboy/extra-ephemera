-- Enable Realtime for tables
ALTER publication supabase_realtime ADD TABLE notifications;
ALTER publication supabase_realtime ADD TABLE messages;
ALTER publication supabase_realtime ADD TABLE conversations;

-- Row Level Security Policies for Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Row Level Security Policies for Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND (agent_id = auth.uid()::text OR customer_id = auth.uid()::text)
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND (agent_id = auth.uid()::text OR customer_id = auth.uid()::text)
    )
  );

-- Row Level Security Policies for Conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (agent_id = auth.uid()::text OR customer_id = auth.uid()::text);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (agent_id = auth.uid()::text OR customer_id = auth.uid()::text);

CREATE POLICY "Users can insert conversations"
  ON conversations FOR INSERT
  WITH CHECK (agent_id = auth.uid()::text OR customer_id = auth.uid()::text);
