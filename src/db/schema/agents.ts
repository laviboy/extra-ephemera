import { pgTable, text, integer, doublePrecision } from 'drizzle-orm/pg-core';
import { agentTypeEnum, timestamps } from './base';
import { users } from './users';

// Using string literal for company reference to avoid circular dependency
export const agents = pgTable('agents', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  companyId: text('company_id'), // Will add foreign key constraint via migration
  agentType: agentTypeEnum('agent_type').notNull(),
  specialties: text('specialties').array(),
  responseTimeHours: integer('response_time_hours'),
  rating: doublePrecision('rating').default(0),
  tags: text('tags').array(),
  ...timestamps,
});

// Add foreign key constraint via migration (we'll create this next)
// ALTER TABLE agents ADD CONSTRAINT fk_company 
// FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
