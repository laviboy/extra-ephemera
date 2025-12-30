import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  decimal,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { listings } from "./listings";
import { conversations } from "./conversations";

// Travel group bookings - tracks travelers joining a travel group listing
export const travelGroupBookings = pgTable("travel_group_bookings", {
  id: serial("id").primaryKey(),
  listingId: text("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  travelerId: text("traveler_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  agentId: text("agent_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  conversationId: text("conversation_id").references(() => conversations.id, {
    onDelete: "set null",
  }),

  // Status: pending_payment, payment_processing, payment_failed, pending_review, joined, rejected, cancelled, confirmed
  status: text("status").notNull().default("pending_payment"),

  // Legacy payment tracking (kept for backward compatibility)
  depositAmount: integer("deposit_amount"),
  depositPaid: boolean("deposit_paid").default(false),

  // New payment tracking
  paymentTransactionId: integer("payment_transaction_id"),
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"),
  paymentRequiredAmount: decimal("payment_required_amount", {
    precision: 10,
    scale: 2,
  }),
  paymentDeadline: timestamp("payment_deadline", { withTimezone: true }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),

  // Notes
  travelerNotes: text("traveler_notes"), // Why they want to join
  agentNotes: text("agent_notes"), // Agent's internal notes

  // Timestamps
  requestedAt: timestamp("requested_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Notification types: booking_request, booking_accepted, booking_rejected,
  // deposit_required, booking_confirmed, message_received, booking_cancelled
  type: text("type").notNull(),

  title: text("title").notNull(),
  message: text("message").notNull(),

  // Link to related entities
  relatedId: text("related_id"), // booking id, conversation id, etc.
  relatedType: text("related_type"), // 'booking', 'conversation', 'message'
  actionUrl: text("action_url"), // Where to navigate when clicked

  read: boolean("read").default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Relations
export const travelGroupBookingsRelations = relations(
  travelGroupBookings,
  ({ one }) => ({
    listing: one(listings, {
      fields: [travelGroupBookings.listingId],
      references: [listings.id],
    }),
    traveler: one(users, {
      fields: [travelGroupBookings.travelerId],
      references: [users.id],
      relationName: "travelerBookings",
    }),
    agent: one(users, {
      fields: [travelGroupBookings.agentId],
      references: [users.id],
      relationName: "agentBookings",
    }),
    conversation: one(conversations, {
      fields: [travelGroupBookings.conversationId],
      references: [conversations.id],
    }),
  })
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export type TravelGroupBooking = typeof travelGroupBookings.$inferSelect;
export type NewTravelGroupBooking = typeof travelGroupBookings.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
