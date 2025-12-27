import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { userRoleEnum, timestamps } from "./base";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").unique().notNull(),
  role: userRoleEnum("role").notNull(),
  name: text("name"),
  phone: text("phone"),
  lastSeen: timestamp("last_seen", { withTimezone: true }),
  locale: text("locale").default("en"),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  ...timestamps,
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
