-- Add conversation_id column to travel_group_bookings table
-- This links each booking to its associated conversation for chat functionality

ALTER TABLE "travel_group_bookings" 
  ADD COLUMN IF NOT EXISTS "conversation_id" text REFERENCES "conversations"("id") ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "booking_conversation_idx" ON "travel_group_bookings" ("conversation_id");
