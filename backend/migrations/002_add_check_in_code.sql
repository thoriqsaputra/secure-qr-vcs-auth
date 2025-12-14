ALTER TABLE tickets ADD COLUMN IF NOT EXISTS check_in_code VARCHAR(16);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_check_in_code ON tickets(check_in_code);
