/*
  # Create Photos and Groups Tables

  1. New Tables
    - `photos`
      - `id` (uuid, primary key) - Unique identifier for each photo
      - `user_id` (uuid, foreign key) - References auth.users
      - `title` (text) - Photo title
      - `description` (text, nullable) - Photo description
      - `file_url` (text) - URL to the stored photo file
      - `thumbnail_url` (text, nullable) - URL to thumbnail version
      - `metadata` (jsonb, nullable) - EXIF data, dimensions, etc.
      - `tags` (text array, default empty) - Photo tags
      - `ai_tags` (text array, default empty) - AI-generated tags
      - `group_id` (uuid, nullable, foreign key) - Optional group assignment
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `groups`
      - `id` (uuid, primary key) - Unique identifier for each group
      - `name` (text) - Group name
      - `description` (text, nullable) - Group description
      - `owner_id` (uuid, foreign key) - References auth.users
      - `invite_code` (text, unique, nullable) - Invite code for joining
      - `is_public` (boolean, default false) - Public visibility flag
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `group_members`
      - `id` (uuid, primary key) - Unique identifier
      - `group_id` (uuid, foreign key) - References groups
      - `user_id` (uuid, foreign key) - References auth.users
      - `role` (text, default 'member') - Member role (owner, admin, member)
      - `joined_at` (timestamptz) - Join timestamp

  2. Security
    - Enable RLS on all tables
    - Photos: Users can read own photos and photos in groups they belong to
    - Photos: Users can insert/update/delete own photos
    - Groups: Users can read groups they belong to or public groups
    - Groups: Users can update/delete groups they own
    - Group Members: Users can view members of groups they belong to
*/

CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  thumbnail_url text,
  metadata jsonb,
  tags text[] DEFAULT '{}',
  ai_tags text[] DEFAULT '{}',
  group_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invite_code text UNIQUE,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE photos ADD CONSTRAINT fk_photos_group FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_group_id ON photos(group_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_groups_owner_id ON groups(owner_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own photos"
  ON photos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view photos in their groups"
  ON photos FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own photos"
  ON photos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos"
  ON photos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON photos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view groups they belong to"
  ON groups FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
    OR is_public = true
  );

CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Group owners can update their groups"
  ON groups FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Group owners can delete their groups"
  ON groups FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can view members of groups they belong to"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can join groups"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON group_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Group owners can manage members"
  ON group_members FOR DELETE
  TO authenticated
  USING (
    group_id IN (SELECT id FROM groups WHERE owner_id = auth.uid())
  );