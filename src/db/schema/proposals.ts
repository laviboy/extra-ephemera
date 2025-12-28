import { pgTable, text, integer } from "drizzle-orm/pg-core";
import { proposalStatusEnum, timestamps } from "./base";
import { users } from "./users";
import { packages } from "./packages";

export const proposals = pgTable("proposals", {
  id: text("id").primaryKey().notNull(),
  customerId: text("customer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  agentId: text("agent_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  packageId: text("package_id").references(() => packages.id, {
    onDelete: "set null",
  }),
  status: proposalStatusEnum("status").notNull().default("draft"),
  title: text("title").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  validUntil: text("valid_until"),
  ...timestamps,
});

export type Proposal = typeof proposals.$inferSelect;
export type NewProposal = typeof proposals.$inferInsert;
