-- ============================================================
-- Today's Prayer Topics migration
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New Query)
-- ============================================================

-- ── prayer_requests: optional one-time scheduled date ────────
ALTER TABLE prayer_requests ADD COLUMN IF NOT EXISTS scheduled_date text;
CREATE INDEX IF NOT EXISTS idx_prayers_scheduled_date ON prayer_requests(scheduled_date);

-- The prayer_followup reminder mechanism is being retired in favor of
-- Today's Prayer Topics living in the Prayer tab itself.
DELETE FROM tasks WHERE source_type = 'reminder' AND reminder_kind = 'prayer_followup';
