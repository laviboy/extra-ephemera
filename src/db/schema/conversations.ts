import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { conversationTypeEnum, timestamps } from "./base";
import { users } from "./users";
import { listings } from "./listings";

export const conversations = pgTable(
  "conversations",
  {
    id: text("id").primaryKey().notNull(),
    customerId: text("customer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    agentId: text("agent_id").references(() => users.id, {
      onDelete: "set null",
    }),
    listingId: text("listing_id").references(() => listings.id, {
      onDelete: "set null",
    }),
    type: conversationTypeEnum("type").notNull().default("lead"),
    subject: text("subject"),
    lastMessage: text("last_message"),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => ({
    customerIdIdx: index("conversations_customer_id_idx").on(table.customerId),
    agentIdIdx: index("conversations_agent_id_idx").on(table.agentId),
    listingIdIdx: index("conversations_listing_id_idx").on(table.listingId),
  })
);

export const messages = pgTable(
  "messages",
  {
    id: text("id").primaryKey().notNull(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    ...timestamps,
  },
  (table) => ({
    conversationIdIdx: index("messages_conversation_id_idx").on(
      table.conversationId
    ),
    conversationCreatedIdx: index("messages_conversation_created_idx").on(
      table.conversationId,
      table.createdAt
    ),
  })
);

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
