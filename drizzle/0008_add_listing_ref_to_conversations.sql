-- Add listing_id to conversations to link to travel groups
ALTER TABLE conversations ADD COLUMN listing_id TEXT;
ALTER TABLE conversations ADD COLUMN last_message TEXT;

-- Add foreign key constraint
ALTER TABLE conversations ADD CONSTRAINT conversations_listing_id_fkey 
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL;
