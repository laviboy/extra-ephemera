import { pgTable, text } from 'drizzle-orm/pg-core';
import { timestamps } from './base';
import { users } from './users';

export const companies = pgTable('companies', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  address: text('address'),
  logoId: text('logo_id'),
  adminUserId: text('admin_user_id').references(() => users.id, { onDelete: 'set null' }),
  ...timestamps,
});

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
