-- ============================================================
-- Diagnostic only — run this in Supabase SQL Editor and share the
-- results (a screenshot or copy/paste of the output rows is fine).
-- This does NOT modify anything.
-- ============================================================

-- 1. Confirm the unique constraint that should prevent duplicate
--    open reminders actually exists.
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'tasks' AND indexname = 'uniq_open_reminder_per_person_kind';

-- 2. Show every birthday-related task row across all contacts, in the
--    exact order they were created, so we can see precisely what
--    happened and when.
SELECT t.id, t.person_id, p.name AS person_name, t.reminder_kind,
       t.completed, t.due_at, t.completed_at, t.created_at, t.updated_at
FROM tasks t
JOIN people p ON p.id = t.person_id
WHERE t.source_type = 'reminder'
  AND t.reminder_kind IN ('birthday', 'birthday_advance')
ORDER BY p.name, t.created_at ASC;
