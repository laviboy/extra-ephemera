import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  decimal,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { travelGroupBookings } from "./travelGroupBookings";

// Payment transaction types
export type PaymentType = "deposit" | "full_payment" | "refund";
export type PaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "refunded";

// Payment transactions table - tracks all payment transactions
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => travelGroupBookings.id, { onDelete: "cascade" }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  stripeChargeId: varchar("stripe_charge_id", { length: 255 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("usd"),
  type: varchar("type", { length: 50 }).notNull().$type<PaymentType>(),
  status: varchar("status", { length: 50 }).notNull().$type<PaymentStatus>(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  failureReason: text("failure_reason"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Payment webhooks table - stores webhook events for debugging and audit trail
export const paymentWebhooks = pgTable("payment_webhooks", {
  id: serial("id").primaryKey(),
  eventId: varchar("event_id", { length: 255 }).notNull().unique(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  payload: jsonb("payload").notNull(),
  processed: boolean("processed").default(false),
  processingError: text("processing_error"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Relations
export const paymentTransactionsRelations = relations(
  paymentTransactions,
  ({ one }) => ({
    booking: one(travelGroupBookings, {
      fields: [paymentTransactions.bookingId],
      references: [travelGroupBookings.id],
    }),
  })
);

// TypeScript types for use in the application
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type NewPaymentTransaction = typeof paymentTransactions.$inferInsert;
export type PaymentWebhook = typeof paymentWebhooks.$inferSelect;
export type NewPaymentWebhook = typeof paymentWebhooks.$inferInsert;
