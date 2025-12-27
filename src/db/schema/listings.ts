import { pgTable, text, boolean, integer, doublePrecision } from 'drizzle-orm/pg-core';
import { timestamps } from './base';
import { users } from './users';

export const listings = pgTable('listings', {
  id: text('id').primaryKey().notNull(),
  creatorId: text('creator_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  destination: text('destination').notNull(),
  tags: text('tags').array(),
  priceMin: integer('price_min'),
  priceMax: integer('price_max'),
  instantBookable: boolean('instant_bookable').default(false),
  status: text('status').default('draft'),
  ...timestamps,
});

export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
