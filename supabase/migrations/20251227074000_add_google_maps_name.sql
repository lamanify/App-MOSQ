-- Add new columns to mosques table
ALTER TABLE mosques ADD COLUMN IF NOT EXISTS google_maps_name text;
ALTER TABLE mosques ADD COLUMN IF NOT EXISTS tiktok_url text;
ALTER TABLE mosques ADD COLUMN IF NOT EXISTS youtube_url text;
