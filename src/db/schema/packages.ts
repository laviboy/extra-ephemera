import { pgTable, text, integer, jsonb } from 'drizzle-orm/pg-core';
import { timestamps } from './base';
import { listings } from './listings';

export const packages = pgTable('packages', {
  id: text('id').primaryKey().notNull(),
  listingId: text('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  days: integer('days').notNull(),
  price: integer('price').notNull(),
  inclusions: jsonb('inclusions').$type<Record<string, unknown>>(),
  imageIds: text('image_ids').array(),
  ...timestamps,
});

export type Package = typeof packages.$inferSelect;
export type NewPackage = typeof packages.$inferInsert;
