import {
  pgTable,
  text,
  boolean,
  integer,
  doublePrecision,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { timestamps } from "./base";
import { users } from "./users";

export const listings = pgTable("listings", {
  id: text("id").primaryKey().notNull(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Basic Info
  title: text("title").notNull(),
  description: text("description"),
  shortDescription: text("short_description"),
  destination: text("destination").notNull(),
  tags: text("tags").array(),

  // Pricing
  priceMin: integer("price_min"),
  priceMax: integer("price_max"),
  currency: text("currency").default("USD"),

  // Travel Group Specific Fields
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  maxGroupSize: integer("max_group_size").default(12),
  availableSpots: integer("available_spots").default(10),
  ageRangeMin: integer("age_range_min").default(18),
  ageRangeMax: integer("age_range_max").default(65),
  difficulty: text("difficulty").default("moderate"), // easy, moderate, challenging

  // Ratings & Reviews
  rating: doublePrecision("rating").default(0),
  reviewCount: integer("review_count").default(0),

  // What's Included/Not Included (stored as JSON arrays)
  includedItems: jsonb("included_items").default([]),
  notIncludedItems: jsonb("not_included_items").default([]),

  // Itinerary (stored as JSON array of day objects)
  itinerary: jsonb("itinerary").default([]),

  // Policies
  cancellationPolicy: text("cancellation_policy"),

  // Status
  instantBookable: boolean("instant_bookable").default(false),
  status: text("status").default("draft"),

  ...timestamps,
});

export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
