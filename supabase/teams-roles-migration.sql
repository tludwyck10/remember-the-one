-- Add position column to user_profiles for custom role title (e.g. "Lead Pastor", "Youth Director")
-- Keeps the existing 'role' column strictly for access control ('admin' | 'pastor')
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS position text;

-- Migrate any users whose role column was set to a custom title instead of 'admin'/'pastor'
UPDATE user_profiles
SET position = role, role = 'pastor'
WHERE role NOT IN ('admin', 'pastor')
  AND role IS NOT NULL
  AND role != '';

-- Add configurable role lists to churches
ALTER TABLE churches
  ADD COLUMN IF NOT EXISTS pastoral_roles text[]
    DEFAULT ARRAY['Lead Pastor', 'Assistant Pastor', 'Worship Pastor'];

ALTER TABLE churches
  ADD COLUMN IF NOT EXISTS leadership_roles text[] DEFAULT ARRAY[]::text[];

-- Back-fill existing churches that have null (default constraint only applies to new rows)
UPDATE churches
SET pastoral_roles = ARRAY['Lead Pastor', 'Assistant Pastor', 'Worship Pastor']
WHERE pastoral_roles IS NULL;

UPDATE churches
SET leadership_roles = ARRAY[]::text[]
WHERE leadership_roles IS NULL;
