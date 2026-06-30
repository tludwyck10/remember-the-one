-- ============================================================
-- Rename tier label "Disciples" -> "Discipling" for existing contacts
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New Query)
-- ============================================================

UPDATE people SET circle = 'Discipling' WHERE circle = 'Disciples';
