import { pgTable, text, integer, index } from "drizzle-orm/pg-core";
import { timestamps } from "./base";
import { listings } from "./listings";

export const images = pgTable(
  "images",
  {
    id: text("id").primaryKey().notNull(),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    url: text("url").notNull(), // Public URL from Supabase storage
    storagePath: text("storage_path").notNull(), // Path in Supabase storage bucket
    caption: text("caption"),
    displayOrder: integer("display_order").default(0),
    ...timestamps,
  },
  (table) => ({
    listingIdIdx: index("images_listing_id_idx").on(table.listingId),
  })
);

export type Image = typeof images.$inferSelect;
export type NewImage = typeof images.$inferInsert;
