CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id),
  google_location_name text,
  display_name text,
  synced_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
  google_review_name text,
  author_name text,
  rating int,
  text text,
  replied boolean DEFAULT false,
  reply_text text,
  created_at timestamptz,
  synced_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid REFERENCES locations(id) ON DELETE CASCADE,
  summary text,
  media_url text,
  scheduled_at timestamptz,
  status text DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  published_at timestamptz
);

CREATE TABLE IF NOT EXISTS oauth_tokens (
  client_id uuid PRIMARY KEY,
  access_token text,
  refresh_token text,
  scope text,
  expires_at timestamptz
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text,
  resource_type text,
  resource_id text,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id uuid,
  location_id uuid,
  content text,
  embedding vector(1536)
);

CREATE INDEX IF NOT EXISTS idx_embeddings ON embeddings USING ivfflat (embedding) WITH (lists = 100);
