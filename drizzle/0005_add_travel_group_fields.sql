-- Add travel group fields to listings table
ALTER TABLE "listings" ADD COLUMN "start_date" timestamp;
ALTER TABLE "listings" ADD COLUMN "end_date" timestamp;
ALTER TABLE "listings" ADD COLUMN "max_group_size" integer DEFAULT 12;
ALTER TABLE "listings" ADD COLUMN "available_spots" integer DEFAULT 10;
ALTER TABLE "listings" ADD COLUMN "age_range_min" integer DEFAULT 18;
ALTER TABLE "listings" ADD COLUMN "age_range_max" integer DEFAULT 65;
ALTER TABLE "listings" ADD COLUMN "difficulty" text DEFAULT 'moderate';
ALTER TABLE "listings" ADD COLUMN "short_description" text;
ALTER TABLE "listings" ADD COLUMN "rating" double precision DEFAULT 0;
ALTER TABLE "listings" ADD COLUMN "review_count" integer DEFAULT 0;
ALTER TABLE "listings" ADD COLUMN "currency" text DEFAULT 'USD';
ALTER TABLE "listings" ADD COLUMN "included_items" jsonb DEFAULT '[]';
ALTER TABLE "listings" ADD COLUMN "not_included_items" jsonb DEFAULT '[]';
ALTER TABLE "listings" ADD COLUMN "itinerary" jsonb DEFAULT '[]';
ALTER TABLE "listings" ADD COLUMN "cancellation_policy" text;
