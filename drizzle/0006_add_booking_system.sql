-- Create travel_group_bookings table
CREATE TABLE IF NOT EXISTS "travel_group_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"travel_group_id" integer NOT NULL REFERENCES "travel_groups"("id") ON DELETE CASCADE,
	"traveler_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"agent_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"deposit_amount" decimal(10, 2),
	"deposit_paid" boolean DEFAULT false,
	"traveler_notes" text,
	"agent_notes" text,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"accepted_at" timestamp,
	"confirmed_at" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create booking_messages table for agent-traveler chat
CREATE TABLE IF NOT EXISTS "booking_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL REFERENCES "travel_group_bookings"("id") ON DELETE CASCADE,
	"sender_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"message" text NOT NULL,
	"read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"related_id" integer,
	"related_type" varchar(50),
	"read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "booking_traveler_idx" ON "travel_group_bookings" ("traveler_id");
CREATE INDEX IF NOT EXISTS "booking_agent_idx" ON "travel_group_bookings" ("agent_id");
CREATE INDEX IF NOT EXISTS "booking_travel_group_idx" ON "travel_group_bookings" ("travel_group_id");
CREATE INDEX IF NOT EXISTS "booking_status_idx" ON "travel_group_bookings" ("status");
CREATE INDEX IF NOT EXISTS "booking_messages_booking_idx" ON "booking_messages" ("booking_id");
CREATE INDEX IF NOT EXISTS "notifications_user_idx" ON "notifications" ("user_id");
CREATE INDEX IF NOT EXISTS "notifications_read_idx" ON "notifications" ("read");
