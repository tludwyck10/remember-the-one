-- ============================================================
-- Birthday field + birthday reminders migration
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New Query)
-- ============================================================

ALTER TABLE people ADD COLUMN IF NOT EXISTS birthday date;
