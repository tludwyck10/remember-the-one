-- ============================================================
-- One-time cleanup: remove duplicate open birthday reminders that were
-- created by the now-fixed same-day rollover bug. Keeps the completed
-- copy (so the "wished them happy birthday" record stays), deletes the
-- duplicate open one that incorrectly reappeared.
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New Query)
-- ============================================================

DELETE FROM tasks t
WHERE t.source_type = 'reminder'
  AND t.reminder_kind IN ('birthday', 'birthday_advance')
  AND t.completed = false
  AND EXISTS (
    SELECT 1 FROM tasks t2
    WHERE t2.person_id = t.person_id
      AND t2.reminder_kind = t.reminder_kind
      AND t2.source_type = 'reminder'
      AND t2.completed = true
      AND extract(year from t2.due_at) = extract(year from t.due_at)
  );
