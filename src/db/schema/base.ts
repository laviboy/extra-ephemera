import { pgTable, timestamp, uuid, text, boolean, jsonb, integer, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['traveler', 'agent', 'admin']);
export const agentTypeEnum = pgEnum('agent_type', ['independent', 'guide']);
export const verificationStatusEnum = pgEnum('verification_status', ['unverified', 'pending', 'verified']);
export const proposalStatusEnum = pgEnum('proposal_status', ['draft', 'sent', 'accepted', 'rejected']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'cancelled', 'completed']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'succeeded', 'failed', 'refunded']);
export const conversationTypeEnum = pgEnum('conversation_type', ['lead', 'booking', 'general']);
export const docStatusEnum = pgEnum('doc_status', ['pending', 'approved', 'rejected']);

export const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
};

export const withTimestamps = (table: any) => ({
  ...table,
  ...timestamps,
});

export const withSoftDelete = (table: any) => ({
  ...table,
  isDeleted: boolean('is_deleted').default(false).notNull(),
  deletedAt: timestamp('deleted_at'),
});
