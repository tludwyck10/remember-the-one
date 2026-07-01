-- Add serve_teams list to churches
ALTER TABLE churches
  ADD COLUMN IF NOT EXISTS serve_teams text[] DEFAULT ARRAY[]::text[];

UPDATE churches SET serve_teams = ARRAY[]::text[] WHERE serve_teams IS NULL;

-- Add serve_team to individual people
ALTER TABLE people
  ADD COLUMN IF NOT EXISTS serve_team text DEFAULT NULL;
