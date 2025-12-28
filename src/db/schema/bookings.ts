import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { bookingStatusEnum, paymentStatusEnum, timestamps } from "./base";
import { users } from "./users";
import { packages } from "./packages";

export const bookings = pgTable("bookings", {
  id: text("id").primaryKey().notNull(),
  customerId: text("customer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  agentId: text("agent_id")
    .notNull()
    .references(() => users.id, { onDelete: "set null" }),
  packageId: text("package_id").references(() => packages.id, {
    onDelete: "set null",
  }),
  status: bookingStatusEnum("status").notNull().default("pending"),
  travelDate: timestamp("travel_date", { withTimezone: true }),
  travelers: integer("travelers").default(1),
  totalAmount: integer("total_amount").notNull(),
  paidAmount: integer("paid_amount").default(0),
  paymentStatus: paymentStatusEnum("payment_status")
    .notNull()
    .default("pending"),
  notes: text("notes"),
  ...timestamps,
});

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
