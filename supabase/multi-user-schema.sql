-- ═══════════════════════════════════════════════════════════════
-- Remember The One — Multi-User Schema
-- Run this ONCE in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Churches ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS churches (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  join_code  text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ─── 2. User profiles (auth-linked) ─────────────────────────────
-- Replaces the old `profiles` table. Each row maps to a Supabase auth user.
CREATE TABLE IF NOT EXISTS user_profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  church_id   uuid REFERENCES churches(id) ON DELETE SET NULL,
  role        text NOT NULL DEFAULT 'pastor',
  first_name  text NOT NULL DEFAULT '',
  last_name   text NOT NULL DEFAULT '',
  title       text NOT NULL DEFAULT 'Pastor',
  campus      text NOT NULL DEFAULT '',
  phone       text NOT NULL DEFAULT '',
  email       text NOT NULL DEFAULT '',
  bio         text NOT NULL DEFAULT '',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- ─── 3. Add church + pastor columns to people ───────────────────
ALTER TABLE people ADD COLUMN IF NOT EXISTS church_id uuid REFERENCES churches(id) ON DELETE CASCADE;
ALTER TABLE people ADD COLUMN IF NOT EXISTS pastor_id uuid;

-- ─── 4. Add church + pastor columns to tasks ────────────────────
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS church_id uuid;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS pastor_id uuid;

-- ─── 5. RLS on new tables only ──────────────────────────────────
-- Existing tables (people, conversations, etc.) keep RLS disabled.
ALTER TABLE churches      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Churches: members can read their own church
DROP POLICY IF EXISTS "members_read_church"  ON churches;
DROP POLICY IF EXISTS "anyone_insert_church" ON churches;

CREATE POLICY "members_read_church"
  ON churches FOR SELECT
  USING (
    id = (SELECT church_id FROM user_profiles WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "anyone_insert_church"
  ON churches FOR INSERT
  WITH CHECK (true);

-- User profiles: read everyone in same church, manage own row
DROP POLICY IF EXISTS "read_team_profiles" ON user_profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "update_own_profile" ON user_profiles;

CREATE POLICY "read_team_profiles"
  ON user_profiles FOR SELECT
  USING (
    id = auth.uid()
    OR church_id = (SELECT church_id FROM user_profiles WHERE id = auth.uid() LIMIT 1)
  );

CREATE POLICY "insert_own_profile"
  ON user_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "update_own_profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid());

-- ─── 6. (Optional) Migrate existing contacts ────────────────────
-- After registering your church, run this with your IDs to claim
-- existing contacts. Find your church UUID in the churches table
-- and your user UUID in auth.users.
--
-- UPDATE people
--   SET church_id = '<your-church-uuid>',
--       pastor_id = '<your-auth-user-uuid>'
-- WHERE church_id IS NULL;
--
-- UPDATE tasks
--   SET church_id = '<your-church-uuid>',
--       pastor_id = '<your-auth-user-uuid>'
-- WHERE church_id IS NULL;
