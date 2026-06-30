-- ============================================================
-- Dedupe duplicate auto-generated reminder tasks + prevent recurrence
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New Query)
-- ============================================================

-- Step 1: For one-shot reminder kinds (new connection sequence + promote/archive),
-- there should only ever be ONE row per (person, kind), ever. Keep a completed
-- one if any duplicate was already completed (preserves progress); otherwise
-- keep the earliest-created row.
WITH ranked AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY person_id, reminder_kind
           ORDER BY completed DESC, created_at ASC
         ) AS rn
  FROM tasks
  WHERE source_type = 'reminder'
    AND reminder_kind IN ('new_connection_1', 'new_connection_2', 'promote_or_archive')
)
DELETE FROM tasks WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Step 2: For cadence reminders, only OPEN (uncompleted) ones must be unique per
-- person — completed cadence tasks are kept as history.
WITH ranked AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY person_id
           ORDER BY created_at ASC
         ) AS rn
  FROM tasks
  WHERE source_type = 'reminder' AND reminder_kind = 'cadence' AND completed = false
)
DELETE FROM tasks WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Step 3: Prevent this from ever happening again — a database-level guarantee
-- that only one OPEN reminder of a given kind can exist per contact at a time.
-- Concurrent inserts from multiple tabs/devices will now fail safely instead
-- of creating a duplicate row.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_open_reminder_per_person_kind
  ON tasks(person_id, reminder_kind)
  WHERE source_type = 'reminder' AND completed = false;
