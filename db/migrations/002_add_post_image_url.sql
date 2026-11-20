-- Add simple image_url column to posts for MVP image support
-- (The full attachments + post_attachments tables already exist for richer media later)

ALTER TABLE posts
ADD COLUMN IF NOT EXISTS image_url TEXT;
