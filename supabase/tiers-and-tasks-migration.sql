-- ============================================================
-- Closeness Tiers + Tasks/Reminders migration
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New Query)
-- ============================================================

-- ── people: new columns ──────────────────────────────────────
ALTER TABLE people ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz;
ALTER TABLE people ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;

-- Backfill last_contacted_at from the existing text date column (falls back to created_at)
UPDATE people
SET last_contacted_at = COALESCE(NULLIF(last_contact, '')::timestamptz, created_at)
WHERE last_contacted_at IS NULL;

-- ── circle rename (backward-compatible data migration) ───────
UPDATE people SET circle = 'Disciples'            WHERE circle = 'Growth Circle';
UPDATE people SET circle = 'Active Relationships' WHERE circle = 'Community Circle';
ALTER TABLE people ALTER COLUMN circle SET DEFAULT 'New Connections';

-- ── Inner Circle cap: max 5 per pastor ────────────────────────
CREATE OR REPLACE FUNCTION enforce_inner_circle_cap()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  cnt int;
BEGIN
  IF NEW.circle = 'Inner Circle' THEN
    SELECT count(*) INTO cnt FROM people
      WHERE circle = 'Inner Circle' AND pastor_id = NEW.pastor_id AND id <> NEW.id;
    IF cnt >= 5 THEN
      RAISE EXCEPTION 'Inner Circle is full (max 5). Move someone out first.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_inner_circle_cap ON people;
CREATE TRIGGER trg_inner_circle_cap
  BEFORE INSERT OR UPDATE OF circle ON people
  FOR EACH ROW EXECUTE FUNCTION enforce_inner_circle_cap();

-- ── tasks: new columns for sourcing, reminders, due dates ────
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'manual';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS source_id text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_kind text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed boolean NOT NULL DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_at timestamptz;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS snoozed_until timestamptz;

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_source_type_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_source_type_check
  CHECK (source_type IN ('manual', 'reminder', 'prayer_request', 'life_event'));

-- Backfill completed + due_at from the old category/date text fields
UPDATE tasks SET completed = true, completed_at = updated_at
  WHERE category = 'Completed' AND completed = false;
UPDATE tasks SET due_at = NULLIF(date, '')::timestamptz
  WHERE due_at IS NULL AND date <> '';

CREATE INDEX IF NOT EXISTS idx_tasks_due_at  ON tasks(due_at);
CREATE INDEX IF NOT EXISTS idx_tasks_source  ON tasks(source_type, source_id);
