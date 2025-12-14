-- Add new ticket columns if they don't exist
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'active' NOT NULL;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS redeemed_at TIMESTAMP;

-- Backfill status for existing rows
UPDATE tickets SET status = 'active' WHERE status IS NULL;
