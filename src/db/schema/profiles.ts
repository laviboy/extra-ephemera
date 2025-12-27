import { pgTable, text, jsonb } from 'drizzle-orm/pg-core';
import { verificationStatusEnum, timestamps } from './base';
import { users } from './users';

export const profiles = pgTable('profiles', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  displayName: text('display_name'),
  bio: text('bio'),
  avatarId: text('avatar_id'),
  languages: text('languages').array(),
  location: text('location'),
  socialLinks: jsonb('social_links').$type<Record<string, string>>(),
  verificationStatus: verificationStatusEnum('verification_status').default('unverified'),
  ...timestamps,
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
