import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { conversationTypeEnum, timestamps } from "./base";
import { users } from "./users";

export const conversations = pgTable("conversations", {
  id: text("id").primaryKey().notNull(),
  customerId: text("customer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  agentId: text("agent_id").references(() => users.id, {
    onDelete: "set null",
  }),
  type: conversationTypeEnum("type").notNull().default("lead"),
  subject: text("subject"),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
  ...timestamps,
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey().notNull(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  ...timestamps,
});

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
