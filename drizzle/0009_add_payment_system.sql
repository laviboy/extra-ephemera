-- Payment Integration Migration
-- Adds payment_transactions, payment_webhooks tables and updates travel_group_bookings

-- Create payment_transactions table to track all payment transactions
CREATE TABLE IF NOT EXISTS "payment_transactions" (
  "id" serial PRIMARY KEY NOT NULL,
  "booking_id" integer NOT NULL REFERENCES "travel_group_bookings"("id") ON DELETE CASCADE,
  "stripe_payment_intent_id" varchar(255),
  "stripe_charge_id" varchar(255),
  "amount" decimal(10, 2) NOT NULL,
  "currency" varchar(3) DEFAULT 'usd' NOT NULL,
  "type" varchar(50) NOT NULL, -- 'deposit', 'full_payment', 'refund'
  "status" varchar(50) NOT NULL, -- 'pending', 'processing', 'succeeded', 'failed', 'refunded'
  "payment_method" varchar(50), -- 'card', 'bank_transfer', etc.
  "failure_reason" text,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for payment_transactions
CREATE INDEX IF NOT EXISTS "payment_booking_idx" ON "payment_transactions" ("booking_id");
CREATE INDEX IF NOT EXISTS "payment_status_idx" ON "payment_transactions" ("status");
CREATE INDEX IF NOT EXISTS "payment_stripe_intent_idx" ON "payment_transactions" ("stripe_payment_intent_id");
CREATE INDEX IF NOT EXISTS "payment_type_idx" ON "payment_transactions" ("type");

-- Create payment_webhooks table for audit trail
CREATE TABLE IF NOT EXISTS "payment_webhooks" (
  "id" serial PRIMARY KEY NOT NULL,
  "event_id" varchar(255) UNIQUE NOT NULL,
  "event_type" varchar(100) NOT NULL,
  "payload" jsonb NOT NULL,
  "processed" boolean DEFAULT false,
  "processing_error" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for payment_webhooks
CREATE INDEX IF NOT EXISTS "webhook_event_id_idx" ON "payment_webhooks" ("event_id");
CREATE INDEX IF NOT EXISTS "webhook_processed_idx" ON "payment_webhooks" ("processed");

-- Add payment-related columns to travel_group_bookings
ALTER TABLE "travel_group_bookings" 
  ADD COLUMN IF NOT EXISTS "payment_transaction_id" integer REFERENCES "payment_transactions"("id"),
  ADD COLUMN IF NOT EXISTS "payment_status" varchar(50) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "payment_required_amount" decimal(10, 2),
  ADD COLUMN IF NOT EXISTS "payment_deadline" timestamp,
  ADD COLUMN IF NOT EXISTS "reviewed_at" timestamp;

-- Create index for payment_transaction_id
CREATE INDEX IF NOT EXISTS "booking_payment_transaction_idx" ON "travel_group_bookings" ("payment_transaction_id");
CREATE INDEX IF NOT EXISTS "booking_payment_status_idx" ON "travel_group_bookings" ("payment_status");

-- Enable realtime for payment_transactions table
ALTER PUBLICATION supabase_realtime ADD TABLE payment_transactions;

-- Comment documenting the new status values for travel_group_bookings.status:
-- 'pending_payment' - Booking created, waiting for payment
-- 'payment_processing' - Payment is being processed
-- 'payment_failed' - Payment failed
-- 'pending_review' - Payment succeeded, waiting for agent review
-- 'joined' - Agent accepted, traveler is in the group
-- 'rejected' - Agent rejected the request
-- 'cancelled' - Traveler or agent cancelled
-- 'confirmed' - Ready for trip (future use)
